const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

function initDb(dbFilePath) {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbFilePath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'Staff Member',
      avatar_color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT,
      schedule TEXT,
      default_fee REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      parent_name TEXT,
      parent_phone TEXT NOT NULL,
      student_phone TEXT,
      email TEXT,
      address TEXT,
      gender TEXT DEFAULT 'Other',
      total_fee REAL DEFAULT 0,
      fees_paid REAL DEFAULT 0,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL, -- 'Present', 'Absent', 'Late', 'Excused'
      marked_by_staff TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, date)
    );

    CREATE TABLE IF NOT EXISTS fee_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_mode TEXT DEFAULT 'Cash',
      reference_no TEXT,
      staff_name TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      student_id INTEGER,
      batch_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_id);
    CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_no);
    CREATE INDEX IF NOT EXISTS idx_students_phone ON students(parent_phone);
    CREATE INDEX IF NOT EXISTS idx_attendance_batch_date ON attendance(batch_id, date);
    CREATE INDEX IF NOT EXISTS idx_fees_student ON fee_transactions(student_id);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
  `);

  // Seed default staff if empty
  const staffCount = db.prepare('SELECT COUNT(*) as count FROM staff').get().count;
  if (staffCount === 0) {
    const insertStaff = db.prepare('INSERT INTO staff (name, role, avatar_color) VALUES (?, ?, ?)');
    insertStaff.run('Mr. Jones', 'Director / Admin', '#6366f1');
    insertStaff.run('Staff 1 (Pooja)', 'Academic Coordinator', '#ec4899');
    insertStaff.run('Staff 2 (Ramesh)', 'Front Desk & Accounts', '#10b981');
    insertStaff.run('Staff 3 (Anil)', 'Attendance In-charge', '#f59e0b');
  }

  // Seed default batches if empty
  const batchCount = db.prepare('SELECT COUNT(*) as count FROM batches').get().count;
  if (batchCount === 0) {
    const insertBatch = db.prepare('INSERT INTO batches (name, code, schedule, default_fee) VALUES (?, ?, ?, ?)');
    insertBatch.run('Batch 1 - Class 11 JEE (Advanced)', 'JEE-11A', 'Mon, Wed, Fri 4:00 PM - 7:00 PM', 65000);
    insertBatch.run('Batch 2 - Class 11 NEET (Medical)', 'NEET-11A', 'Tue, Thu, Sat 4:00 PM - 7:00 PM', 60000);
    insertBatch.run('Batch 3 - Class 12 JEE (Mains + Adv)', 'JEE-12A', 'Mon, Wed, Fri 5:30 PM - 8:30 PM', 75000);
    insertBatch.run('Batch 4 - Class 12 NEET (Super 50)', 'NEET-12A', 'Tue, Thu, Sat 5:30 PM - 8:30 PM', 70000);
    insertBatch.run('Batch 5 - Foundation Class 9', 'FND-09', 'Daily 3:00 PM - 5:00 PM', 40000);
    insertBatch.run('Batch 6 - Foundation Class 10 Board Booster', 'FND-10', 'Daily 5:00 PM - 7:00 PM', 45000);
    insertBatch.run('Batch 7 - Repeater / Dropper JEE Batch', 'REP-JEE', 'Mon-Sat 9:00 AM - 2:00 PM', 80000);
    insertBatch.run('Batch 8 - Repeater / Dropper NEET Batch', 'REP-NEET', 'Mon-Sat 9:00 AM - 2:00 PM', 75000);
    insertBatch.run('Batch 9 - Weekend Intensive Class 11', 'WKND-11', 'Sat & Sun 9:00 AM - 3:00 PM', 50000);
    insertBatch.run('Batch 10 - Weekend Intensive Class 12', 'WKND-12', 'Sat & Sun 9:00 AM - 3:00 PM', 55000);

    // Seed initial demo students with realistic fees & logs
    const seedStudents = [
      { roll: '11001', name: 'Aarav Sharma', b: 1, p: 'Sunil Sharma', ph: '9876543210', tot: 65000, paid: 40000 },
      { roll: '11002', name: 'Ishita Verma', b: 1, p: 'Rajesh Verma', ph: '9876543211', tot: 65000, paid: 65000 },
      { roll: '11003', name: 'Rohan Gupta', b: 1, p: 'Manoj Gupta', ph: '9876543212', tot: 65000, paid: 25000 },
      { roll: '11004', name: 'Sneha Patel', b: 1, p: 'Kirit Patel', ph: '9876543213', tot: 65000, paid: 15000 },
      { roll: '12001', name: 'Aditya Singhania', b: 2, p: 'Vikram Singhania', ph: '9811223344', tot: 60000, paid: 30000 },
      { roll: '12002', name: 'Diya Malhotra', b: 2, p: 'Ravi Malhotra', ph: '9811223345', tot: 60000, paid: 60000 },
      { roll: '12003', name: 'Kavya Nair', b: 2, p: 'Suresh Nair', ph: '9811223346', tot: 60000, paid: 0 },
      { roll: '13001', name: 'Kabir Mehta', b: 3, p: 'Amit Mehta', ph: '9922334455', tot: 75000, paid: 50000 },
      { roll: '13002', name: 'Ananya Roy', b: 3, p: 'Pradeep Roy', ph: '9922334456', tot: 75000, paid: 35000 },
      { roll: '14001', name: 'Manish Kumar', b: 4, p: 'Santosh Kumar', ph: '9733445566', tot: 70000, paid: 70000 },
      { roll: '14002', name: 'Zoya Khan', b: 4, p: 'Imran Khan', ph: '9733445567', tot: 70000, paid: 20000 }
    ];

    const insertStudent = db.prepare(`
      INSERT INTO students (roll_no, name, batch_id, parent_name, parent_phone, total_fee, fees_paid)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of seedStudents) {
      insertStudent.run(s.roll, s.name, s.b, s.p, s.ph, s.tot, s.paid);
    }

    // Seed initial logs
    const insertLog = db.prepare(`
      INSERT INTO activity_logs (staff_name, action_type, description, created_at)
      VALUES (?, ?, ?, datetime('now', '-20 minutes'))
    `);
    insertLog.run('Mr. Jones', 'SYSTEM_INIT', 'System initialized with 10 batches and starter student records');
    insertLog.run('Staff 1 (Pooja)', 'FEE_UPDATE', 'Staff 1 updated ₹25,000 fees for Rohan Gupta [Batch 1]');
    insertLog.run('Staff 2 (Ramesh)', 'STUDENT_ADDED', 'Registered new student Sneha Patel [Batch 1]');
  }

  return {
    db,

    // Batches
    getBatches() {
      return db.prepare(`
        SELECT b.*, 
          COUNT(s.id) as student_count,
          COALESCE(SUM(s.total_fee), 0) as total_fees,
          COALESCE(SUM(s.fees_paid), 0) as total_paid,
          COALESCE(SUM(s.total_fee - s.fees_paid), 0) as total_pending
        FROM batches b
        LEFT JOIN students s ON s.batch_id = b.id
        GROUP BY b.id
        ORDER BY b.id ASC
      `).all();
    },

    createBatch(name, code, schedule, defaultFee) {
      const stmt = db.prepare('INSERT INTO batches (name, code, schedule, default_fee) VALUES (?, ?, ?, ?)');
      const info = stmt.run(name, code || '', schedule || '', Number(defaultFee) || 0);
      return info.lastInsertRowid;
    },

    deleteBatch(id) {
      const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(id);
      if (!batch) return null;
      db.prepare('UPDATE students SET batch_id = NULL WHERE batch_id = ?').run(id);
      db.prepare('DELETE FROM attendance WHERE batch_id = ?').run(id);
      db.prepare('DELETE FROM batches WHERE id = ?').run(id);
      return batch;
    },

    // Students
    getStudents({ batch_id, search, pending_only, limit = 100, offset = 0 } = {}) {
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

      // Count query
      const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
      const totalCount = db.prepare(countSql).get(...params).total;

      // Sorting
      if (pending_only) {
        sql += ` ORDER BY pending_fee DESC, s.name ASC`;
      } else {
        sql += ` ORDER BY s.batch_id ASC, s.name ASC`;
      }

      sql += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      const rows = db.prepare(sql).all(...params);
      return { total: totalCount, students: rows };
    },

    getStudentById(id) {
      const student = db.prepare(`
        SELECT s.*, b.name as batch_name, b.code as batch_code,
          (s.total_fee - s.fees_paid) as pending_fee
        FROM students s
        JOIN batches b ON s.batch_id = b.id
        WHERE s.id = ?
      `).get(Number(id));

      if (!student) return null;

      const transactions = db.prepare(`
        SELECT * FROM fee_transactions WHERE student_id = ? ORDER BY created_at DESC
      `).all(Number(id));

      const recentAttendance = db.prepare(`
        SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30
      `).all(Number(id));

      return { student, transactions, attendance: recentAttendance };
    },

    createStudent(data, staffName = 'Staff') {
      const stmt = db.prepare(`
        INSERT INTO students (roll_no, name, batch_id, parent_name, parent_phone, student_phone, email, address, gender, total_fee, fees_paid, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        data.roll_no,
        data.name,
        Number(data.batch_id),
        data.parent_name || '',
        data.parent_phone,
        data.student_phone || '',
        data.email || '',
        data.address || '',
        data.gender || 'Other',
        Number(data.total_fee) || 0,
        Number(data.fees_paid) || 0,
        data.notes || ''
      );

      const studentId = info.lastInsertRowid;

      if (Number(data.fees_paid) > 0) {
        db.prepare(`
          INSERT INTO fee_transactions (student_id, amount, payment_date, payment_mode, reference_no, staff_name, notes)
          VALUES (?, ?, datetime('now', 'localtime'), 'Initial / Advance', 'INIT-' || ?, ?, 'Initial fee during admission')
        `).run(studentId, Number(data.fees_paid), studentId, staffName);
      }

      this.addActivityLog(
        staffName,
        'STUDENT_ADDED',
        `${staffName} enrolled new student ${data.name} (Roll: ${data.roll_no}) in Batch`,
        studentId,
        Number(data.batch_id)
      );

      return studentId;
    },

    updateStudent(id, data, staffName = 'Staff') {
      const old = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(id));
      if (!old) throw new Error('Student not found');

      db.prepare(`
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
      `).run(
        data.name,
        data.roll_no,
        Number(data.batch_id),
        data.parent_name || '',
        data.parent_phone,
        data.student_phone || '',
        data.email || '',
        data.address || '',
        data.gender || 'Other',
        Number(data.total_fee) || 0,
        data.status || 'Active',
        data.notes || '',
        Number(id)
      );

      this.addActivityLog(
        staffName,
        'STUDENT_UPDATED',
        `${staffName} updated details for ${data.name} (Roll: ${data.roll_no})`,
        Number(id),
        Number(data.batch_id)
      );

      return true;
    },

    // Fees Recording & Ledger
    recordFeePayment(studentId, amount, paymentMode = 'Cash', refNo = '', notes = '', staffName = 'Staff') {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Valid positive fee amount required');
      }

      const student = db.prepare('SELECT s.*, b.name as batch_name FROM students s JOIN batches b ON s.batch_id = b.id WHERE s.id = ?').get(Number(studentId));
      if (!student) throw new Error('Student not found');

      // 1. Insert fee transaction
      const feeStmt = db.prepare(`
        INSERT INTO fee_transactions (student_id, amount, payment_date, payment_mode, reference_no, staff_name, notes)
        VALUES (?, ?, datetime('now', 'localtime'), ?, ?, ?, ?)
      `);
      feeStmt.run(Number(studentId), numAmount, paymentMode, refNo || ('TXN-' + Date.now().toString().slice(-6)), staffName, notes || '');

      // 2. Update students table fees_paid
      const newPaid = Number(student.fees_paid) + numAmount;
      db.prepare('UPDATE students SET fees_paid = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newPaid, Number(studentId));

      const pendingAfter = Math.max(0, Number(student.total_fee) - newPaid);

      // 3. Activity log
      const logDesc = `${staffName} updated ₹${numAmount.toLocaleString('en-IN')} fees for ${student.name} [${student.batch_name}] (Pending: ₹${pendingAfter.toLocaleString('en-IN')})`;
      this.addActivityLog(staffName, 'FEE_UPDATE', logDesc, Number(studentId), student.batch_id);

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
    getBatchAttendance(batchId, date) {
      return db.prepare(`
        SELECT s.id as student_id, s.name, s.roll_no, s.parent_phone,
          COALESCE(a.status, 'Unmarked') as status,
          a.marked_by_staff,
          a.updated_at
        FROM students s
        LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
        WHERE s.batch_id = ? AND s.status = 'Active'
        ORDER BY s.roll_no ASC, s.name ASC
      `).all(date, Number(batchId));
    },

    saveBatchAttendance(batchId, date, records, staffName = 'Staff') {
      const insertOrUpdate = db.prepare(`
        INSERT INTO attendance (student_id, batch_id, date, status, marked_by_staff, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(student_id, date) DO UPDATE SET
          status = excluded.status,
          marked_by_staff = excluded.marked_by_staff,
          updated_at = CURRENT_TIMESTAMP
      `);

      let presentCount = 0;
      let absentCount = 0;

      for (const rec of records) {
        insertOrUpdate.run(Number(rec.student_id), Number(batchId), date, rec.status, staffName);
        if (rec.status === 'Present') presentCount++;
        else if (rec.status === 'Absent') absentCount++;
      }

      const batch = db.prepare('SELECT name FROM batches WHERE id = ?').get(Number(batchId));
      const batchName = batch ? batch.name : `Batch #${batchId}`;

      const logDesc = `${staffName} marked attendance for ${batchName} on ${date}: ${presentCount} Present, ${absentCount} Absent`;
      this.addActivityLog(staffName, 'ATTENDANCE_MARKED', logDesc, null, Number(batchId));

      return { presentCount, absentCount, total: records.length, logDesc };
    },

    // Bulk Import
    bulkImportStudents(studentsList, defaultBatchId, staffName = 'Staff') {
      let inserted = 0;
      let updated = 0;
      let skipped = 0;

      const checkBatchStmt = db.prepare('SELECT id FROM batches WHERE name = ? COLLATE NOCASE');
      const createBatchStmt = db.prepare('INSERT INTO batches (name, default_fee) VALUES (?, ?)');
      const checkStudentStmt = db.prepare('SELECT id, total_fee, fees_paid FROM students WHERE roll_no = ?');
      const insertStmt = db.prepare(`
        INSERT INTO students (roll_no, name, batch_id, parent_name, parent_phone, student_phone, email, total_fee, fees_paid, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const updateStmt = db.prepare(`
        UPDATE students SET
          name = ?, batch_id = ?, parent_name = ?, parent_phone = ?, total_fee = ?, fees_paid = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      for (const item of studentsList) {
        if (!item.name || !item.roll_no) {
          skipped++;
          continue;
        }

        let targetBatchId = defaultBatchId;
        if (item.batch_name) {
          const existingBatch = checkBatchStmt.get(item.batch_name.trim());
          if (existingBatch) {
            targetBatchId = existingBatch.id;
          } else {
            const newB = createBatchStmt.run(item.batch_name.trim(), Number(item.total_fee) || 50000);
            targetBatchId = newB.lastInsertRowid;
          }
        }

        const existingStudent = checkStudentStmt.get(item.roll_no.toString().trim());
        const totalFee = Number(item.total_fee) || 0;
        const feesPaid = Number(item.fees_paid) || 0;

        if (existingStudent) {
          updateStmt.run(
            item.name.trim(),
            Number(targetBatchId),
            item.parent_name || '',
            item.parent_phone || item.phone || '',
            totalFee,
            feesPaid,
            existingStudent.id
          );
          updated++;
        } else {
          insertStmt.run(
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
          );
          inserted++;
        }
      }

      const logDesc = `${staffName} imported Excel batch: ${inserted} students added, ${updated} updated`;
      this.addActivityLog(staffName, 'EXCEL_IMPORT', logDesc, null, Number(defaultBatchId) || null);

      return { inserted, updated, skipped, total: studentsList.length, logDesc };
    },

    // Activity Log & Audit Feed
    getActivityLogs(limit = 60) {
      return db.prepare(`
        SELECT a.*, b.name as batch_name, s.name as student_name
        FROM activity_logs a
        LEFT JOIN batches b ON a.batch_id = b.id
        LEFT JOIN students s ON a.student_id = s.id
        ORDER BY a.id DESC
        LIMIT ?
      `).all(Number(limit));
    },

    addActivityLog(staffName, actionType, description, studentId = null, batchId = null) {
      const stmt = db.prepare(`
        INSERT INTO activity_logs (staff_name, action_type, description, student_id, batch_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(staffName, actionType, description, studentId ? Number(studentId) : null, batchId ? Number(batchId) : null);
      return {
        id: info.lastInsertRowid,
        staff_name: staffName,
        action_type: actionType,
        description,
        created_at: new Date().toISOString()
      };
    },

    // Dashboard Overview
    getDashboardStats() {
      const totals = db.prepare(`
        SELECT 
          COUNT(id) as total_students,
          COALESCE(SUM(total_fee), 0) as total_fees,
          COALESCE(SUM(fees_paid), 0) as total_paid,
          COALESCE(SUM(total_fee - fees_paid), 0) as total_pending
        FROM students
        WHERE status = 'Active'
      `).get();

      const batchCount = db.prepare('SELECT COUNT(*) as count FROM batches').get().count;

      const today = new Date().toISOString().slice(0, 10);
      const todayCollections = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM fee_transactions
        WHERE date(payment_date) = date('now', 'localtime')
      `).get().total;

      const todayAttendance = db.prepare(`
        SELECT 
          COUNT(*) as total_marked,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count
        FROM attendance
        WHERE date = date('now', 'localtime')
      `).get();

      const attendancePct = todayAttendance.total_marked > 0
        ? Math.round((todayAttendance.present_count / todayAttendance.total_marked) * 100)
        : null;

      const pendingStudentsCount = db.prepare(`
        SELECT COUNT(*) as count FROM students WHERE status = 'Active' AND (total_fee - fees_paid) > 0
      `).get().count;

      return {
        totalStudents: totals.total_students,
        totalBatches: batchCount,
        totalFees: totals.total_fees,
        totalPaid: totals.total_paid,
        totalPending: totals.total_pending,
        pendingStudentsCount,
        todayCollections,
        attendanceTodayPct: attendancePct,
        todayPresent: todayAttendance.present_count || 0,
        todayMarked: todayAttendance.total_marked || 0
      };
    },

    getStaffList() {
      return db.prepare('SELECT * FROM staff ORDER BY id ASC').all();
    },

    addStaff(name, role = 'Staff Member') {
      const stmt = db.prepare('INSERT INTO staff (name, role) VALUES (?, ?)');
      const info = stmt.run(name, role);
      return { id: info.lastInsertRowid, name, role };
    },

    deleteStaff(id) {
      const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
      if (!staff) return null;
      db.prepare('DELETE FROM staff WHERE id = ?').run(id);
      return staff;
    }
  };
}

module.exports = { initDb };
