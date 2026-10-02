import { calculateAttendanceRate } from "../modules/reports.js";
import { getLayout } from "./layout.js";

// ===================== Config =====================
const API = "http://localhost:3000";

function readInstructor() {
  try {
    return (
      JSON.parse(localStorage.getItem("currentInstructor")) ||
      JSON.parse(sessionStorage.getItem("currentInstructor"))
    );
  } catch {
    return null;
  }
}

const currentInstructor = readInstructor();

if (!currentInstructor?.id) {
  window.location.href = "./index.html";
  throw new Error("No logged-in instructor");
}

const instructorId = currentInstructor.id;
const encodedId = encodeURIComponent(instructorId);
const content = document.getElementById("content");

// ===================== State =====================
let students = [];             // only this instructor's students
let selectedDate = todayISO();
let marks = {};                // { studentId: "present" | "absent" } for the selected date
let searchTerm = "";

// ===================== Helpers =====================
function sameId(a, b) {
  return String(a) === String(b);
}

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d - offset).toISOString().slice(0, 10);
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function getJSON(path) {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

async function sendJSON(path, method, body) {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

// Read the saved status of every student for the selected date
function loadMarksForDate() {
  marks = {};
  students.forEach((st) => {
    const entry = (st.attendance || []).find((a) => a.date === selectedDate);
    if (entry) marks[st.id] = entry.status;
  });
}

// ===================== Data =====================
async function loadStudents() {
  const raw = await getJSON(`students?instructorId=${encodedId}`);

  // Safety net: instructor ids are strings ("1") but students store numbers (1)
  students = raw
    .filter((s) => sameId(s.instructorId, instructorId))
    .filter((s) => s.status !== "archived")
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function saveAttendance() {
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  try {
    // Only students whose status for this date actually changed
    const changed = students.filter((st) => {
      const old = (st.attendance || []).find((a) => a.date === selectedDate);
      return marks[st.id] && marks[st.id] !== old?.status;
    });

    await Promise.all(
      changed.map(async (st) => {
        const attendance = (st.attendance || []).filter((a) => a.date !== selectedDate);
        attendance.push({ date: selectedDate, status: marks[st.id] });
        attendance.sort((a, b) => a.date.localeCompare(b.date));

        const updated = await sendJSON(`students/${encodeURIComponent(st.id)}`, "PATCH", {
          attendance,
        });
        st.attendance = updated.attendance;

        await sendJSON("activities", "POST", {
          instructorId,
          studentId: st.id,
          type: "attendance_updated",
          message: `${st.name}'s attendance was updated`,
          date: new Date().toISOString(),
        });
      }),
    );

    showMessage(
      changed.length ? `Saved attendance for ${changed.length} student(s) ✅` : "Nothing changed",
      "ok",
    );
    render();
  } catch (error) {
    console.error(error);
    showMessage("Couldn't save attendance. Is json-server running?", "bad");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save attendance";
  }
}

// ===================== Render =====================
function showMessage(text, type) {
  const box = document.getElementById("message");
  if (!box) return;
  box.innerHTML = `<p class="tag ${type === "bad" ? "tag-bad" : ""}">${escapeHTML(text)}</p>`;
  setTimeout(() => (box.innerHTML = ""), 3000);
}

function summary() {
  const present = students.filter((s) => marks[s.id] === "present").length;
  const absent = students.filter((s) => marks[s.id] === "absent").length;
  const unmarked = students.length - present - absent;
  return { present, absent, unmarked };
}

function renderRows() {
  const term = searchTerm.trim().toLowerCase();
  const list = students.filter(
    (s) => !term || s.name.toLowerCase().includes(term) || String(s.id).includes(term),
  );

  if (students.length === 0) {
    return `<p class="empty">No students assigned to you yet</p>`;
  }
  if (list.length === 0) {
    return `<p class="empty">No students match "${escapeHTML(searchTerm)}"</p>`;
  }

  return `<ul class="list">
    ${list
      .map((st) => {
        const status = marks[st.id];
        const rate = calculateAttendanceRate(st);
        return `
          <li class="list-item">
            <span class="mini-avatar">${initials(st.name)}</span>
            <div class="list-main">
              <p class="list-title">${escapeHTML(st.name)}</p>
              <p class="list-meta">ID ${escapeHTML(st.id)} · Attendance ${rate.toFixed(0)}%</p>
            </div>
            <div class="att-actions">
              <button class="btn btn-sm ${status === "present" ? "" : "btn-outline"}"
                      data-id="${escapeHTML(st.id)}" data-status="present">
                <i class="fa-solid fa-check"></i> Present
              </button>
              <button class="btn btn-sm ${status === "absent" ? "btn-danger" : "btn-outline"}"
                      data-id="${escapeHTML(st.id)}" data-status="absent">
                <i class="fa-solid fa-xmark"></i> Absent
              </button>
            </div>
          </li>`;
      })
      .join("")}
  </ul>`;
}

function render() {
  const { present, absent, unmarked } = summary();

  content.innerHTML = `
    <section class="card">
      <header class="card-head">
        <h2>Attendance <span class="count">${students.length}</span></h2>
      </header>

      <div class="att-toolbar">
        <input type="date" id="dateInput" value="${selectedDate}" max="${todayISO()}" />
        <input type="search" id="searchInput" placeholder="Search by name or ID" value="${escapeHTML(searchTerm)}" />
        <button class="btn btn-outline btn-sm" id="allPresentBtn">Mark all present</button>
      </div>

      <p class="list-meta">
        Present: <strong>${present}</strong> ·
        Absent: <strong>${absent}</strong> ·
        Not marked: <strong>${unmarked}</strong>
      </p>

      <div id="rows">${renderRows()}</div>

      <div class="att-footer">
        <div id="message"></div>
        <button class="btn" id="saveBtn" ${students.length ? "" : "disabled"}>Save attendance</button>
      </div>
    </section>
  `;

  bindEvents();
}

// ===================== Events =====================
function bindEvents() {
  document.getElementById("dateInput").addEventListener("change", (e) => {
    selectedDate = e.target.value || todayISO();
    loadMarksForDate();
    render();
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    document.getElementById("rows").innerHTML = renderRows();
  });

  document.getElementById("allPresentBtn").addEventListener("click", () => {
    students.forEach((st) => (marks[st.id] = "present"));
    render();
  });

  document.getElementById("rows").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-status]");
    if (!btn) return;
    marks[btn.dataset.id] = btn.dataset.status;
    render();
  });

  document.getElementById("saveBtn").addEventListener("click", saveAttendance);
}

// ===================== Main =====================
async function init() {
  await getLayout();
  content.innerHTML = `<p class="loading">Loading students…</p>`;

  try {
    await loadStudents();
    loadMarksForDate();
    render();
  } catch (error) {
    console.error(error);
    content.innerHTML = `
      <div class="card error-card">
        <h2>Couldn't load attendance</h2>
        <p>Make sure json-server is running:</p>
        <code>npx json-server db.json --port 3000</code>
      </div>`;
  }
}

init();