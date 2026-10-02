import {
  getStudentById,
  getStudentActivities,
  deleteStudent,
  getTasks,
} from "../modules/api.js";

// =====================================================
// Get Student ID From URL
// =====================================================

const urlParams = new URLSearchParams(window.location.search);

const studentId =  Number(urlParams.get("id")) || 101
// const studentId = 101;

// =====================================================
// Get Current Instructor
// =====================================================

const currentInstructor = JSON.parse(localStorage.getItem("currentInstructor")) || { id: 1, name: "Nada Sarraf" };

// =====================================================
// Check Login
// =====================================================

if (!currentInstructor) {
  window.location.href = "index.html";
}

// =====================================================
// Check Student ID
// =====================================================

if (!studentId) {
  alert("Student ID is missing");

  window.location.href = "students.html";
}

// =====================================================
// DOM Elements
// =====================================================

// Header

const studentName = document.getElementById("studentName");

const studentEmail = document.getElementById("studentEmail");

const studentStatus = document.getElementById("studentStatus");

// Student Overview

const studentAvatar = document.getElementById("studentAvatar");

const overviewName = document.getElementById("overviewName");

const overviewEmail = document.getElementById("overviewEmail");

const studentCourse = document.getElementById("studentCourse");

const studentMajor = document.getElementById("studentMajor");

// Personal Information

const infoName = document.getElementById("infoName");

const infoEmail = document.getElementById("infoEmail");

const infoPhone = document.getElementById("infoPhone");

const infoAddress = document.getElementById("infoAddress");

const infoAge = document.getElementById("infoAge");

const infoMajor = document.getElementById("infoMajor");

// Academic Overview

const assignmentAverage = document.getElementById("assignmentAverage");

const quizAverage = document.getElementById("quizAverage");

const examGrade = document.getElementById("examGrade");

const overallGrade = document.getElementById("overallGrade");

// Assignments

const assignmentCount = document.getElementById("assignmentCount");

const assignmentsTableBody = document.getElementById("assignmentsTableBody");

// Quizzes

const quizCount = document.getElementById("quizCount");

const quizzesTableBody = document.getElementById("quizzesTableBody");

//labs
const labCount = document.getElementById("labCount");

// Exam

const examResult = document.getElementById("examResult");

const examProgress = document.getElementById("examProgress");

const examPercentage = document.getElementById("examPercentage");

// Attendance

const presentCount = document.getElementById("presentCount");

const absentCount = document.getElementById("absentCount");

const attendanceList = document.getElementById("attendanceList");

// Feedback

const feedbackList = document.getElementById("feedbackList");

// Activities

const activitiesList = document.getElementById("activitiesList");

// Buttons

const editStudentBtn = document.getElementById("editStudentBtn");

const deleteStudentBtn = document.getElementById("deleteStudentBtn");

// =====================================================
// Load Student
// =====================================================

async function loadStudent(studentId) {
  try {
    const student = await getStudentById(studentId, 1);
    // Render Student Information
    const task = await getTasks(1);

    renderStudentInformation(student);

    // Render Academic Information

    const assignments = task.filter(
      (t) => t.type?.toLowerCase() === "assignment",
    );

    renderAssignments(assignments || []);

    const Labs = task.filter((t) => t.type?.toLowerCase() === "lab");

    renderLabs(Labs);

    const Quizzes = task.filter((t) => t.type?.toLowerCase() === "quiz");

    renderQuizzes(Quizzes || []);

    const Exams = task.filter((t) => t.type?.toLowerCase() === "exam");

    renderExam(Exams);

    renderAcademicOverview(student);

    // Render Attendance

    renderAttendance(student.attendance || []);

    // Render Feedback

    renderFeedback(student.feedback || []);

    // Load Activities

    await loadActivities(studentId);
  } catch (error) {
    console.error(error);

    alert(error.message);

    //window.location.href = "students.html";
  }
}

// =====================================================
// Render Student Information
// =====================================================

function renderStudentInformation(student) {
  // Header
  studentName.textContent = student.name;

  studentEmail.textContent = student.email;

  // Status

  studentStatus.textContent = student.status;

  studentStatus.className = `status-badge ${student.status}`;

  // Overview

  overviewName.textContent = student.name;

  overviewEmail.textContent = student.email;

  studentCourse.textContent = student.course || "-";

  studentMajor.textContent = student.major;

  // Avatar

  studentAvatar.textContent = getInitials(student.name);

  // Personal Information

  infoName.textContent = student.name || "-";

  infoEmail.textContent = student.email || "-";

  infoPhone.textContent = student.phone || "-";

  infoAddress.textContent = student.address || "-";

  infoAge.textContent = student.age || "-";

  infoMajor.textContent = student.major || "-";
}

// =====================================================
// Get Student Initials
// =====================================================

function getInitials(name) {
  if (!name) {
    return "?";
  }

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// =====================================================
// Render Assignments
// =====================================================

function renderAssignments(assignments) {
  assignmentCount.textContent = assignments.length;

  assignmentsTableBody.innerHTML = "";

  if (assignments.length === 0) {
    assignmentsTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        No assignments available
                    </div>
                </td>
            </tr>
        `;

    return;
  }

  assignments.forEach((assignment, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${assignment.title}
            </td>

            <td>
                <strong>
                    ${assignment.points}
                </strong>/100
            </td>

            <td>

                <div class="progress-wrapper">

                    <div class="progress">

                        <span
                            style="width: ${assignment.points}%">
                        </span>

                    </div>

                    <small>
                        ${assignment.points}%
                    </small>

                </div>

            </td>

        `;

    assignmentsTableBody.appendChild(row);
  });
}

function renderLabs(labs) {
  labCount.textContent = labs.length;

  labsTableBody.innerHTML = "";

  if (labs.length === 0) {
    labsTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        No labs available
                    </div>
                </td>
            </tr>
        `;

    return;
  }

  labs.forEach((lab, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${lab.title}
            </td>
            
            <td>
                ${lab.week}
            </td>
        
            <td>
                ${new Date(lab.dueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </td>

            <td>
                <strong>
                    ${lab.points}
                </strong>/100
            </td>

            <td>

                <div class="progress-wrapper">

                    <div class="progress">

                        <span
                            style="width: ${lab.points}%">
                        </span>

                    </div>

                    <small>
                        ${lab.points}%
                    </small>

                </div>

            </td>

            <td>
              <span class="status-badge ${lab.status?.toLowerCase() === "open" ? "active" : "inactive"}">
              ${lab.status}
              </span>
            </td>

        `;

    labsTableBody.appendChild(row);
  });
}

// =====================================================
// Render Quizzes
// =====================================================

function renderQuizzes(quizzes) {
  quizCount.textContent = quizzes.length;

  quizzesTableBody.innerHTML = "";

  if (quizzes.length === 0) {
    quizzesTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        No quizzes available
                    </div>
                </td>
            </tr>
        `;

    return;
  }

  quizzes.forEach((quiz, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${quiz.title}
            </td>

            <td>
                <strong>
                    ${quiz.points}
                </strong>/100
            </td>

            <td>

                <div class="progress-wrapper">

                    <div class="progress">

                        <span
                            style="width: ${quiz.points}%">
                        </span>

                    </div>

                    <small>
                        ${quiz.points}%
                    </small>

                </div>

            </td>

        `;

    quizzesTableBody.appendChild(row);
  });
}

// =====================================================
// Render Exam
// =====================================================

function renderExam(exam) {
  if (exam === null || exam === undefined) {
    examResult.textContent = "-";

    examPercentage.textContent = "-";

    examProgress.style.width = "0%";

    return;
  }

  examResult.textContent = exam.title;

  examPercentage.textContent = `${exam.points}%`;

  examProgress.style.width = `${exam.points}%`;
}

// =====================================================
// Calculate Average
// =====================================================

function calculateAverage(items) {
  if (!items || items.length === 0) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + Number(item.grade), 0);

  return total / items.length;
}

// =====================================================
// Render Academic Overview
// =====================================================

function renderAcademicOverview(student) {
  const assignments = student.scores?.assignments || [];

  const quizzes = student.scores?.quizzes || [];

  const exam = student.scores?.exam;

  const assignmentAvg = calculateAverage(assignments);

  const quizAvg = calculateAverage(quizzes);

  // Assignment Average

  assignmentAverage.textContent =
    assignmentAvg !== null ? `${assignmentAvg.toFixed(1)}%` : "-";

  // Quiz Average

  quizAverage.textContent = quizAvg !== null ? `${quizAvg.toFixed(1)}%` : "-";

  // Exam

  examGrade.textContent =
    exam !== null && exam !== undefined ? `${exam}%` : "-";

  // Overall

  const grades = [];

  if (assignmentAvg !== null) {
    grades.push(assignmentAvg);
  }

  if (quizAvg !== null) {
    grades.push(quizAvg);
  }

  if (exam !== null && exam !== undefined) {
    grades.push(Number(exam));
  }

  if (grades.length === 0) {
    overallGrade.textContent = "-";

    return;
  }

  const overall = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;

  overallGrade.textContent = `${overall.toFixed(1)}%`;
}

// =====================================================
// Render Attendance
// =====================================================

function renderAttendance(attendance) {
  attendanceList.innerHTML = "";

  const present = attendance.filter((item) => item.status === "present").length;

  const absent = attendance.filter((item) => item.status === "absent").length;

  presentCount.textContent = present;

  absentCount.textContent = absent;

  if (attendance.length === 0) {
    attendanceList.innerHTML = `
            <div class="empty-state">
                No attendance records available
            </div>
        `;

    return;
  }

  attendance.forEach((item) => {
    const row = document.createElement("div");

    const status = item.status.toLowerCase();

    row.className = "attendance-row";

    row.innerHTML = `

            <span class="attendance-date">
                ${formatDate(item.date)}
            </span>

            <span class="attendance-status ${status}">
                ${capitalize(item.status)}
            </span>

        `;

    attendanceList.appendChild(row);
  });
}

// =====================================================
// Render Feedback
// =====================================================

function renderFeedback(feedback) {
  feedbackList.innerHTML = "";

  if (feedback.length === 0) {
    feedbackList.innerHTML = `
            <div class="empty-state">
                No feedback available
            </div>
        `;

    return;
  }

  feedback.forEach((item) => {
    const card = document.createElement("article");

    card.className = "feedback-card";

    card.innerHTML = `

            <div class="feedback-top">

                <span class="feedback-title">
                    Instructor Feedback
                </span>

                <span class="feedback-date">
                    ${formatDate(item.date)}
                </span>

            </div>

            <p>
                ${item.text}
            </p>

        `;

    feedbackList.appendChild(card);
  });
}

// =====================================================
// Load Activities
// =====================================================

async function loadActivities(studentId) {
  try {
    const activities = await getStudentActivities(studentId, 1);

    renderActivities(activities);
  } catch (error) {
    console.error("Failed to load activities:", error);

    activitiesList.innerHTML = `
            <div class="empty-state">
                Failed to load activities
            </div>
        `;
  }
}

// =====================================================
// Render Activities
// =====================================================

function renderActivities(activities) {
  activitiesList.innerHTML = "";

  if (activities.length === 0) {
    activitiesList.innerHTML = `
            <div class="empty-state">
                No recent activities
            </div>
        `;

    return;
  }

  activities.forEach((activity) => {
    const item = document.createElement("article");

    item.className = "activity-item";

    item.innerHTML = `

            <div class="activity-icon">
                ✓
            </div>

            <div class="activity-content">

                <p>
                    ${activity.message}
                </p>

                <span>
                    ${formatDate(activity.date)}
                </span>

            </div>

        `;

    activitiesList.appendChild(item);
  });
}

// =====================================================
// Format Date
// =====================================================

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const formattedDate = new Date(date);

  return formattedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// =====================================================
// Capitalize
// =====================================================

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

// =====================================================
// Edit Student
// =====================================================

editStudentBtn.addEventListener("click", function () {
  window.location.href = `edit-student.html?id=${studentId}`;
});

// =====================================================
// Delete Student
// =====================================================

deleteStudentBtn.addEventListener("click", async function () {
  const confirmed = confirm("Are you sure you want to delete this student?");

  if (!confirmed) {
    return;
  }

  try {
    await deleteStudent(studentId);

    alert("Student deleted successfully");

    window.location.href = "students.html";
  } catch (error) {
    console.error(error);

    alert("Failed to delete student");
  }
});

// =====================================================
// Initialize Page
// =====================================================

loadStudent(studentId);
