// One-time bootstrap: creates the first super admin in Firestore (authorized_users/<email>).
// Usage (after `gcloud auth login` with an account that can write to the Firestore database):
//   node backend/scripts/seed-super-admin.mjs <email> "<name>"
// Refuses to overwrite an existing document.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const isMember = args.includes('--member'); // regular member instead of super admin
const [emailArg, name] = args.filter((a) => a !== '--member');
if (!emailArg || !name) {
  console.error('Usage: node backend/scripts/seed-super-admin.mjs <email> "<name>" [--member]');
  process.exit(1);
}
const email = emailArg.trim().toLowerCase();

const { webAppConfig, databaseId } = JSON.parse(
  readFileSync(new URL('../../frontend/firebase/config.json', import.meta.url), 'utf8')
);
const token = execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8', shell: true }).trim();

const docUrl =
  `https://firestore.googleapis.com/v1/projects/${webAppConfig.projectId}` +
  `/databases/${databaseId}/documents/authorized_users/${encodeURIComponent(email)}`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const existing = await fetch(docUrl, { headers });
if (existing.ok) {
  console.error(`authorized_users/${email} already exists; not overwriting.`);
  process.exit(1);
}
if (existing.status !== 404) {
  console.error(`Lookup failed (${existing.status}): ${await existing.text()}`);
  process.exit(1);
}

const str = (stringValue) => ({ stringValue });
const bool = (booleanValue) => ({ booleanValue });
const reports = ['lab_maintenance', 'grade_summary', 'equipment_inventory', 'lab_utilization'];

const res = await fetch(docUrl, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    fields: {
      email: str(email),
      name: str(name),
      title: str('IT老师 / 资讯处助理'),
      department: str('资讯处 / 电脑科'),
      avatarColor: str('from-emerald-500 to-teal-600'),
      isActive: bool(true),
      isSuperAdmin: bool(!isMember),
      canPostAnnouncements: bool(!isMember),
      canComment: bool(true),
      allowedReports: { arrayValue: { values: (isMember ? ['grade_summary'] : reports).map(str) } },
    },
  }),
});
if (!res.ok) {
  console.error(`Create failed (${res.status}): ${await res.text()}`);
  process.exit(1);
}
console.log(`Created ${isMember ? 'member' : 'super admin'}: authorized_users/${email}`);
