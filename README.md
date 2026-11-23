# IT EduIT Hub (资讯处 / 电脑科 教学与电教管理平台)

React + Vite frontend with a small Node.js backend that proxies Gemini (Vertex AI) calls.
Sign-in uses Firebase Google Auth; only accounts listed (and active) in the Firestore
`authorized_users` collection can enter.

This project is intended for demonstration and prototyping only.

## Project structure

- `frontend/`: React app (Vite + TypeScript). Build output goes to `frontend/dist/` (git-ignored).
- `backend/`: Express server that proxies Vertex AI requests using your Application Default Credentials.
- `frontend/firebase/`: Firebase web config (`config.json`) and Firestore security rules (`firestore.rules`).

## Prerequisites

- Node.js 20+ and npm
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install), then:
  ```bash
  gcloud init
  gcloud auth application-default login
  ```

## Setup

1. Install dependencies from the repo root:
   ```bash
   npm install
   ```
2. Create `backend/.env.local` from `backend/.env.example` and fill in the values.
   `PROXY_HEADER` is a random string of your choice.
3. Create `frontend/.env.local` from `frontend/.env.example`, using the **same** value for
   `VITE_PROXY_HEADER` as `PROXY_HEADER` in the backend.

   Both `.env.local` files are git-ignored. Never commit them.

### Backend environment variables (`backend/.env.local`)

| Variable | Meaning |
| --- | --- |
| `API_BACKEND_HOST` | Host to listen on (default `127.0.0.1`, keep it local) |
| `API_BACKEND_PORT` | Port (default `5000`) |
| `API_PAYLOAD_MAX_SIZE` | Max request body size (e.g. `7mb`) |
| `GOOGLE_CLOUD_PROJECT` | Google Cloud project ID |
| `GOOGLE_CLOUD_LOCATION` | Google Cloud region |
| `PROXY_HEADER` | Shared secret the frontend must send in `X-App-Proxy` |

## Firebase / access control

1. Deploy `frontend/firebase/firestore.rules` to your Firestore database (`databaseId` in `config.json`).
2. Create the first super admin. Easiest: run `gcloud auth login`, then
   `node backend/scripts/seed-super-admin.mjs cslim@jitsin-ind.edu.my "林慈贤"`.
   Or create it by hand in the Firebase console: a document at
   `authorized_users/<lowercase-email>` with these fields:
   `email`, `name`, `title`, `department`, `avatarColor`, `isActive: true`, `isSuperAdmin: true`,
   `canPostAnnouncements`, `canComment` (booleans), `allowedReports` (array of strings).
3. Super admins can then add and manage the remaining members from the **成员权限管理** tab in the app.

## File uploads (公文与空白表单)

Uploaded files (PDF, Word, Excel, PowerPoint, TXT, CSV, RTF, ODF; max 10 MB each) are stored in
Firebase Storage, and their records in the Firestore `uploaded_documents` collection.

One-time setup in the Firebase console:
1. **Build → Storage → Get started** to create the default bucket
   (it must match `storageBucket` in `frontend/firebase/config.json`).
2. Storage → **Rules**: paste `frontend/firebase/storage.rules` and Publish.
3. Firestore → database `app-builder-44ef90f9` → **Rules**: re-publish `frontend/firebase/firestore.rules`
   (it now also covers `uploaded_documents`).

### File management (文件管理后台, super admins only)

Super admins get a **文件管理后台** page in the sidebar to rename, recategorise, replace, delete
(single or bulk) and edit `.txt` / `.csv` files in the browser. The text editor reads files directly
from Storage, which needs CORS enabled on the bucket (one time, after Storage is created):

```bash
gcloud storage buckets update gs://jit-sin-ai.firebasestorage.app --cors-file=frontend/firebase/storage.cors.json
```

Re-publish `firestore.rules` after pulling this change (it adds the super-admin update rule).

## Scripts (run from the repo root)

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts frontend (Vite) and backend together |
| `npm run typecheck` | Type-checks the frontend |
| `npm run build` | Type-checks and builds the frontend to `frontend/dist/` |
