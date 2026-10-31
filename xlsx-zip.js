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

module.exports = { parseZip, parseXlsx, parseCsv };
