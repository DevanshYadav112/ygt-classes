const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Turso Cloud SQLite Configuration
const TURSO_URL = process.env.TURSO_DATABASE_URL || 'https://ygt-classes-devanshyadav112.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM1OTgwNzcsImlkIjoiMDFhMTlhYzUtNWIwMS03YWRjLWI3ZTctOWM3MWFjZTJlNzVlIiwia2lkIjoiOTYxbm5Uemx5YUg5aDhMemdYN0Mta1VtS1pUZjJPN2xqNmlORExrQjBaUSIsInJpZCI6ImM2YTk2NTZhLTE2OTAtNDA3Ni1iMGRhLTg0MWYyNzhlYWRkMyJ9.Lh7WWjnYnDVelxjnNeM9FudaakJDndyvHUCPA0LBQ99eRCfocxw-mTFuqq2PQN8Klfp3h9dZC-lhlSsuDBEHDA';

function formatArg(val) {
  if (val === null || val === undefined) return { type: 'null' };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { type: 'integer', value: String(val) };
    return { type: 'float', value: val };
  }
  if (typeof val === 'boolean') return { type: 'integer', value: val ? '1' : '0' };
  return { type: 'text', value: String(val) };
}

class TursoClient {
  constructor(url, token) {
    this.baseUrl = (url || '').replace(/^libsql:\/\//, 'https://').replace(/\/$/, '');
    this.token = token;
  }

  buildExecuteRequest(sql, args = []) {
    return {
      type: 'execute',
      stmt: {
        sql,
        args: args.map(formatArg)
      }
    };
  }

  async execute(sql, args = []) {
    const payload = {
      requests: [
        this.buildExecuteRequest(sql, args),
        { type: 'close' }
      ]
    };

    const res = await fetch(`${this.baseUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Turso HTTP Error (${res.status}): ${txt}`);
    }

    const data = await res.json();
    const resultBlock = data.results && data.results[0];
    if (resultBlock?.type === 'error') {
      throw new Error(`Turso SQL Error: ${resultBlock.error?.message}`);
    }

    const resResult = resultBlock?.response?.result;
    if (!resResult) return { rows: [], affectedRows: 0, lastInsertRowid: null };

    const cols = (resResult.cols || []).map(c => c.name);
    const rows = (resResult.rows || []).map(row => {
      const obj = {};
      row.forEach((cell, idx) => {
        let val = cell.value;
        if (cell.type === 'integer') val = Number(cell.value);
        else if (cell.type === 'float') val = Number(cell.value);
        else if (cell.type === 'null') val = null;
        obj[cols[idx]] = val;
      });
      return obj;
    });

    return {
      rows,
      affectedRows: resResult.affected_row_count || 0,
      lastInsertRowid: resResult.last_insert_rowid ? Number(resResult.last_insert_rowid) : null
    };
  }

  async all(sql, args = []) {
    const res = await this.execute(sql, args);
    return res.rows;
  }

  async get(sql, args = []) {
    const res = await this.execute(sql, args);
    return res.rows[0] || null;
  }

  async run(sql, args = []) {
    return await this.execute(sql, args);
  }

  async batch(statements) {
    const requests = statements.map(s => {
      const sql = typeof s === 'string' ? s : s.sql;
      const args = typeof s === 'string' ? [] : (s.args || []);
      return this.buildExecuteRequest(sql, args);
    });
    requests.push({ type: 'close' });

    const res = await fetch(`${this.baseUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Turso HTTP Error (${res.status}): ${txt}`);
    }

    const data = await res.json();
    return (data.results || []).map(r => {
      if (r.type === 'error') throw new Error(r.error?.message || 'Turso batch execution error');
      return r.response?.result;
    });
  }
}

function initDb(dbFilePath) {
  let useTurso = Boolean(TURSO_URL && TURSO_TOKEN);
  let tursoClient = null;
  let localDb = null;

  if (useTurso) {
    try {
      tursoClient = new TursoClient(TURSO_URL, TURSO_TOKEN);
      console.log('🌐 Connected to Turso Cloud SQLite Database (AWS AP South - Mumbai)');
    } catch (err) {
      console.warn('⚠️ Could not initialize Turso client, falling back to local SQLite:', err.message);
      useTurso = false;
    }
  }

  // Local fallback
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  localDb = new DatabaseSync(dbFilePath);
  try {
    localDb.exec('PRAGMA foreign_keys = ON;');
    localDb.exec('PRAGMA journal_mode = WAL;');
  } catch (_) {}

  // Helper query runner that uses Turso when active, or local SQLite
  async function queryAll(sql, args = []) {
    if (useTurso && tursoClient) {
      try {
        return await tursoClient.all(sql, args);
      } catch (err) {
        console.warn('Turso query error, trying local:', err.message);
      }
    }
    return localDb.prepare(sql).all(...args);
  }

  async function queryGet(sql, args = []) {
    if (useTurso && tursoClient) {
      try {
        return await tursoClient.get(sql, args);
      } catch (err) {
        console.warn('Turso query error, trying local:', err.message);
      }
    }
    return localDb.prepare(sql).get(...args);
  }

  async function executeRun(sql, args = []) {
    if (useTurso && tursoClient) {
      try {
        return await tursoClient.run(sql, args);
      } catch (err) {
        console.warn('Turso run error, trying local:', err.message);
      }
    }
    const info = localDb.prepare(sql).run(...args);
    return {
      affectedRows: info.changes || 0,
      lastInsertRowid: info.lastInsertRowid ? Number(info.lastInsertRowid) : null
    };
  }

  return {
    isCloud: () => useTurso,

    // Batches
    async getBatches() {
      return await queryAll(`
        SELECT b.*, 
          COUNT(s.id) as student_count,
          COALESCE(SUM(s.total_fee), 0) as total_fees,
          COALESCE(SUM(s.fees_paid), 0) as total_paid,
          COALESCE(SUM(s.total_fee - s.fees_paid), 0) as total_pending
        FROM batches b
        LEFT JOIN students s ON s.batch_id = b.id
        GROUP BY b.id
        ORDER BY b.id ASC
      `);
    },

    async createBatch(name, code, schedule, defaultFee) {
      const res = await executeRun(
        'INSERT INTO batches (name, code, schedule, default_fee) VALUES (?, ?, ?, ?)',
        [name, code || '', schedule || '', Number(defaultFee) || 0]
      );
      return res.lastInsertRowid;
    },

    async deleteBatch(id) {
      const numId = Number(id);
      const batch = await queryGet('SELECT * FROM batches WHERE id = ?', [numId]);
      if (!batch) return null;
      await executeRun('DELETE FROM attendance WHERE batch_id = ?', [numId]);
      await executeRun('DELETE FROM fee_transactions WHERE student_id IN (SELECT id FROM students WHERE batch_id = ?)', [numId]);
      await executeRun('DELETE FROM students WHERE batch_id = ?', [numId]);
      await executeRun('DELETE FROM batches WHERE id = ?', [numId]);
      return batch;
    },

    // Students
    async getStudents({ batch_id, search, pending_only, limit = 100, offset = 0 } = {}) {
      let sql = `
        SELECT s.*, b.name as batch_name, b.code as batch_code,
          (s.total_fee - s.fees_paid) as pending_fee
        FROM students s
        JOIN batches b ON s.batch_id = b.id
        WHERE 1=1
      `;
      const params = [];

      if (batch_id) {
        sql += ` AND s.batch_id = ?`;
        params.push(Number(batch_id));
      }

      if (pending_only) {
        sql += ` AND (s.total_fee - s.fees_paid) > 0`;
      }

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        sql += ` AND (s.name LIKE ? OR s.roll_no LIKE ? OR s.parent_phone LIKE ? OR s.parent_name LIKE ? OR b.name LIKE ?)`;
        params.push(term, term, term, term, term);
      }

      const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
      const countRes = await queryGet(countSql, params);
      const totalCount = countRes?.total || 0;

      if (pending_only) {
        sql += ` ORDER BY pending_fee DESC, s.name ASC`;
      } else {
        sql += ` ORDER BY s.batch_id ASC, s.name ASC`;
      }

      sql += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      const rows = await queryAll(sql, params);
      return { total: totalCount, students: rows };
    },

    async getStudentById(id) {
      const student = await queryGet(`
        SELECT s.*, b.name as batch_name, b.code as batch_code,
          (s.total_fee - s.fees_paid) as pending_fee
        FROM students s
        JOIN batches b ON s.batch_id = b.id
        WHERE s.id = ?
      `, [Number(id)]);

      if (!student) return null;

      const transactions = await queryAll(`
        SELECT * FROM fee_transactions WHERE student_id = ? ORDER BY created_at DESC
      `, [Number(id)]);

      const recentAttendance = await queryAll(`
        SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30
      `, [Number(id)]);

      return { student, transactions, attendance: recentAttendance };
    },

    async createStudent(data, staffName = 'Staff') {
      const res = await executeRun(`
        INSERT INTO students (roll_no, name, batch_id, parent_name, parent_phone, student_phone, email, address, gender, total_fee, fees_paid, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.roll_no ? data.roll_no.toString() : '',
        data.name,
        Number(data.batch_id),
        data.parent_name || '',
        data.parent_phone || '',
        data.student_phone || '',
        data.email || '',
        data.address || '',
        data.gender || 'Other',
        Number(data.total_fee) || 0,
        Number(data.fees_paid) || 0,
        data.notes || ''
      ]);

      const studentId = res.lastInsertRowid;

      if (Number(data.fees_paid) > 0 && studentId) {
        await executeRun(`
          INSERT INTO fee_transactions (student_id, amount, payment_date, payment_mode, reference_no, staff_name, notes)
          VALUES (?, ?, datetime('now', 'localtime'), 'Initial / Advance', 'INIT-' || ?, ?, 'Initial fee during admission')
        `, [studentId, Number(data.fees_paid), studentId, staffName]);
      }

      await this.addActivityLog(
        staffName,
        'STUDENT_ADDED',
        `${staffName} enrolled new student ${data.name} (Roll: ${data.roll_no}) in Batch`,
        studentId,
        Number(data.batch_id)
      );

      return studentId;
    },

    async updateStudent(id, data, staffName = 'Staff') {
      const old = await queryGet('SELECT * FROM students WHERE id = ?', [Number(id)]);
      if (!old) throw new Error('Student not found');

      await executeRun(`
        UPDATE students SET
          name = ?,
          roll_no = ?,
          batch_id = ?,
          parent_name = ?,
          parent_phone = ?,
          student_phone = ?,
          email = ?,
          address = ?,
          gender = ?,
          total_fee = ?,
          status = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        data.name,
        data.roll_no,
        Number(data.batch_id),
        data.parent_name || '',
        data.parent_phone || '',
        data.student_phone || '',
        data.email || '',
        data.address || '',
        data.gender || 'Other',
        Number(data.total_fee) || 0,
        data.status || 'Active',
        data.notes || '',
        Number(id)
      ]);

      await this.addActivityLog(
        staffName,
        'STUDENT_UPDATED',
        `${staffName} updated details for ${data.name} (Roll: ${data.roll_no})`,
        Number(id),
        Number(data.batch_id)
      );

      return true;
    },

    // Fees Recording & Ledger
    async recordFeePayment(studentId, amount, paymentMode = 'Cash', refNo = '', notes = '', staffName = 'Staff') {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Valid positive fee amount required');
      }

      const student = await queryGet(
        'SELECT s.*, b.name as batch_name FROM students s JOIN batches b ON s.batch_id = b.id WHERE s.id = ?',
        [Number(studentId)]
      );
      if (!student) throw new Error('Student not found');

      // 1. Insert fee transaction
      await executeRun(`
        INSERT INTO fee_transactions (student_id, amount, payment_date, payment_mode, reference_no, staff_name, notes)
        VALUES (?, ?, datetime('now', 'localtime'), ?, ?, ?, ?)
      `, [Number(studentId), numAmount, paymentMode, refNo || ('TXN-' + Date.now().toString().slice(-6)), staffName, notes || '']);

      // 2. Update students table fees_paid
      const newPaid = Number(student.fees_paid) + numAmount;
      await executeRun('UPDATE students SET fees_paid = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newPaid, Number(studentId)]);

      const pendingAfter = Math.max(0, Number(student.total_fee) - newPaid);

      // 3. Activity log
      const logDesc = `${staffName} updated ₹${numAmount.toLocaleString('en-IN')} fees for ${student.name} [${student.batch_name}] (Pending: ₹${pendingAfter.toLocaleString('en-IN')})`;
      await this.addActivityLog(staffName, 'FEE_UPDATE', logDesc, Number(studentId), student.batch_id);

      return {
        studentId: student.id,
        studentName: student.name,
        batchName: student.batch_name,
        amountAdded: numAmount,
        totalPaid: newPaid,
        pendingAfter,
        logDesc
      };
    },

    // Attendance
    async getBatchAttendance(batchId, date) {
      return await queryAll(`
        SELECT s.id as student_id, s.name, s.roll_no, s.parent_phone,
          COALESCE(a.status, 'Unmarked') as status,
          a.marked_by_staff,
          a.updated_at
        FROM students s
        LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
        WHERE s.batch_id = ? AND s.status = 'Active'
        ORDER BY s.roll_no ASC, s.name ASC
      `, [date, Number(batchId)]);
    },

    async saveBatchAttendance(batchId, date, records, staffName = 'Staff') {
      let presentCount = 0;
      let absentCount = 0;

      if (useTurso && tursoClient) {
        // Fast batch execution via Turso pipeline
        const stmts = records.map(rec => ({
          sql: `
            INSERT INTO attendance (student_id, batch_id, date, status, marked_by_staff, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(student_id, date) DO UPDATE SET
              status = excluded.status,
              marked_by_staff = excluded.marked_by_staff,
              updated_at = CURRENT_TIMESTAMP;
          `,
          args: [Number(rec.student_id), Number(batchId), date, rec.status || 'Unmarked', staffName]
        }));
        await tursoClient.batch(stmts);
      } else {
        const insertOrUpdate = localDb.prepare(`
          INSERT INTO attendance (student_id, batch_id, date, status, marked_by_staff, updated_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(student_id, date) DO UPDATE SET
            status = excluded.status,
            marked_by_staff = excluded.marked_by_staff,
            updated_at = CURRENT_TIMESTAMP
        `);
        for (const rec of records) {
          insertOrUpdate.run(Number(rec.student_id), Number(batchId), date, rec.status || 'Unmarked', staffName);
        }
      }

      for (const rec of records) {
        if (rec.status === 'Present') presentCount++;
        else if (rec.status === 'Absent') absentCount++;
      }

      const batch = await queryGet('SELECT name FROM batches WHERE id = ?', [Number(batchId)]);
      const batchName = batch ? batch.name : `Batch #${batchId}`;

      const logDesc = `${staffName} marked attendance for ${batchName} on ${date}: ${presentCount} Present, ${absentCount} Absent`;
      await this.addActivityLog(staffName, 'ATTENDANCE_MARKED', logDesc, null, Number(batchId));

      return { presentCount, absentCount, total: records.length, logDesc };
    },

    // Bulk Import Students from Excel/CSV
    async bulkImportStudents(studentsList, defaultBatchId, staffName = 'Staff') {
      let inserted = 0;
      let updated = 0;
      let skipped = 0;

      for (const item of studentsList) {
        if (!item.name || !item.roll_no) {
          skipped++;
          continue;
        }

        let targetBatchId = defaultBatchId;
        if (item.batch_name) {
          const existingBatch = await queryGet('SELECT id FROM batches WHERE name = ? COLLATE NOCASE', [item.batch_name.trim()]);
          if (existingBatch) {
            targetBatchId = existingBatch.id;
          } else {
            const newB = await executeRun('INSERT INTO batches (name, default_fee) VALUES (?, ?)', [item.batch_name.trim(), Number(item.total_fee) || 50000]);
            targetBatchId = newB.lastInsertRowid;
          }
        }

        const existingStudent = await queryGet('SELECT id, total_fee, fees_paid FROM students WHERE roll_no = ? AND batch_id = ?', [
          item.roll_no.toString().trim(),
          Number(targetBatchId)
        ]);
        const totalFee = Number(item.total_fee) || 0;
        const feesPaid = Number(item.fees_paid) || 0;

        if (existingStudent) {
          await executeRun(`
            UPDATE students SET
              name = ?, batch_id = ?, parent_name = ?, parent_phone = ?, total_fee = ?, fees_paid = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [
            item.name.trim(),
            Number(targetBatchId),
            item.parent_name || '',
            item.parent_phone || item.phone || '',
            totalFee,
            feesPaid,
            existingStudent.id
          ]);
          updated++;
        } else {
          await executeRun(`
            INSERT INTO students (roll_no, name, batch_id, parent_name, parent_phone, student_phone, email, total_fee, fees_paid, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.roll_no.toString().trim(),
            item.name.trim(),
            Number(targetBatchId),
            item.parent_name || '',
            item.parent_phone || item.phone || '',
            item.student_phone || '',
            item.email || '',
            totalFee,
            feesPaid,
            item.notes || 'Imported via Excel'
          ]);
          inserted++;
        }
      }

      const logDesc = `${staffName} imported Excel batch: ${inserted} students added, ${updated} updated`;
      await this.addActivityLog(staffName, 'EXCEL_IMPORT', logDesc, null, Number(defaultBatchId) || null);

      return { inserted, updated, skipped, total: studentsList.length, logDesc };
    },

    // Activity Log & Audit Feed
    async getActivityLogs(limit = 60) {
      return await queryAll(`
        SELECT a.*, b.name as batch_name, s.name as student_name
        FROM activity_logs a
        LEFT JOIN batches b ON a.batch_id = b.id
        LEFT JOIN students s ON a.student_id = s.id
        ORDER BY a.id DESC
        LIMIT ?
      `, [Number(limit)]);
    },

    async addActivityLog(staffName, actionType, description, studentId = null, batchId = null) {
      const res = await executeRun(`
        INSERT INTO activity_logs (staff_name, action_type, description, student_id, batch_id)
        VALUES (?, ?, ?, ?, ?)
      `, [staffName, actionType, description, studentId ? Number(studentId) : null, batchId ? Number(batchId) : null]);
      return {
        id: res.lastInsertRowid,
        staff_name: staffName,
        action_type: actionType,
        description,
        created_at: new Date().toISOString()
      };
    },

    // Dashboard Overview
    async getDashboardStats() {
      const totals = await queryGet(`
        SELECT 
          COUNT(id) as total_students,
          COALESCE(SUM(total_fee), 0) as total_fees,
          COALESCE(SUM(fees_paid), 0) as total_paid,
          COALESCE(SUM(total_fee - fees_paid), 0) as total_pending
        FROM students
        WHERE status = 'Active'
      `) || { total_students: 0, total_fees: 0, total_paid: 0, total_pending: 0 };

      const batchCountRes = await queryGet('SELECT COUNT(*) as count FROM batches') || { count: 0 };
      const batchCount = batchCountRes.count;

      const today = new Date().toISOString().slice(0, 10);
      const todayCollectionsRes = await queryGet(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM fee_transactions
        WHERE date(payment_date) = date('now', 'localtime')
      `) || { total: 0 };

      const todayAttendance = await queryGet(`
        SELECT 
          COUNT(*) as total_marked,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count
        FROM attendance
        WHERE date = date('now', 'localtime')
      `) || { total_marked: 0, present_count: 0 };

      const totalMarked = todayAttendance.total_marked || 0;
      const presentCount = todayAttendance.present_count || 0;
      const attendancePct = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : null;

      const pendingStudentsRes = await queryGet(`
        SELECT COUNT(*) as count FROM students WHERE status = 'Active' AND (total_fee - fees_paid) > 0
      `) || { count: 0 };

      return {
        totalStudents: totals.total_students,
        totalBatches: batchCount,
        totalFees: totals.total_fees,
        totalPaid: totals.total_paid,
        totalPending: totals.total_pending,
        pendingStudentsCount: pendingStudentsRes.count,
        todayCollections: todayCollectionsRes.total,
        attendanceTodayPct: attendancePct,
        todayPresent: presentCount,
        todayMarked: totalMarked
      };
    },

    async getStaffList() {
      return await queryAll('SELECT * FROM staff ORDER BY id ASC');
    },

    async getStaffByName(name) {
      return await queryGet('SELECT * FROM staff WHERE name = ?', [name]);
    },

    async getStaffById(id) {
      return await queryGet('SELECT * FROM staff WHERE id = ?', [Number(id)]);
    },

    async updateStaffProfile(id, data) {
      const staff = await queryGet('SELECT * FROM staff WHERE id = ?', [Number(id)]);
      if (!staff) return null;

      await executeRun(`
        UPDATE staff
        SET name = COALESCE(?, name),
            role = COALESCE(?, role),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            address = COALESCE(?, address),
            avatar_color = COALESCE(?, avatar_color),
            avatar_image = COALESCE(?, avatar_image),
            pin = COALESCE(?, pin)
        WHERE id = ?
      `, [
        data.name || staff.name,
        data.role || staff.role,
        data.phone !== undefined ? data.phone : staff.phone,
        data.email !== undefined ? data.email : staff.email,
        data.address !== undefined ? data.address : staff.address,
        data.avatar_color || staff.avatar_color,
        data.avatar_image !== undefined ? data.avatar_image : staff.avatar_image,
        data.pin !== undefined ? data.pin : staff.pin,
        Number(id)
      ]);

      return await queryGet('SELECT * FROM staff WHERE id = ?', [Number(id)]);
    },

    async addStaff(name, role = 'Staff Member') {
      const res = await executeRun('INSERT INTO staff (name, role) VALUES (?, ?)', [name, role]);
      return { id: res.lastInsertRowid, name, role };
    },

    async deleteStaff(id) {
      const staff = await queryGet('SELECT * FROM staff WHERE id = ?', [Number(id)]);
      if (!staff) return null;
      await executeRun('DELETE FROM staff WHERE id = ?', [Number(id)]);
      return staff;
    }
  };
}

module.exports = { initDb };
