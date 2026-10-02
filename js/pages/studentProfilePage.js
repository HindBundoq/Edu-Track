import {
  getStudentById,
  getStudentActivities,
  deleteStudent,
  getTasks,
  getSubmissions,
  updateStudent,
} from "../modules/api.js";

// =====================================================
// Get Student ID From URL
// =====================================================

const urlParams = new URLSearchParams(window.location.search);
const studentId = Number(urlParams.get("id"));

// =====================================================
// Current Instructor
// =====================================================

// const currentInstructor =
//   JSON.parse(localStorage.getItem("currentInstructor")) ||
//   JSON.parse(sessionStorage.getItem("currentInstructor"));

const instructorId = Number(localStorage.getItem("instructorId"));

// =====================================================
// Login Check
// =====================================================

if (!instructorId) {
  window.location.href = "index.html";
  throw new Error("No logged-in instructor");
}

// =====================================================
// Student ID Check
// =====================================================

if (!studentId) {
  Swal.fire({
    title: "Error",
    text: "Student ID is missing",
    icon: "error",
    confirmButtonText: "OK",
  }).then(() => {
    window.location.href = "students.html";
  });

  throw new Error("Student ID is missing");
}

// =====================================================
// DOM Elements - Modal
// =====================================================

const studentModal = document.getElementById("studentModal");
const modalTitle = document.getElementById("modalTitle");

const modalStudentId = document.getElementById("modalStudentId");
const modalStudentName = document.getElementById("modalStudentName");
const modalStudentEmail = document.getElementById("modalStudentEmail");
const modalStudentCourse = document.getElementById("modalStudentCourse");
const modalStudentStatus = document.getElementById("modalStudentStatus");
const modalStudentPhone = document.getElementById("modalStudentPhone");
const modalStudentAddress = document.getElementById("modalStudentAddress");
const modalStudentAge = document.getElementById("modalStudentAge");
const modalStudentMajor = document.getElementById("modalStudentMajor");

const closeModalBtn = document.getElementById("closeModalBtn");
const studentForm = document.getElementById("studentForm");

// =====================================================
// DOM Elements - Student Information
// =====================================================

const studentStatus = document.getElementById("studentStatus");

const studentAvatar = document.getElementById("studentAvatar");
const overviewName = document.getElementById("overviewName");
const overviewEmail = document.getElementById("overviewEmail");
const studentCourse = document.getElementById("studentCourse");
const studentMajor = document.getElementById("studentMajor");

const infoName = document.getElementById("infoName");
const infoEmail = document.getElementById("infoEmail");
const infoPhone = document.getElementById("infoPhone");
const infoAddress = document.getElementById("infoAddress");
const infoAge = document.getElementById("infoAge");
const infoMajor = document.getElementById("infoMajor");

// =====================================================
// DOM Elements - Academic Overview
// =====================================================

const assignmentAverage = document.getElementById("assignmentAverage");
const quizAverage = document.getElementById("quizAverage");
const labAverage = document.getElementById("labAverage");
const overallGrade = document.getElementById("overallGrade");

// =====================================================
// DOM Elements - Assignments
// =====================================================

const assignmentCount = document.getElementById("assignmentCount");
const assignmentsTableBody = document.getElementById("assignmentsTableBody");

// =====================================================
// DOM Elements - Labs
// =====================================================

const labCount = document.getElementById("labCount");
const labsTableBody = document.getElementById("labsTableBody");

// =====================================================
// DOM Elements - Quizzes
// =====================================================

const quizCount = document.getElementById("quizCount");
const quizzesTableBody = document.getElementById("quizzesTableBody");

// =====================================================
// DOM Elements - Attendance / Feedback / Activities
// =====================================================

const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");
const attendanceList = document.getElementById("attendanceList");

const feedbackList = document.getElementById("feedbackList");
const activitiesList = document.getElementById("activitiesList");

// =====================================================
// Buttons
// =====================================================

const editStudentBtn = document.getElementById("editStudentBtn");
const deleteStudentBtn = document.getElementById("deleteStudentBtn");

// =====================================================
// Load Student
// =====================================================

async function loadStudent(studentId) {
  try {
    const student = await getStudentById(studentId, instructorId);

    const tasks = await getTasks(instructorId);

    const submissions = await getSubmissions(instructorId);

    // Only submissions belonging to this student
    const studentSubmissions = submissions.filter(
      (submission) => Number(submission.studentId) === Number(studentId),
    );

    renderStudentInformation(student);

    // =================================================
    // Filter Tasks
    // =================================================

    const assignments = tasks.filter(
      (task) => task.type?.toLowerCase() === "assignment",
    );

    const labs = tasks.filter((task) => task.type?.toLowerCase() === "lab");

    const quizzes = tasks.filter((task) => task.type?.toLowerCase() === "quiz");

    // =================================================
    // Render
    // =================================================

    renderAssignments(assignments, studentSubmissions);

    renderLabs(labs, studentSubmissions);

    renderQuizzes(quizzes, studentSubmissions);

    renderAcademicOverview(assignments, labs, quizzes, studentSubmissions);

    renderAttendance(student.attendance || []);

    renderFeedback(student.feedback || []);

    await loadActivities(studentId);
  } catch (error) {
    console.error(error);

    await Swal.fire({
      title: "Error",
      text: error.message || "Failed to load student",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// =====================================================
// Render Student Information
// =====================================================

function renderStudentInformation(student) {
  studentStatus.textContent = capitalize(student.status);

  const statusClass =
    student.status?.toLowerCase() === "active" ? "active" : "inactive";

  studentStatus.className = `status-badge ${statusClass}`;

  overviewName.textContent = student.name || "-";
  overviewEmail.textContent = student.email || "-";
  studentCourse.textContent = student.course || "-";
  studentMajor.textContent = student.major || "-";

  studentAvatar.textContent = getInitials(student.name);

  infoName.textContent = student.name || "-";
  infoEmail.textContent = student.email || "-";
  infoPhone.textContent = student.phone || "-";
  infoAddress.textContent = student.address || "-";
  infoAge.textContent = student.age || "-";
  infoMajor.textContent = student.major || "-";
}

// =====================================================
// Get Initials
// =====================================================

function getInitials(name) {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// =====================================================
// Find Submission For Task
// =====================================================

function getSubmissionForTask(taskId, submissions) {
  return submissions.find(
    (submission) => Number(submission.taskId) === Number(taskId),
  );
}

// =====================================================
// Calculate Percentage
// =====================================================

function calculatePercentage(grade, maxPoints) {
  if (grade === undefined || grade === null) {
    return null;
  }

  if (!maxPoints || maxPoints <= 0) {
    return null;
  }

  return (Number(grade) / Number(maxPoints)) * 100;
}

// =====================================================
// Render Assignments
// =====================================================

function renderAssignments(assignments, submissions) {
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
    const submission = getSubmissionForTask(assignment.id, submissions);

    const percentage = submission
      ? calculatePercentage(submission.grade, assignment.points)
      : null;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>

      <td>${assignment.title}</td>

      <td>
        ${
          submission
            ? `<strong>${submission.grade}</strong>/${assignment.points}`
            : "-"
        }
      </td>

      <td>
        ${
          percentage !== null
            ? `
              <div class="progress-wrapper">
                <div class="progress">
                  <span style="width: ${percentage}%"></span>
                </div>
                <small>${percentage.toFixed(1)}%</small>
              </div>
            `
            : "-"
        }
      </td>
    `;

    assignmentsTableBody.appendChild(row);
  });
}

// =====================================================
// Render Labs
// =====================================================

function renderLabs(labs, submissions) {
  labCount.textContent = labs.length;
  labsTableBody.innerHTML = "";

  if (labs.length === 0) {
    labsTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            No labs available
          </div>
        </td>
      </tr>
    `;

    return;
  }

  labs.forEach((lab, index) => {
    const submission = getSubmissionForTask(lab.id, submissions);

    const percentage = submission
      ? calculatePercentage(submission.grade, lab.points)
      : null;

    const statusClass =
      lab.status?.toLowerCase() === "open" ? "active" : "inactive";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>

      <td>${lab.title}</td>

      <td>${lab.week}</td>

      <td>${formatDate(lab.dueDate)}</td>

      <td>
        ${
          submission
            ? `<strong>${submission.grade}</strong>/${lab.points}`
            : "-"
        }
      </td>

      <td>
        ${
          percentage !== null
            ? `
              <div class="progress-wrapper">
                <div class="progress">
                  <span style="width: ${percentage}%"></span>
                </div>
                <small>${percentage.toFixed(1)}%</small>
              </div>
            `
            : "-"
        }
      </td>

      <td>
        <span class="status-badge ${statusClass}">
          ${capitalize(lab.status)}
        </span>
      </td>
    `;

    labsTableBody.appendChild(row);
  });
}

// =====================================================
// Render Quizzes
// =====================================================

function renderQuizzes(quizzes, submissions) {
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
    const submission = getSubmissionForTask(quiz.id, submissions);

    const percentage = submission
      ? calculatePercentage(submission.grade, quiz.points)
      : null;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>

      <td>${quiz.title}</td>

      <td>
        ${
          submission
            ? `<strong>${submission.grade}</strong>/${quiz.points}`
            : "-"
        }
      </td>

      <td>
        ${
          percentage !== null
            ? `
              <div class="progress-wrapper">
                <div class="progress">
                  <span style="width: ${percentage}%"></span>
                </div>
                <small>${percentage.toFixed(1)}%</small>
              </div>
            `
            : "-"
        }
      </td>
    `;

    quizzesTableBody.appendChild(row);
  });
}

// =====================================================
// Calculate Average
// =====================================================

function calculateAverage(values) {
  if (!values || values.length === 0) {
    return null;
  }

  const validValues = values.filter(
    (value) => value !== null && !Number.isNaN(value),
  );

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);

  return total / validValues.length;
}

// =====================================================
// Get Task Percentages
// =====================================================

function getTaskPercentages(tasks, submissions) {
  return tasks
    .map((task) => {
      const submission = getSubmissionForTask(task.id, submissions);

      if (!submission) {
        return null;
      }

      return calculatePercentage(submission.grade, task.points);
    })
    .filter((value) => value !== null);
}

// =====================================================
// Render Academic Overview
// =====================================================

function renderAcademicOverview(assignments, labs, quizzes, submissions) {
  const assignmentGrades = getTaskPercentages(assignments, submissions);

  const labGrades = getTaskPercentages(labs, submissions);

  const quizGrades = getTaskPercentages(quizzes, submissions);

  const assignmentAvg = calculateAverage(assignmentGrades);

  const labAvg = calculateAverage(labGrades);

  const quizAvg = calculateAverage(quizGrades);

  // Assignment
  assignmentAverage.textContent =
    assignmentAvg !== null ? `${assignmentAvg.toFixed(1)}%` : "-";

  // Lab
  if (labAverage) {
    labAverage.textContent = labAvg !== null ? `${labAvg.toFixed(1)}%` : "-";
  }

  // Quiz
  quizAverage.textContent = quizAvg !== null ? `${quizAvg.toFixed(1)}%` : "-";

  // Overall
  const averages = [assignmentAvg, labAvg, quizAvg].filter(
    (value) => value !== null,
  );

  const overall = calculateAverage(averages);

  overallGrade.textContent = overall !== null ? `${overall.toFixed(1)}%` : "-";
}

// =====================================================
// Render Attendance
// =====================================================

function renderAttendance(attendance) {
  attendanceList.innerHTML = "";

  const present = attendance.filter(
    (item) => item.status?.toLowerCase() === "present",
  ).length;

  const absent = attendance.filter(
    (item) => item.status?.toLowerCase() === "absent",
  ).length;

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

    const status = item.status?.toLowerCase() || "";

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

      <p>${item.text}</p>
    `;

    feedbackList.appendChild(card);
  });
}

// =====================================================
// Load Activities
// =====================================================

async function loadActivities(studentId) {
  try {
    const activities = await getStudentActivities(studentId, instructorId);

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
      <div class="activity-icon">✓</div>

      <div class="activity-content">
        <p>${activity.message}</p>

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
  if (!date) return "-";

  const formattedDate = new Date(date);

  if (Number.isNaN(formattedDate.getTime())) {
    return "-";
  }

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
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

// =====================================================
// Edit Student - Open Modal
// =====================================================

editStudentBtn.addEventListener("click", async function () {
  try {
    const student = await getStudentById(studentId, instructorId);

    modalTitle.textContent = "Edit Student";

    modalStudentId.value = student.id;
    modalStudentName.value = student.name || "";
    modalStudentEmail.value = student.email || "";
    modalStudentCourse.value = student.course || "";
    modalStudentStatus.value = student.status || "active";
    modalStudentPhone.value = student.phone || "";
    modalStudentAddress.value = student.address || "";
    modalStudentAge.value = student.age || "";
    modalStudentMajor.value = student.major || "";

    studentModal.classList.add("show");
  } catch (error) {
    console.error(error);

    await Swal.fire({
      title: "Error",
      text: error.message || "Failed to load student",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
});

// =====================================================
// Close Modal
// =====================================================

closeModalBtn.addEventListener("click", function () {
  studentModal.classList.remove("show");
});

// =====================================================
// Close Modal When Clicking Outside
// =====================================================

studentModal.addEventListener("click", function (event) {
  if (event.target === studentModal) {
    studentModal.classList.remove("show");
  }
});

// =====================================================
// Update Student
// =====================================================

studentForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const updatedStudent = {
    name: modalStudentName.value.trim(),
    email: modalStudentEmail.value.trim(),
    course: modalStudentCourse.value.trim(),
    status: modalStudentStatus.value,
    phone: modalStudentPhone.value.trim(),
    address: modalStudentAddress.value.trim(),
    age: modalStudentAge.value ? Number(modalStudentAge.value) : null,
    major: modalStudentMajor.value.trim(),
  };

  try {
    await updateStudent(Number(modalStudentId.value), updatedStudent);

    studentModal.classList.remove("show");

    await Swal.fire({
      title: "Success",
      text: "Student updated successfully",
      icon: "success",
      confirmButtonText: "OK",
    });

    // Reload page data
    await loadStudent(studentId);
  } catch (error) {
    console.error(error);

    await Swal.fire({
      title: "Error",
      text: error.message || "Failed to update student",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
});

// =====================================================
// Delete Student
// =====================================================

deleteStudentBtn.addEventListener("click", async function () {
  const confirmed = await Swal.fire({
    title: "Confirm Delete",
    text: "Are you sure you want to delete this student?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
  });

  if (!confirmed.isConfirmed) {
    return;
  }

  try {
    await deleteStudent(studentId);

    await Swal.fire({
      title: "Success",
      text: "Student deleted successfully",
      icon: "success",
      confirmButtonText: "OK",
    });

    window.location.href = "students.html";
  } catch (error) {
    console.error(error);

    await Swal.fire({
      title: "Error",
      text: "Failed to delete student",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
});

// =====================================================
// Initialize Page
// =====================================================

loadStudent(studentId);
