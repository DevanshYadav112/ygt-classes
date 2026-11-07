const zlib = require('node:zlib');

/**
 * Pure Node.js zero-dependency XLSX & CSV parser
 */
function parseZip(buffer) {
  const files = {};
  // Search for End of Central Directory Record (EOCD)
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Invalid zip/xlsx file format');
  }

  const cdCount = buffer.readUInt16LE(eocdOffset + 10);
  const cdSize = buffer.readUInt32LE(eocdOffset + 12);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  let offset = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fnameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);

    const filename = buffer.toString('utf8', offset + 46, offset + 46 + fnameLen);
    offset += 46 + fnameLen + extraLen + commentLen;

    // Read from local header
    const localFnameLen = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFnameLen + localExtraLen;
    const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);

    let decompressed;
    if (method === 0) {
      decompressed = compressedData;
    } else if (method === 8) {
      decompressed = zlib.inflateRawSync(compressedData);
    } else {
      continue;
    }
    files[filename] = decompressed.toString('utf8');
  }
  return files;
}

function parseXlsx(buffer) {
  const files = parseZip(buffer);

  // 1. Parse sharedStrings if present
  const sharedStrings = [];
  if (files['xl/sharedStrings.xml']) {
    const xml = files['xl/sharedStrings.xml'];
    // Matches <si>...<t>text</t>...</si> or multiple <t> in formatted run <r>
    const siRegex = /<si>([\s\S]*?)<\/si>/g;
    let match;
    while ((match = siRegex.exec(xml)) !== null) {
      const siContent = match[1];
      const tRegex = /<t(?:[^>]*)>([\s\S]*?)<\/t>/g;
      let fullText = '';
      let tMatch;
      while ((tMatch = tRegex.exec(siContent)) !== null) {
        fullText += tMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
      }
      sharedStrings.push(fullText);
    }
  }

  // 2. Find sheet1.xml (or first worksheet)
  let sheetXmlKey = Object.keys(files).find(k => k.startsWith('xl/worksheets/sheet') && k.endsWith('.xml'));
  if (!sheetXmlKey) sheetXmlKey = 'xl/worksheets/sheet1.xml';
  const sheetXml = files[sheetXmlKey];
  if (!sheetXml) {
    throw new Error('Worksheet XML not found in XLSX');
  }

  const rows = [];
  const rowRegex = /<row[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch;

  function colRefToIndex(colRef) {
    let col = 0;
    for (let i = 0; i < colRef.length; i++) {
      col = col * 26 + (colRef.charCodeAt(i) - 64);
    }
    return col - 1;
  }

  while ((rowMatch = rowRegex.exec(sheetXml)) !== null) {
    const rowContent = rowMatch[1];
    const cellRegex = /<c\s+r="([A-Z]+)\d+"(?:[^>]*?t="([a-z]+)")?[^>]*>(?:[\s\S]*?<v>([\s\S]*?)<\/v>)?[\s\S]*?<\/c>/g;
    let cellMatch;
    const rowData = [];
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const colLetter = cellMatch[1];
      const cellType = cellMatch[2];
      let val = cellMatch[3] !== undefined ? cellMatch[3] : '';
      const colIdx = colRefToIndex(colLetter);

      if (cellType === 's') {
        const sIdx = parseInt(val, 10);
        val = sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : '';
      } else {
        val = val.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
      }
      rowData[colIdx] = val;
    }

    // Fill blanks
    for (let i = 0; i < rowData.length; i++) {
      if (rowData[i] === undefined) rowData[i] = '';
    }
    if (rowData.some(c => c !== '')) {
      rows.push(rowData);
    }
  }

  return rows;
}

function parseCsv(text) {
  // Normalize newlines
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const rows = [];

  for (let line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let inQuotes = false;
    let currentCell = '';
    // Detect delimiter (tab or semicolon if present, otherwise comma)
    let delim = ',';
    if (!line.includes(',') && line.includes('\t')) delim = '\t';
    else if (!line.includes(',') && line.includes(';')) delim = ';';

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delim && !inQuotes) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
    row.push(currentCell.trim());
    if (row.some(c => c !== '')) {
      rows.push(row);
    }
  }
  return rows;
}

function buildZip(files) {
  const localHeaders = [];
  const centralDirs = [];
  let offset = 0;

  for (const f of files) {
    const filenameBuf = Buffer.from(f.path, 'utf8');
    const uncompressedData = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, 'utf8');
    const crc = zlib.crc32(uncompressedData);
    const compressedData = zlib.deflateRawSync(uncompressedData);

    const lh = Buffer.alloc(30 + filenameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compressedData.length, 18);
    lh.writeUInt32LE(uncompressedData.length, 22);
    lh.writeUInt16LE(filenameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    filenameBuf.copy(lh, 30);
    localHeaders.push(lh, compressedData);

    const cd = Buffer.alloc(46 + filenameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(8, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compressedData.length, 20);
    cd.writeUInt32LE(uncompressedData.length, 24);
    cd.writeUInt16LE(filenameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    filenameBuf.copy(cd, 46);
    centralDirs.push(cd);

    offset += lh.length + compressedData.length;
  }

  const cdTotalSize = centralDirs.reduce((acc, b) => acc + b.length, 0);
  const cdOffset = offset;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdTotalSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...centralDirs, eocd]);
}

function generateXlsx(sheets) {
  const sharedStrings = [];
  const stringMap = new Map();

  function getStringId(str) {
    const s = String(str);
    if (stringMap.has(s)) return stringMap.get(s);
    const id = sharedStrings.length;
    sharedStrings.push(s);
    stringMap.set(s, id);
    return id;
  }

  function colToLetter(c) {
    let s = '';
    c++;
    while (c > 0) {
      const m = (c - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      c = Math.floor((c - m) / 26);
    }
    return s;
  }

  function escapeXml(unsafe) {
    return String(unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const files = [];

  let sheetsXml = '';
  let wbRelsXml = '';
  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\n  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>\n`;

  sheets.forEach((sheet, i) => {
    const sheetId = i + 1;
    const rId = `rId${sheetId}`;
    const cleanSheetName = escapeXml((sheet.name || `Sheet${sheetId}`).slice(0, 31).replace(/[\\/*?:[\]]/g, ' '));
    sheetsXml += `    <sheet name="${cleanSheetName}" sheetId="${sheetId}" r:id="${rId}"/>\n`;
    wbRelsXml += `  <Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetId}.xml"/>\n`;
    contentTypesXml += `  <Override PartName="/xl/worksheets/sheet${sheetId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n`;

    let sheetData = '';
    sheet.rows.forEach((row, rIdx) => {
      const rowNum = rIdx + 1;
      let rowCells = '';
      row.forEach((cellVal, cIdx) => {
        const cellRef = `${colToLetter(cIdx)}${rowNum}`;
        if (cellVal === null || cellVal === undefined || cellVal === '') return;
        if (typeof cellVal === 'number' && !isNaN(cellVal)) {
          rowCells += `<c r="${cellRef}"><v>${cellVal}</v></c>`;
        } else {
          const sId = getStringId(cellVal);
          rowCells += `<c r="${cellRef}" t="s"><v>${sId}</v></c>`;
        }
      });
      sheetData += `<row r="${rowNum}">${rowCells}</row>`;
    });

    const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n  <sheetData>${sheetData}</sheetData>\n</worksheet>`;
    files.push({ path: `xl/worksheets/sheet${sheetId}.xml`, data: worksheetXml });
  });

  contentTypesXml += '</Types>';
  files.push({ path: '[Content_Types].xml', data: contentTypesXml });

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\n</Relationships>`;
  files.push({ path: '_rels/.rels', data: rootRelsXml });

  const fullWbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n${wbRelsXml}  <Relationship Id="rIdSharedStrings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>\n</Relationships>`;
  files.push({ path: 'xl/_rels/workbook.xml.rels', data: fullWbRelsXml });

  const fullWorkbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n  <sheets>\n${sheetsXml}  </sheets>\n</workbook>`;
  files.push({ path: 'xl/workbook.xml', data: fullWorkbookXml });

  let sstXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">\n`;
  for (const s of sharedStrings) {
    sstXml += `  <si><t>${escapeXml(s)}</t></si>\n`;
  }
  sstXml += '</sst>';
  files.push({ path: 'xl/sharedStrings.xml', data: sstXml });

  return buildZip(files);
}

module.exports = { parseZip, parseXlsx, parseCsv, generateXlsx, buildZip };
