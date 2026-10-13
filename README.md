# Tech Expo 2026 — Robotics Event Website

React frontend + Flask backend + Firebase Firestore.

- **Website:** an animated landing page. The **Register Now** buttons open the registration page, and each student gets a unique entry ID.
- **Admin dashboard** (`/admin`): login, live participant list, search and filters, attendance by ID, PDF certificates, and certificate emails with retry.

```
tech-expo/
├── frontend/                React (Vite)
│   ├── src/config/event.js  ← event + school details (edit this)
│   ├── src/assets/          ← put school-logo.png here
│   ├── src/api/client.js    ← all calls to Flask
│   ├── src/pages/           Home, Register, admin/Admin
│   └── src/components/      landing sections, admin panels, illustrations
└── backend/                 Flask
    ├── app.py               start here
    ├── config.py            reads .env
    ├── .env.example         ← copy to .env and fill in
    ├── routes/              public.py (register), admin.py (everything admin)
    ├── services/database.py ← Firebase Firestore code
    ├── services/certificate_pdf.py, email_service.py, certificates.py
    └── assets/              ← put school-logo.png here (for PDF certificates)
```

---

## 1. Install the tools (one time)

1. **Node.js 18 or newer:** https://nodejs.org (LTS version). Check it with `node -v`.
2. **Python 3.10 – 3.13:** https://www.python.org/downloads/. During install, **tick "Add Python to PATH"**. Check it with `python --version`.
3. **VS Code:** https://code.visualstudio.com. Optional extensions: *Python*, *ES7 React snippets*.

Open the `tech-expo` folder in VS Code (**File → Open Folder**). Open a terminal with **Terminal → New Terminal**. The commands below are for the default PowerShell terminal.

---

## 2. Backend setup (Flask)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1        # if blocked: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
pip install -r requirements.txt
copy .env.example .env
```

Open `backend/.env` and set at least:

| Setting | What to put |
|---|---|
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Your admin login |
| `JWT_SECRET` | Run `python -c "import secrets; print(secrets.token_hex(32))"` and paste the output |
| `EVENT_*`, `SCHOOL_NAME`, `SIGNATORY_*` | Details printed on certificates |

**Try it before Firebase is connected:** set `DATABASE=memory`, then run:

```powershell
python app.py
```

Open http://localhost:5000/api/health. You should see `{"ok": true, ...}`. In memory mode, data is lost every time the server stops, so use it only for testing.

---

## 3. Connect Firebase Firestore

1. Go to https://console.firebase.google.com → **Add project** → give it a name (Google Analytics is optional).
2. Left menu → **Build → Firestore Database** → **Create database**. Choose a location near you (e.g. `asia-south1` Mumbai) and select **Start in production mode**.
3. Click ⚙ **Project settings → Service accounts → Generate new private key**. A `.json` file downloads.
4. Rename that file to **`serviceAccountKey.json`** and put it in the **`backend/`** folder.
5. In `backend/.env`, set:
   ```
   DATABASE=firestore
   FIREBASE_CREDENTIALS=serviceAccountKey.json
   ```
6. Restart the backend (`Ctrl+C`, then `python app.py`).

That's all. The collections (`participants`, `mobile_index`) are created automatically when the first student registers.

**Security rules:** only the Flask server talks to Firestore, through the Admin SDK (which ignores rules). So lock the database to everyone else. In **Firestore → Rules**, use:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

> ⚠ The key file gives full access to your database. Never put it in the frontend, never send it on WhatsApp, and never commit it to GitHub (`.gitignore` already excludes it).

The database code is in `backend/services/database.py` (`FirestoreRepository`).

---

## 4. Frontend setup (React)

In a **second** terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173. The admin page is at http://localhost:5173/admin.

`frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```

---

## 5. How the unique ID works

- The format is `TE26-XXXXXX`, for example `TE26-K7M2QX`. You can change the prefix and length in `backend/.env` (`ID_PREFIX`, `ID_LENGTH`).
- The 6 characters are chosen with Python's `secrets` module from 31 easy-to-read characters. There is no 0/O or 1/I/L, so IDs are easy to read out at the desk. That gives about 887 million possible IDs.
- **The ID is the Firestore document ID.** It is written inside a Firestore **transaction** using `create()`, which fails if that ID already exists. In that case a new ID is generated. So **two students can never get the same ID**, even if they register at the same moment.
- The ID is saved permanently with the student's record and never changes. Admins can find it any time by searching name, mobile or email in the dashboard.
- One registration per mobile number is enforced in the same transaction, using `mobile_index/{mobile}`. To let siblings share a parent's number, set `ALLOW_DUPLICATE_MOBILE=true`.

Code: `backend/services/id_generator.py` and `create_participant()` in `backend/services/database.py`.

---

## 6. Email setup (for certificates)

Email is optional. Without it, the admin can still view and **download PDF certificates**. The dashboard shows a notice and turns off the send buttons.

**Gmail:**
1. Turn on **2-Step Verification** for the Google account: https://myaccount.google.com/security
2. Create an **App password**: https://myaccount.google.com/apppasswords. Name it "Tech Expo" and copy the 16-character password.
3. In `backend/.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USE_SSL=false
   SMTP_USERNAME=yourschool@gmail.com
   SMTP_PASSWORD=abcd efgh ijkl mnop
   EMAIL_FROM=yourschool@gmail.com
   EMAIL_FROM_NAME=Tech Expo 2026
   ```
4. Restart the backend.

Gmail allows about **500 emails per day** from a normal account. For bigger events, use Google Workspace, Zoho or Brevo SMTP, which work the same way with their own host and port.

**Eligibility rules (enforced by the backend):** a student gets an email only if they are **marked present** AND gave a **valid email**. Present students without email are recorded as `skipped`. Absent students are never sent anything. Each student's status is saved in Firestore as `certificate_generated`, `email_status` (`pending` / `sent` / `failed` / `skipped`), `email_error` and timestamps. Failed emails appear in the dashboard with a **Retry** button. **Generate & email all eligible** also retries failed ones and never re-sends to students already marked `sent`.

---

## 7. Add or replace the school logo

- **Website:** save your logo as `frontend/src/assets/school-logo.png` (`.jpg`, `.svg` or `.webp` also work). It appears automatically in the navbar, registration page, school section, admin login and certificate preview. No code change is needed.
- **PDF certificates:** save the same logo as `backend/assets/school-logo.png` (or set `CERT_LOGO_PATH` in `.env`).

## 8. Change event details

- **Website text:** edit `frontend/src/config/event.js`. It holds the name, date, countdown date (`dateISO`), venue, contact, school name and blurb, zones and schedule.
- **Certificates and emails:** edit `EVENT_NAME`, `EVENT_DATE`, `EVENT_VENUE`, `SCHOOL_NAME` and `SIGNATORY_LEFT/RIGHT` in `backend/.env`.
- **Colours and fonts:** edit the `:root` block at the top of `frontend/src/index.css`.

---

## 9. Run everything (every time)

| Terminal 1 (backend) | Terminal 2 (frontend) |
|---|---|
| `cd backend`<br>`.\venv\Scripts\Activate.ps1`<br>`python app.py` | `cd frontend`<br>`npm run dev` |

Then go to the website at http://localhost:5173 and the admin dashboard at http://localhost:5173/admin.

**On event day,** to let other devices on the same Wi-Fi register (for example phones at the desk):
- Run the frontend with `npm run dev -- --host`.
- Set `VITE_API_URL=http://<your-PC-IP>:5000/api` in `frontend/.env`.
- Add `http://<your-PC-IP>:5173` to `FRONTEND_ORIGIN` in `backend/.env`.
- Find your IP with `ipconfig`. Windows Firewall may ask for permission; allow it on private networks.

## 10. Deploying online (optional)

- **Frontend:** run `npm run build` and upload the `frontend/dist` folder to Netlify or Vercel. Add a redirect so `/admin` and `/register` work. For Netlify, create `public/_redirects` containing `/* /index.html 200`. Set `VITE_API_URL` to your backend URL before building.
- **Backend:** Render, Railway or any VPS. The start command is `waitress-serve --port=$PORT app:app`. Put the key JSON in the `FIREBASE_CREDENTIALS_JSON` environment variable instead of uploading the file. Set `FRONTEND_ORIGIN` to your live site URL.

---

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | – | Server check |
| POST | `/api/register` | – | `{name, mobile, email?}` → `{id, ...}` (rate-limited) |
| POST | `/api/admin/login` | – | `{username, password}` → `{token}` |
| GET | `/api/admin/status` | admin | Is email configured, which database is in use |
| GET | `/api/admin/participants` | admin | All participants (newest first) |
| GET | `/api/admin/participants/<id>` | admin | One participant |
| POST | `/api/admin/attendance/<id>` | admin | Mark present (404 invalid ID, 409 already marked) |
| GET | `/api/admin/certificates/<id>/pdf` | admin | Download the PDF (present students only) |
| POST | `/api/admin/certificates/<id>/send` | admin | Email one certificate (also used for retry) |
| POST | `/api/admin/certificates/send-all` | admin | Email all eligible students → `{sent, failed, skipped, already_sent}` |

Admin requests send `Authorization: Bearer <token>`. Tokens expire after `JWT_EXPIRES_HOURS`.

## Security notes

- The Firebase key, admin password, JWT secret and SMTP password live **only** in `backend/.env`. The frontend never sees them.
- Admin routes need a signed token. Login is limited to 10 tries per minute and registration to `REGISTER_RATE_LIMIT`. Note that a whole school on one Wi-Fi counts as one IP, so keep that limit generous.
- CORS only allows the address in `FRONTEND_ORIGIN`.
- To avoid keeping the password in plain text, set `ADMIN_PASSWORD_HASH` instead. Generate it with `python -c "from werkzeug.security import generate_password_hash as g; print(g('your-password'))"` and leave `ADMIN_PASSWORD` empty.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server" on the website | The backend isn't running, or `VITE_API_URL` is wrong. Restart `npm run dev` after editing `.env`. |
| "Database not connected: Firebase key file not found" | Put `serviceAccountKey.json` in `backend/`, or check `FIREBASE_CREDENTIALS` |
| CORS error in the browser console | Add the exact frontend address to `FRONTEND_ORIGIN` and restart the backend |
| "SMTP login failed" | Use a Gmail **App password**, not your normal password. 2-Step Verification must be on. |
| `Activate.ps1 cannot be loaded` | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once |
| A Firestore index error appears in the backend log | Click the link in the error to create the index (not normally needed) |
