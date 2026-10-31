const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { initDb } = require('./db.js');
const { parseXlsx, parseCsv } = require('./xlsx-zip.js');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'coaching.db');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize database
const db = initDb(DB_PATH);

// Active SSE clients for real-time multi-staff sync
const sseClients = new Set();

function broadcast(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.csv': 'text/csv; charset=utf-8',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Staff-Name'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function readBinaryBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const staffName = decodeURIComponent(req.headers['x-staff-name'] || 'Mr. Jones');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Staff-Name'
    });
    return res.end();
  }

  try {
    // 1. SSE Real-Time Stream
    if (pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(':connected\n\n');
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // 2. Dashboard Stats
    if (pathname === '/api/dashboard' && req.method === 'GET') {
      const stats = db.getDashboardStats();
      return sendJson(res, 200, { success: true, stats });
    }

    // 3. Batches
    if (pathname === '/api/batches' && req.method === 'GET') {
      const batches = db.getBatches();
      return sendJson(res, 200, { success: true, batches });
    }

    if (pathname === '/api/batches' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.name) return sendJson(res, 400, { error: 'Batch name is required' });
      const batchId = db.createBatch(body.name, body.code, body.schedule, body.default_fee);
      db.addActivityLog(staffName, 'BATCH_CREATED', `${staffName} created new batch: ${body.name}`, null, batchId);
      broadcast('data_changed', { type: 'batch_created', batchId, staffName });
      return sendJson(res, 201, { success: true, batchId });
    }

    // 4. Students
    if (pathname === '/api/students' && req.method === 'GET') {
      const batch_id = parsedUrl.searchParams.get('batch_id');
      const search = parsedUrl.searchParams.get('search') || '';
      const pending_only = parsedUrl.searchParams.get('pending_only') === 'true';
      const limit = Number(parsedUrl.searchParams.get('limit')) || 200;
      const offset = Number(parsedUrl.searchParams.get('offset')) || 0;

      const result = db.getStudents({ batch_id, search, pending_only, limit, offset });
      return sendJson(res, 200, { success: true, ...result });
    }

    if (pathname.startsWith('/api/students/') && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const data = db.getStudentById(id);
      if (!data) return sendJson(res, 404, { error: 'Student not found' });
      return sendJson(res, 200, { success: true, ...data });
    }

    if (pathname === '/api/students' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.name || !body.roll_no || !body.batch_id || !body.parent_phone) {
        return sendJson(res, 400, { error: 'Name, Roll No, Batch, and Parent Phone are required' });
      }
      try {
        const studentId = db.createStudent(body, staffName);
        broadcast('data_changed', { type: 'student_added', studentId, staffName });
        return sendJson(res, 201, { success: true, studentId });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (pathname.startsWith('/api/students/') && req.method === 'PUT') {
      const id = pathname.split('/')[3];
      const body = await parseJsonBody(req);
      try {
        db.updateStudent(id, body, staffName);
        broadcast('data_changed', { type: 'student_updated', studentId: id, staffName });
        return sendJson(res, 200, { success: true });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // 5. Fee Payment Recording
    if (pathname === '/api/fees/pay' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { student_id, amount, payment_mode, reference_no, notes } = body;
      if (!student_id || !amount) {
        return sendJson(res, 400, { error: 'Student ID and Amount are required' });
      }

      try {
        const paymentResult = db.recordFeePayment(student_id, amount, payment_mode, reference_no, notes, staffName);
        broadcast('fee_update', { paymentResult, staffName });
        return sendJson(res, 200, { success: true, payment: paymentResult });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // 6. Attendance
    if (pathname === '/api/attendance' && req.method === 'GET') {
      const batch_id = parsedUrl.searchParams.get('batch_id');
      const date = parsedUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10);
      if (!batch_id) return sendJson(res, 400, { error: 'batch_id is required' });

      const attendance = db.getBatchAttendance(batch_id, date);
      return sendJson(res, 200, { success: true, date, batch_id, attendance });
    }

    if (pathname === '/api/attendance' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { batch_id, date, records } = body;
      if (!batch_id || !date || !Array.isArray(records)) {
        return sendJson(res, 400, { error: 'batch_id, date, and records array are required' });
      }

      try {
        const result = db.saveBatchAttendance(batch_id, date, records, staffName);
        broadcast('attendance_update', { batch_id, date, result, staffName });
        return sendJson(res, 200, { success: true, result });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // 7. Activity Logs
    if (pathname === '/api/logs' && req.method === 'GET') {
      const limit = Number(parsedUrl.searchParams.get('limit')) || 50;
      const logs = db.getActivityLogs(limit);
      return sendJson(res, 200, { success: true, logs });
    }

    // 8. Staff Management
    if (pathname === '/api/staff' && req.method === 'GET') {
      const staff = db.getStaffList();
      return sendJson(res, 200, { success: true, staff });
    }

    if (pathname === '/api/staff' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.name) return sendJson(res, 400, { error: 'Staff name is required' });
      const newStaff = db.addStaff(body.name, body.role);
      broadcast('data_changed', { type: 'staff_added', staff: newStaff });
      return sendJson(res, 201, { success: true, staff: newStaff });
    }

    // 9. Excel / CSV File Upload
    if (pathname === '/api/import' && req.method === 'POST') {
      const filename = parsedUrl.searchParams.get('filename') || 'upload.csv';
      const batchId = parsedUrl.searchParams.get('batch_id');
      const buffer = await readBinaryBody(req);

      if (!buffer || buffer.length === 0) {
        return sendJson(res, 400, { error: 'No file data received' });
      }

      let rows = [];
      if (filename.toLowerCase().endsWith('.xlsx')) {
        try {
          rows = parseXlsx(buffer);
        } catch (e) {
          return sendJson(res, 400, { error: 'Failed to parse Excel file: ' + e.message });
        }
      } else {
        const text = buffer.toString('utf8');
        rows = parseCsv(text);
      }

      if (rows.length < 2) {
        return sendJson(res, 400, { error: 'File contains less than 2 rows (header + at least 1 record required)' });
      }

      // Column mapping
      const headers = rows[0].map(h => (h || '').toString().toLowerCase().trim());
      function findCol(keywords) {
        for (let i = 0; i < headers.length; i++) {
          for (const kw of keywords) {
            if (headers[i] === kw || headers[i].includes(kw)) return i;
          }
        }
        return -1;
      }

      const nameIdx = findCol(['student name', 'candidate name', 'full name', 'name']);
      const rollIdx = findCol(['roll', 'roll no', 'reg no', 'adm no', 'id', 'student id']);
      const parentPhoneIdx = findCol(['parent mobile', 'parent phone', 'father mobile', 'father phone', 'mother phone', 'phone', 'mobile', 'contact']);
      const parentNameIdx = findCol(['parent name', 'father name', 'mother name', 'guardian']);
      const studentPhoneIdx = findCol(['student mobile', 'student phone', 'alt phone']);
      const emailIdx = findCol(['email', 'mail']);
      const totalFeeIdx = findCol(['total fee', 'total fees', 'course fee', 'fee', 'fees']);
      const feesPaidIdx = findCol(['fee paid', 'fees paid', 'amount paid', 'paid', 'advance']);
      const batchIdx = findCol(['batch', 'batch name', 'class']);

      if (nameIdx === -1 || rollIdx === -1) {
        return sendJson(res, 400, {
          error: `Could not identify required columns in header row: [${rows[0].join(', ')}]. Please ensure "Name" and "Roll No" are present.`
        });
      }

      const studentsToImport = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || !row[nameIdx]) continue;

        const name = (row[nameIdx] || '').toString().trim();
        const roll_no = (row[rollIdx] || '').toString().trim();
        if (!name || !roll_no) continue;

        const parent_phone = parentPhoneIdx !== -1 && row[parentPhoneIdx] ? row[parentPhoneIdx].toString().trim() : '';
        const parent_name = parentNameIdx !== -1 && row[parentNameIdx] ? row[parentNameIdx].toString().trim() : '';
        const student_phone = studentPhoneIdx !== -1 && row[studentPhoneIdx] ? row[studentPhoneIdx].toString().trim() : '';
        const email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx].toString().trim() : '';
        const total_fee = totalFeeIdx !== -1 ? Number(row[totalFeeIdx]) || 0 : 0;
        const fees_paid = feesPaidIdx !== -1 ? Number(row[feesPaidIdx]) || 0 : 0;
        const batch_name = batchIdx !== -1 && row[batchIdx] ? row[batchIdx].toString().trim() : null;

        studentsToImport.push({
          name,
          roll_no,
          parent_phone: parent_phone || 'N/A',
          parent_name,
          student_phone,
          email,
          total_fee,
          fees_paid,
          batch_name
        });
      }

      if (studentsToImport.length === 0) {
        return sendJson(res, 400, { error: 'No valid student records found in file' });
      }

      const importResult = db.bulkImportStudents(studentsToImport, batchId || 1, staffName);
      broadcast('data_changed', { type: 'excel_imported', importResult, staffName });

      return sendJson(res, 200, {
        success: true,
        summary: importResult
      });
    }

    // 10. Sample CSV Download
    if (pathname === '/api/sample-csv') {
      const csv = `Roll No,Student Name,Parent Name,Parent Mobile,Total Fees,Fees Paid,Batch Name
101,Rahul Sharma,Sunil Sharma,9876543210,65000,40000,Batch 1 - Class 11 JEE (Advanced)
102,Priya Patel,Kirit Patel,9876543211,65000,20000,Batch 1 - Class 11 JEE (Advanced)
103,Amit Verma,Rajesh Verma,9876543212,60000,60000,Batch 2 - Class 11 NEET (Medical)
104,Sneha Joshi,Mukesh Joshi,9876543213,60000,15000,Batch 2 - Class 11 NEET (Medical)
105,Vikram Singh,Harpreet Singh,9876543214,75000,35000,Batch 3 - Class 12 JEE (Mains + Adv)`;

      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="coaching_students_template.csv"'
      });
      return res.end(csv);
    }

    // 11. Static File Serving
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Access Denied');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Fallback to index.html for SPA
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (error) {
    console.error('Server error:', error);
    sendJson(res, 500, { error: 'Internal Server Error: ' + error.message });
  }
});

// Periodic heartbeat for SSE
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(':heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 YGT Classes Coaching Management Server running at: http://localhost:${PORT}`);
  console.log(`🌐 Available across local network at port ${PORT}`);
});
