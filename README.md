# Edu-Track

Instructor portal for managing students, attendance, grades, and progress.

## Requirements

- Node.js (for json-server)
- A modern browser

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the API (json-server on port 3000):

```bash
npm start
```

3. Open the app in your browser (use a local static server so modules/layout fetch work), for example:

```bash
npx serve .
```

Then go to `http://localhost:3000` for the API and open the HTML pages via the static server URL (e.g. `http://localhost:5000/index.html`).

Or open pages with Live Server / VS Code if you prefer.

## Demo login

Use an instructor from `db.json`, for example:

- Email: `mohammed@gmail.com`
- Password: `123456`

## Project structure

- `index.html` / `registration.html` — auth
- `dashboard.html` — overview
- `students.html` — student list & CRUD
- `track.html` — tasks & grading
- `attendance.html` — attendance (in progress)
- `student-profile.html` — single student profile
- `js/modules/` — shared API, auth, reports
- `js/pages/` — page scripts
- `db.json` — mock database for json-server
