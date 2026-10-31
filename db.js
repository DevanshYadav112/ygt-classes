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
      roll_no TEXT NOT NULL,
      name TEXT NOT NULL,
      batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      parent_name TEXT,
      parent_phone TEXT,
      student_phone TEXT,
      email TEXT,
      address TEXT,
      gender TEXT DEFAULT 'Other',
      total_fee REAL DEFAULT 0,
      fees_paid REAL DEFAULT 0,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(batch_id, roll_no)
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

  // Seed default director staff if empty
  const staffCount = db.prepare('SELECT COUNT(*) as count FROM staff').get().count;
  if (staffCount === 0) {
    const insertStaff = db.prepare('INSERT INTO staff (name, role, avatar_color, is_owner, pin) VALUES (?, ?, ?, ?, ?)');
    insertStaff.run('Mr. Roshan Yadav', 'Institute Director (Owner)', '#6366f1', 1, '1234');
  }

  // 1. Purge legacy demo batches (JEE / NEET) if present in database
  const legacyCheck = db.prepare("SELECT id FROM batches WHERE name LIKE '%JEE%' OR name LIKE '%NEET%' LIMIT 1").get();
  if (legacyCheck) {
    db.exec('DELETE FROM attendance;');
    db.exec('DELETE FROM fee_transactions;');
    db.exec('DELETE FROM activity_logs;');
    db.exec('DELETE FROM students;');
    db.exec('DELETE FROM batches;');
  }

  // 2. Ensure official coaching batches & students are seeded if empty
  const batchCount = db.prepare('SELECT COUNT(*) as count FROM batches').get().count;
  if (batchCount === 0) {
    const batchDefs = [
      { name: 'Non-School', code: 'NON-SCH', fee: 0 },
      { name: 'Jr. KG', code: 'JR-KG', fee: 0 },
      { name: 'Sr. KG', code: 'SR-KG', fee: 0 },
      { name: '1st Std - Class 1', code: 'STD-01', fee: 5000 },
      { name: '2nd Std - Class 2', code: 'STD-02', fee: 5000 },
      { name: '5th Std', code: 'STD-05', fee: 0 },
      { name: '6th Std', code: 'STD-06', fee: 0 },
      { name: '7th Std', code: 'STD-07', fee: 0 },
      { name: '8th Std', code: 'STD-08', fee: 0 },
      { name: '9th Std', code: 'STD-09', fee: 0 },
      { name: '10th Std', code: 'STD-10', fee: 0 }
    ];

    const insertB = db.prepare('INSERT INTO batches (name, code, default_fee) VALUES (?, ?, ?)');
    const bMap = {};
    for (const b of batchDefs) {
      const res = insertB.run(b.name, b.code, b.fee);
      bMap[b.name] = res.lastInsertRowid;
    }

    const officialRoster = [
      // Non-School
      { b: 'Non-School', r: '1', n: 'Aaradhya', t: 0, p: 0 },
      { b: 'Non-School', r: '2', n: 'Moksh', t: 0, p: 0 },
      { b: 'Non-School', r: '3', n: 'Naitik', t: 0, p: 0 },
      { b: 'Non-School', r: '4', n: 'Virat', t: 0, p: 0 },

      // Jr. KG
      { b: 'Jr. KG', r: '1', n: 'Aarush', t: 0, p: 0 },
      { b: 'Jr. KG', r: '2', n: 'Aarushi', t: 0, p: 0 },
      { b: 'Jr. KG', r: '3', n: 'Aatif', t: 0, p: 0 },
      { b: 'Jr. KG', r: '4', n: 'Advik', t: 0, p: 0 },
      { b: 'Jr. KG', r: '5', n: 'Anshu', t: 0, p: 0 },
      { b: 'Jr. KG', r: '6', n: 'Anurag', t: 0, p: 0 },
      { b: 'Jr. KG', r: '7', n: 'Karthik', t: 0, p: 0 },
      { b: 'Jr. KG', r: '8', n: 'Naira', t: 0, p: 0 },
      { b: 'Jr. KG', r: '9', n: 'Ovi', t: 0, p: 0 },
      { b: 'Jr. KG', r: '10', n: 'Shivanshi', t: 0, p: 0 },

      // Sr. KG
      { b: 'Sr. KG', r: '1', n: 'Ananya', t: 0, p: 0 },
      { b: 'Sr. KG', r: '2', n: 'Anvi', t: 0, p: 0 },
      { b: 'Sr. KG', r: '3', n: 'Kunal', t: 0, p: 0 },
      { b: 'Sr. KG', r: '4', n: 'Sanchit', t: 0, p: 0 },
      { b: 'Sr. KG', r: '5', n: 'Shivanya', t: 0, p: 0 },

      // 1st Std - Class 1
      { b: '1st Std - Class 1', r: '1', n: 'Aarushi Chauhan', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '2', n: 'Aryan Pandey', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '3', n: 'Kanak', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '4', n: 'Kanishk Yadav', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '5', n: 'Pranay', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '6', n: 'Riddhi Chauhan', t: 5000, p: 1000 },
      { b: '1st Std - Class 1', r: '7', n: 'Riyansh Karmode', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '8', n: 'Samarth Waikar', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '9', n: 'Siddharth', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '10', n: 'Vibha Sakpal', t: 5000, p: 0 },
      { b: '1st Std - Class 1', r: '11', n: 'Yash Yadav', t: 5000, p: 0 },

      // 2nd Std - Class 2
      { b: '2nd Std - Class 2', r: '1', n: 'Aarav Tripathi', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '2', n: 'Akhil', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '3', n: 'Ananya Pasi', t: 5000, p: 1000 },
      { b: '2nd Std - Class 2', r: '4', n: 'Ananya Yadav', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '5', n: 'Asad Shaikh', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '6', n: 'Devansh More', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '7', n: 'Hardit', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '8', n: 'Manas', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '9', n: 'Mrudul Kadam', t: 5000, p: 1000 },
      { b: '2nd Std - Class 2', r: '10', n: 'Mrunmayi Lande', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '11', n: 'Najis', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '12', n: 'Renuvanshikumari', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '13', n: 'Shivansh', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '14', n: 'Shivanya More', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '15', n: 'Shreya Maurya', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '16', n: 'Tanishq Tambe', t: 5000, p: 1000 },
      { b: '2nd Std - Class 2', r: '17', n: 'Urvi Dhotre', t: 5000, p: 0 },
      { b: '2nd Std - Class 2', r: '18', n: 'Urvi S.', t: 5000, p: 0 },

      // 5th Std
      { b: '5th Std', r: '1', n: 'Aadarsh Yadav', t: 0, p: 0 },
      { b: '5th Std', r: '2', n: 'Ananya Mishra', t: 0, p: 0 },
      { b: '5th Std', r: '3', n: 'Anshuman', t: 1600, p: 0 },
      { b: '5th Std', r: '4', n: 'Atul Yadav', t: 0, p: 0 },
      { b: '5th Std', r: '5', n: 'Daksh Sawant', t: 0, p: 0 },
      { b: '5th Std', r: '6', n: 'Jagdheshwari', t: 4000, p: 0 },
      { b: '5th Std', r: '7', n: 'Joshwa H.', t: 4100, p: 0 },
      { b: '5th Std', r: '8', n: 'Kanak Y.', t: 5000, p: 0 },
      { b: '5th Std', r: '9', n: 'Manisha C.', t: 3600, p: 0 },
      { b: '5th Std', r: '10', n: 'Omkar More', t: 3000, p: 0 },
      { b: '5th Std', r: '11', n: 'Ragini Chauhan', t: 3000, p: 0 },
      { b: '5th Std', r: '12', n: 'Sahil Shaikh', t: 5600, p: 0 },
      { b: '5th Std', r: '13', n: 'Shaurya K.', t: 4600, p: 0 },
      { b: '5th Std', r: '14', n: 'Siddharth Yadav', t: 5600, p: 0 },
      { b: '5th Std', r: '15', n: 'Smarnika A.', t: 3600, p: 0 },
      { b: '5th Std', r: '16', n: 'Utsav Pal', t: 2000, p: 0 },
      { b: '5th Std', r: '17', n: 'Viraj Jadhav', t: 3600, p: 0 },
      { b: '5th Std', r: '18', n: 'Viral Tambe', t: 2600, p: 0 },
      { b: '5th Std', r: '19', n: 'Virat Yadav', t: 3600, p: 0 },
      { b: '5th Std', r: '20', n: 'Yash Nishad', t: 4600, p: 0 },

      // 6th Std
      { b: '6th Std', r: '1', n: 'Aarohi Prajapati', t: 4200, p: 0 },
      { b: '6th Std', r: '2', n: 'Abhishek Gupta', t: 6200, p: 0 },
      { b: '6th Std', r: '3', n: 'Anant Mishra', t: 0, p: 0 },
      { b: '6th Std', r: '4', n: 'Ansh Yadav', t: 5200, p: 0 },
      { b: '6th Std', r: '5', n: 'Anushka Sakpal', t: 2200, p: 0 },
      { b: '6th Std', r: '6', n: 'Arnav Yadav', t: 0, p: 0 },
      { b: '6th Std', r: '7', n: 'Avantika Ram', t: 0, p: 0 },
      { b: '6th Std', r: '8', n: 'Avi Yadav', t: 5200, p: 0 },
      { b: '6th Std', r: '9', n: 'Hritwik Waghmare', t: 3700, p: 0 },
      { b: '6th Std', r: '10', n: 'Ishita Yadav', t: 5000, p: 0 },
      { b: '6th Std', r: '11', n: 'Kevailya Jadhav', t: 6700, p: 0 },
      { b: '6th Std', r: '12', n: 'Nayan Pashte', t: 3000, p: 0 },
      { b: '6th Std', r: '13', n: 'Ovi Wadkar', t: 4200, p: 0 },
      { b: '6th Std', r: '14', n: 'Pranav Pandey', t: 0, p: 0 },
      { b: '6th Std', r: '15', n: 'Rishika Yadav', t: 3200, p: 0 },
      { b: '6th Std', r: '16', n: 'Rohan Jaiswar', t: 4500, p: 0 },
      { b: '6th Std', r: '17', n: 'Rudra Surve', t: 4500, p: 0 },
      { b: '6th Std', r: '18', n: 'Sarthak Dubey', t: 4000, p: 0 },
      { b: '6th Std', r: '19', n: 'Shagun Yadav', t: 4000, p: 0 },
      { b: '6th Std', r: '20', n: 'Soham Jaid', t: 4200, p: 0 },

      // 7th Std
      { b: '7th Std', r: '1', n: 'Aayush Kushwaha', t: 5700, p: 0 },
      { b: '7th Std', r: '2', n: 'Abhinav Yadav', t: 0, p: 0 },
      { b: '7th Std', r: '3', n: 'Adarsh', t: 7800, p: 0 },
      { b: '7th Std', r: '4', n: 'Ajinkya Shinde', t: 7800, p: 0 },
      { b: '7th Std', r: '5', n: 'Ayan Shaikh', t: 6800, p: 0 },
      { b: '7th Std', r: '6', n: 'Bilal Makandar', t: 0, p: 0 },
      { b: '7th Std', r: '7', n: 'Dev Sharma', t: 6300, p: 0 },
      { b: '7th Std', r: '8', n: 'Dhanshree', t: 4800, p: 0 },
      { b: '7th Std', r: '9', n: 'Ibrahim', t: 5800, p: 0 },
      { b: '7th Std', r: '10', n: 'Janvi', t: 4800, p: 0 },
      { b: '7th Std', r: '11', n: 'Mayank', t: 5400, p: 0 },
      { b: '7th Std', r: '12', n: 'Pranit', t: 3000, p: 0 },
      { b: '7th Std', r: '13', n: 'Riya', t: 6000, p: 0 },
      { b: '7th Std', r: '14', n: 'Rudra', t: 7800, p: 0 },
      { b: '7th Std', r: '15', n: 'Samarth', t: 5800, p: 0 },
      { b: '7th Std', r: '16', n: 'Saras', t: 7000, p: 0 },
      { b: '7th Std', r: '17', n: 'Shivam', t: 6500, p: 0 },
      { b: '7th Std', r: '18', n: 'Shivansh', t: 5800, p: 0 },
      { b: '7th Std', r: '19', n: 'Tannu', t: 7500, p: 0 },
      { b: '7th Std', r: '20', n: 'Viraj', t: 0, p: 0 },
      { b: '7th Std', r: '21', n: 'Vivek', t: 6500, p: 0 },

      // 8th Std
      { b: '8th Std', r: '1', n: 'Anit Yadav', t: 5000, p: 0 },
      { b: '8th Std', r: '2', n: 'Anshika Yadav', t: 0, p: 0 },
      { b: '8th Std', r: '3', n: 'Ashish Houmbale', t: 7000, p: 0 },
      { b: '8th Std', r: '4', n: 'Dilesh Yadav', t: 8500, p: 0 },
      { b: '8th Std', r: '5', n: 'Janvi Ram', t: 0, p: 0 },
      { b: '8th Std', r: '6', n: 'Laksh Yadav', t: 0, p: 0 },
      { b: '8th Std', r: '7', n: 'Mangalam Dubey', t: 6000, p: 0 },
      { b: '8th Std', r: '8', n: 'Pradnesh Pawar', t: 6000, p: 0 },
      { b: '8th Std', r: '9', n: 'Princy Pal', t: 6000, p: 0 },
      { b: '8th Std', r: '10', n: 'Priya Sutar', t: 5500, p: 0 },
      { b: '8th Std', r: '11', n: 'Rishabh Yadav', t: 0, p: 0 },
      { b: '8th Std', r: '12', n: 'Simon Pal', t: 4000, p: 0 },

      // 9th Std
      { b: '9th Std', r: '1', n: 'Aryan Dhanraj', t: 9300, p: 0 },
      { b: '9th Std', r: '2', n: 'Neeraj Yadav', t: 0, p: 0 },
      { b: '9th Std', r: '3', n: 'Pritam Shukla', t: 9000, p: 0 },
      { b: '9th Std', r: '4', n: 'Raunak Yadav', t: 8000, p: 0 },
      { b: '9th Std', r: '5', n: 'Shlok Shukla', t: 0, p: 0 },
      { b: '9th Std', r: '6', n: 'Yash Yadav', t: 0, p: 0 },

      // 10th Std
      { b: '10th Std', r: '1', n: 'Aryan Jha', t: 0, p: 0 },
      { b: '10th Std', r: '2', n: 'Krishna Shukla', t: 13000, p: 0 },
      { b: '10th Std', r: '3', n: 'Namasvi Rajbhar', t: 15000, p: 0 },
      { b: '10th Std', r: '4', n: 'Nirmala', t: 0, p: 0 },
      { b: '10th Std', r: '5', n: 'Priya Gupta', t: 13000, p: 0 },
      { b: '10th Std', r: '6', n: 'Sai Mane', t: 13000, p: 0 }
    ];

    const insertS = db.prepare(`
      INSERT INTO students (roll_no, name, batch_id, total_fee, fees_paid, parent_phone, notes)
      VALUES (?, ?, ?, ?, ?, '', 'Official Coaching Roster')
    `);
    const insertFee = db.prepare(`
      INSERT INTO fee_transactions (student_id, amount, payment_date, payment_mode, reference_no, staff_name, notes)
      VALUES (?, ?, datetime('now', 'localtime'), 'Admission / Cash', 'INIT-' || ?, 'Mr. Roshan Yadav', 'Initial admission payment recorded')
    `);

    for (const s of officialRoster) {
      const bId = bMap[s.b];
      if (!bId) continue;
      const res = insertS.run(s.r, s.n, bId, s.t, s.p);
      if (s.p > 0) {
        insertFee.run(res.lastInsertRowid, s.p, res.lastInsertRowid);
      }
    }

    db.prepare(`
      INSERT INTO activity_logs (staff_name, action_type, description)
      VALUES (?, 'ROSTER_IMPORT', ?)
    `).run(
      'Mr. Roshan Yadav',
      `Mr. Roshan Yadav loaded official coaching roster: ${officialRoster.length} students across ${batchDefs.length} batches`
    );
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
      const numId = Number(id);
      const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(numId);
      if (!batch) return null;
      db.prepare('DELETE FROM attendance WHERE batch_id = ?').run(numId);
      db.prepare('DELETE FROM fee_transactions WHERE student_id IN (SELECT id FROM students WHERE batch_id = ?)').run(numId);
      db.prepare('DELETE FROM students WHERE batch_id = ?').run(numId);
      db.prepare('DELETE FROM batches WHERE id = ?').run(numId);
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
        data.parent_phone || '',
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
      const checkStudentStmt = db.prepare('SELECT id, total_fee, fees_paid FROM students WHERE roll_no = ? AND batch_id = ?');
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

        const existingStudent = checkStudentStmt.get(item.roll_no.toString().trim(), Number(targetBatchId));
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
