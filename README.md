# EduTrack

**A Student Progress Tracking SaaS for instructors.**

EduTrack is an instructor portal where each instructor signs in, manages their own students, takes attendance, grades tasks and sees performance analytics. Every instructor sees only their own data.

Built as the JavaScript Capstone Project 1 at Orange Coding Academy.

🌐 **Live demo:** [edu-track-dmyr.onrender.com](https://edu-track-dmyr.onrender.com/)
🔑 **Demo account:** `demo@edutrack.edu` / `demo1234`
📄 **Full screens documentation (PDF):** [docs/EduTrack-Screens.pdf](docs/EduTrack-Screens.pdf)

<p align="center">
  <img src="docs/screenshots/dashboard.png" width="800" alt="EduTrack dashboard">
</p>

## Features

- **Login & registration:** simulated multi-user login with form validation and "Keep me signed in".
- **Data isolation:** each instructor sees and edits only their own students, tasks and grades.
- **Dashboard:** class average, attendance, pass rate, at-risk students, deadlines, grade distribution chart and recent activity.
- **Students:** add, edit, delete and archive students, with search, filters, sorting and CSV export.
- **Student profile:** personal info, grades for every task, attendance record and feedback.
- **Attendance:** mark students present or absent for any date.
- **Tracking & grades:** add tasks, grade submissions with feedback and export the gradebook to CSV.
- **Extras:** responsive layout, light and dark theme, global student search.

## Screenshots

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/login.png" width="400"><br><b>Login</b></td>
    <td align="center"><img src="docs/screenshots/registration.png" width="400"><br><b>Registration</b></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/students.png" width="400"><br><b>Students</b></td>
    <td align="center"><img src="docs/screenshots/student-profile.png" width="400"><br><b>Student Profile</b></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/attendance.png" width="400"><br><b>Attendance</b></td>
    <td align="center"><img src="docs/screenshots/track.png" width="400"><br><b>Tracking & Grades</b></td>
  </tr>
</table>

<p align="center">
  <img src="docs/screenshots/dashboard-mobile.png" width="180" alt="Dashboard on mobile">
  <img src="docs/screenshots/students-mobile.png" width="180" alt="Students on mobile">
  <img src="docs/screenshots/track-mobile.png" width="180" alt="Tracking on mobile">
  <br><b>Mobile view</b>
</p>

All pages in desktop and mobile view are in the [PDF documentation](docs/EduTrack-Screens.pdf).

## Tech Stack

HTML5 · CSS3 · Vanilla JavaScript (ES6+ modules, `fetch`, `async/await`) · json-server · localStorage / sessionStorage · Font Awesome · SweetAlert2

## Getting Started

1. Clone the project:

```bash
   git clone https://github.com/HindBundoq/Edu-Track.git
   cd Edu-Track
```

2. Install the dependencies (requires [Node.js](https://nodejs.org/)):

```bash
   npm install
```

3. Start the server:

```bash
   npm start
```

4. Open `http://localhost:3000` in the browser.

5. Log in with the demo account: `demo@edutrack.edu` / `demo1234`

## API Notes

All data is stored in `db.json`. `server.js` runs json-server and serves the pages from the same address, so the API and the site share one origin (`http://localhost:3000` locally). Every request is filtered by the instructor's ID, for example:

| Method | Endpoint | Used for |
|---|---|---|
| GET | `/students?instructorId={id}` | Load the instructor's students |
| POST / PATCH / DELETE | `/students/{id}` | Add, edit or delete a student |
| GET / POST | `/tasks` | Load or add tasks |
| PATCH | `/submissions/{id}` | Save a grade and feedback |

> Passwords are stored as plain text and login is simulated in the browser. This is a learning project, so all the accounts, students and emails in `db.json` are demo data, not real people.

## Team

| Name | Role |
|---|---|
| Mustafa Joudeh | Scrum Master & Developer |
| Hind Bundoq | Product Owner & Developer |
| Mohammed AL-Faqih | Developer |
| Tamara Qweder | Developer |
| Dyaa Abuzanoneh | Developer |
