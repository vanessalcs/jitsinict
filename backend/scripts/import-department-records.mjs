// One-time import of the 资讯处事项记录 Excel sheet into Firestore (department_records).
// Usage:
//   node backend/scripts/import-department-records.mjs "<path to .xlsx>"            # dry run, prints a preview
//   node backend/scripts/import-department-records.mjs "<path to .xlsx>" --write    # writes to Firestore
// --write needs `gcloud auth login` with an account that can write to the Firestore database,
// and refuses to run if department_records already contains documents.
//
// Sheet layout: row 1 title, row 2 headers, data from row 3:
//   序 | 日期 | 记录事项 | 处理事项 | 记录者 | 进度 | (标签)
// Dates are a mix of "dd/mm/yyyy" text and ISO strings such as "2026-01-04T00:00:00.000Z" whose day and
// month are swapped (Excel read dd/mm as mm/dd), so the ISO ones are swapped back.
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ExcelJS from 'exceljs';

const args = process.argv.slice(2);
const write = args.includes('--write');
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Usage: node backend/scripts/import-department-records.mjs "<path to .xlsx>" [--write]');
  process.exit(1);
}

const RECORDER_EMAILS = {
  廖梧茳: 'bkleow@jitsin-ind.edu.my',
  吴镇宏: 'chenhungng@jitsin-ind.edu.my',
  郑毓铭: 'ymteh@jitsin-ind.edu.my',
  黄世泓: 'shng@jitsin-ind.edu.my',
  林慈贤: 'cslim@jitsin-ind.edu.my',
  林慈賢: 'cslim@jitsin-ind.edu.my',
};

const pad = (n) => String(n).padStart(2, '0');

function cellText(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    if (v instanceof Date) return v.toISOString();
    if (v.richText) return v.richText.map((t) => t.text).join('');
    return String(v.result ?? v.text ?? '');
  }
  return String(v);
}

function parseDate(raw, rowNo) {
  const s = raw.trim().replace(/^"+|"+$/g, '');
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  if (m) {
    const [, y, a, b] = m; // a = what Excel took as month (really the day), b = what it took as day (really the month)
    if (Number(b) > 12) throw new Error(`Row ${rowNo}: cannot swap day/month in "${s}"`);
    return `${y}-${b}-${a}`;
  }
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  throw new Error(`Row ${rowNo}: unrecognised date "${raw}"`);
}

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(file);
const ws = wb.worksheets[0];

const records = [];
ws.eachRow({ includeEmpty: false }, (row, rowNo) => {
  if (rowNo < 3) return;
  const [, , dateRaw, contentRaw, handlersRaw, recorderRaw, progressRaw, tagRaw] = row.values.map((v) => v);
  const content = cellText(contentRaw).trim();
  if (!content) return;
  const recorderName = cellText(recorderRaw).trim();
  const progress = cellText(progressRaw).trim();
  const done = progress.startsWith('完成');
  records.push({
    date: parseDate(cellText(dateRaw), rowNo),
    content,
    handlers: cellText(handlersRaw).trim(),
    recorderName,
    recorderEmail: RECORDER_EMAILS[recorderName] ?? '',
    status: done ? 'done' : 'none',
    tag: cellText(tagRaw).trim(),
    expiryDate: content.includes('01-04-2027') ? '2027-04-01' : '',
    note: done ? progress.replace(/^完成[，,、\s]*/, '') : progress,
  });
});

// sanity check: the sheet is in chronological order, so a big step backwards means a mis-parsed date
records.forEach((r, i) => {
  if (i > 0 && r.date < records[i - 1].date) {
    console.warn(`Warning: record ${i + 1} (${r.date}) is earlier than the one before it (${records[i - 1].date})`);
  }
});

const unmatched = [...new Set(records.filter((r) => !r.recorderEmail).map((r) => r.recorderName))];
console.log(`Parsed ${records.length} records, ${records[0].date} to ${records.at(-1).date}.`);
console.log(`Status: ${records.filter((r) => r.status === 'done').length} done, ${records.filter((r) => r.status === 'none').length} unmarked.`);
console.log(`With expiry date: ${records.filter((r) => r.expiryDate).length}. Recorders without a matching email: ${unmatched.join(', ') || 'none'}.`);

if (!write) {
  records.slice(0, 5).concat(records.slice(-3)).forEach((r) =>
    console.log(`${r.date} | ${r.recorderName} | ${r.status} | ${r.content.slice(0, 40).replace(/\n/g, ' ')}`)
  );
  console.log('\nDry run only. Add --write to import.');
  process.exit(0);
}

const { webAppConfig, databaseId } = JSON.parse(
  readFileSync(new URL('../../frontend/firebase/config.json', import.meta.url), 'utf8')
);
const token = execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8', shell: true }).trim();
const base = `https://firestore.googleapis.com/v1/projects/${webAppConfig.projectId}/databases/${databaseId}/documents`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const existing = await fetch(`${base}/department_records?pageSize=1`, { headers });
if (!existing.ok) {
  console.error(`Lookup failed (${existing.status}): ${await existing.text()}`);
  process.exit(1);
}
if (((await existing.json()).documents ?? []).length > 0) {
  console.error('department_records already has documents; not importing again.');
  process.exit(1);
}

const str = (stringValue) => ({ stringValue });
const baseTime = Date.now();
const writes = records.map((r, i) => ({
  update: {
    name: `projects/${webAppConfig.projectId}/databases/${databaseId}/documents/department_records/${randomUUID()}`,
    fields: {
      date: str(r.date),
      content: str(r.content),
      handlers: str(r.handlers),
      recorderName: str(r.recorderName),
      recorderEmail: str(r.recorderEmail),
      status: str(r.status),
      tag: str(r.tag),
      expiryDate: str(r.expiryDate),
      note: str(r.note),
      createdAt: { integerValue: String(baseTime + i) },
    },
  },
  currentDocument: { exists: false },
}));

const res = await fetch(`${base}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
if (!res.ok) {
  console.error(`Import failed (${res.status}): ${await res.text()}`);
  process.exit(1);
}
console.log(`Imported ${writes.length} records into department_records.`);
