import {
    getAllStudents,
    getTasks,
    getSubmissions,
    addStudent,
    updateStudent,
    deleteStudent,
    getInstructorActivities
} from "../modules/api.js";

// CURRENT INSTRUCTOR (temporary, later get it from localStorage)
const currentInstructor  = JSON.parse(localStorage.getItem("currentInstructor")) || JSON.parse(sessionStorage.getItem("currentInstructor"));

if (!currentInstructor || !currentInstructor.id) {
    window.location.href = "index.html";
    throw new Error("No logged-in instructor");
}

// ELEMENTS
const studentsTableBody = document.getElementById("studentsTableBody");
const addStudentBtn = document.getElementById("addStudentBtn");
const studentModal = document.getElementById("studentModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const studentForm = document.getElementById("studentForm");
const modalTitle = document.getElementById("modalTitle");

// Filters
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const sortSelect = document.getElementById("sortSelect");

// Counts
const activeCount = document.getElementById("activeCount");
const riskCount = document.getElementById("riskCount");
const archivedCount = document.getElementById("archivedCount");
const allCount = document.getElementById("allCount");
const studentsCounter = document.getElementById("studentsCounter");

// Status buttons
const statusButtons = document.querySelectorAll(".status-filter");

// FORM INPUTS
const studentId = document.getElementById("studentId");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentCourse = document.getElementById("studentCourse");
const studentStatus = document.getElementById("studentStatus");
const studentPhone = document.getElementById("studentPhone");
const studentAddress = document.getElementById("studentAddress");
const studentAge = document.getElementById("studentAge");
const studentMajor = document.getElementById("studentMajor");

// DATA
let students = [];
let tasks = [];
let submissions = [];
let activities = [];
let processedStudents = [];
let displayedStudents = [];
let selectedStatus = "active";

// Exporte 
const exportCsvBtn =
    document.getElementById(
        "exportCsvBtn"
    );

// LOAD ALL DATA
async function loadStudents() {
    try {
        const results = await Promise.all([
            getAllStudents(currentInstructor.id),
            getTasks(currentInstructor.id),
            getSubmissions(currentInstructor.id),
            getInstructorActivities(currentInstructor.id)
        ]);

        students = results[0];
        // for debugging purposes, log the current instructor and the students fetched from the API
        console.log("CURRENT INSTRUCTOR:", currentInstructor);
        console.log("STUDENTS FROM API:", students);
        tasks = results[1];
        submissions = results[2];
        activities = results[3];

        processStudents();
        createCourseOptions();
        updateStatusCounts();
        applyFilters();
    } catch (error) {
        console.error("Failed to load student data:", error);
        studentsTableBody.innerHTML = `
            <tr><td colspan="9">Failed to load students</td></tr>
        `;
    }
}

// PROCESS STUDENTS
function processStudents() {
    processedStudents = students.map(student => {
        const attendancePercentage = getAttendancePercentage(student);
        const averageScore = getAverageScore(student);
        const submissionInfo = getSubmissionInfo(student);
        const lastActive = getLastActive(student);
        const calculatedStatus = getCalculatedStatus(student, attendancePercentage, averageScore);

        return {
            ...student,
            attendancePercentage,
            averageScore,
            submittedCount: submissionInfo.submitted,
            totalTasks: submissionInfo.total,
            missingCount: submissionInfo.missing,
            pendingCount: submissionInfo.pending,
            lateCount: submissionInfo.late,
            lastActive,
            calculatedStatus
        };
    });
}

// ATTENDANCE
function getAttendancePercentage(student) {
    if (!student.attendance || student.attendance.length === 0) {
        return 0;
    }

    const presentCount = student.attendance.filter(record => record.status === "present").length;

    return Math.round((presentCount / student.attendance.length) * 100);
}

// AVERAGE SCORE
function getAverageScore(student) {
    const studentSubmissions = submissions.filter(
        submission => String(submission.studentId) === String(student.id)
    );

    if (studentSubmissions.length === 0) {
        return 0;
    }

    let totalPercentage = 0;
    let validGrades = 0;

    studentSubmissions.forEach(submission => {
        const task = tasks.find(task => String(task.id) === String(submission.taskId));

        if (!task || !task.points) {
            return;
        }

        const percentage = (Number(submission.grade) / Number(task.points)) * 100;

        totalPercentage += percentage;
        validGrades++;
    });

    if (validGrades === 0) {
        return 0;
    }

    return Math.round(totalPercentage / validGrades);
}

// SUBMISSION INFO
function getSubmissionInfo(student) {
    // tasks belonging to instructor and same course as student
    const studentTasks = tasks.filter(task => {
        const sameInstructor = Number(task.instructorId) === Number(currentInstructor.id);
        const sameCourse = String(task.course).toLowerCase() === String(student.course).toLowerCase();

        return sameInstructor && sameCourse;
    });

    const studentSubmissions = submissions.filter(
        submission => String(submission.studentId) === String(student.id)
    );

    let submitted = 0;
    let missing = 0;
    let pending = 0;
    let late = 0;

    studentTasks.forEach(task => {
        const submission = studentSubmissions.find(
            submission => String(submission.taskId) === String(task.id)
        );

        // Student submitted
        if (submission) {
            submitted++;

            const submittedDate = new Date(submission.submittedAt);
            const dueDate = new Date(task.dueDate);

            if (submittedDate > dueDate) {
                late++;
            }

            return;
        }

        // Student did not submit
        const now = new Date();
        const dueDate = new Date(task.dueDate);

        if (now > dueDate) {
            missing++;
        } else {
            pending++;
        }
    });

    return {
        submitted,
        total: studentTasks.length,
        missing,
        pending,
        late
    };
}

// LAST ACTIVE
function getLastActive(student) {
    const studentActivities = activities.filter(
        activity => String(activity.studentId) === String(student.id)
    );

    const studentSubmissions = submissions.filter(
        submission => String(submission.studentId) === String(student.id)
    );

    const dates = [];

    studentActivities.forEach(activity => {
        if (activity.date) {
            dates.push(new Date(activity.date));
        }
    });

    studentSubmissions.forEach(submission => {
        if (submission.submittedAt) {
            dates.push(new Date(submission.submittedAt));
        }
    });

    if (dates.length === 0) {
        return "-";
    }

    const latestDate = new Date(Math.max(...dates.map(date => date.getTime())));

    return formatRelativeDate(latestDate);
}

// RELATIVE DATE
function formatRelativeDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.floor((today - target) / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return "Today";
    }

    if (days === 1) {
        return "Yesterday";
    }

    if (days > 1 && days < 30) {
        return `${days} days ago`;
    }

    return date.toLocaleDateString();
}

// CALCULATED STATUS
function getCalculatedStatus(student, attendancePercentage, averageScore) {
    // manually archived
    if (student.status === "archived") {
        return "archived";
    }

    const hasAttendance = student.attendance && student.attendance.length > 0;

    const hasGrade = submissions.some(
        submission => String(submission.studentId) === String(student.id)
    );

    const lowAttendance = hasAttendance && attendancePercentage < 60;
    const lowScore = hasGrade && averageScore < 60;

    if (lowAttendance || lowScore) {
        return "at-risk";
    }

    return "active";
}

// CREATE COURSE OPTIONS
function createCourseOptions() {
    const courses = [...new Set(students.map(student => student.course).filter(Boolean))];

    courseFilter.innerHTML = `<option value="all">All</option>`;

    courses.forEach(course => {
        const option = document.createElement("option");

        option.value = course;
        option.textContent = course;

        courseFilter.appendChild(option);
    });
}

// UPDATE STATUS COUNTS
function updateStatusCounts() {
    const activeStudents = processedStudents.filter(student => student.calculatedStatus === "active");
    const atRiskStudents = processedStudents.filter(student => student.calculatedStatus === "at-risk");
    const archivedStudents = processedStudents.filter(student => student.calculatedStatus === "archived");

    activeCount.textContent = activeStudents.length;
    riskCount.textContent = atRiskStudents.length;
    archivedCount.textContent = archivedStudents.length;
    allCount.textContent = processedStudents.length;
}

// FILTER + SORT
function applyFilters() {
    const search = searchInput.value.trim().toLowerCase();
    const selectedCourse = courseFilter.value;
    const sortValue = sortSelect.value;

    let filtered = processedStudents.filter(student => {
        const name = String(student.name || "").toLowerCase();
        const email = String(student.email || "").toLowerCase();
        const id = String(student.id || "").toLowerCase();
        const course = String(student.course || "").toLowerCase();

        const matchesSearch =
            name.includes(search) ||
            email.includes(search) ||
            id.includes(search) ||
            course.includes(search);

        const matchesCourse = selectedCourse === "all" || student.course === selectedCourse;

        const matchesStatus = selectedStatus === "all" || student.calculatedStatus === selectedStatus;

        return matchesSearch && matchesCourse && matchesStatus;
    });

    // copy before sort
    filtered = [...filtered];

    // SORT
    if (sortValue === "name-asc") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === "name-desc") {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortValue === "attendance-high") {
        filtered.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
    } else if (sortValue === "attendance-low") {
        filtered.sort((a, b) => a.attendancePercentage - b.attendancePercentage);
    } else if (sortValue === "score-high") {
        filtered.sort((a, b) => b.averageScore - a.averageScore);
    } else if (sortValue === "score-low") {
        filtered.sort((a, b) => a.averageScore - b.averageScore);
    }
    displayedStudents = filtered;
    renderStudents(displayedStudents);
    studentsCounter.textContent = `${displayedStudents.length} of ${processedStudents.length} students`;
}

// RENDER STUDENTS
function renderStudents(studentsData) {
    studentsTableBody.innerHTML = "";

    if (studentsData.length === 0) {
        studentsTableBody.innerHTML = `
            <tr><td colspan="9" class="empty-row">No students found</td></tr>
        `;

        return;
    }

    studentsData.forEach(student => {
        const row = document.createElement("tr");
        const initials = getInitials(student.name);
        const submittedText = `${student.submittedCount}/${student.totalTasks}`;

        let submissionDetails = "";

        if (student.missingCount > 0) {
            submissionDetails += `<span class="missing">${student.missingCount} missing</span>`;
        }

        if (student.pendingCount > 0) {
            submissionDetails += `<span class="pending">${student.pendingCount} pending</span>`;
        }

        if (student.lateCount > 0) {
            submissionDetails += `<span class="late">${student.lateCount} late</span>`;
        }

        let statusText = "Active";

        if (student.calculatedStatus === "at-risk") {
            statusText = "At Risk";
        } else if (student.calculatedStatus === "archived") {
            statusText = "Archived";
        }

        row.innerHTML = `
            <!-- STUDENT -->
            <td>
                <div class="student-info">
                    <div class="avatar">${initials}</div>
                    <div class="student-details">
                        <strong>${student.name}</strong>
                        <span>${student.email}</span>
                    </div>
                </div>
            </td>

            <!-- ID -->
            <td>${student.id}</td>

            <!-- COURSE -->
            <td>${student.course ?? "-"}</td>

            <!-- ATTENDANCE -->
            <td><strong>${student.attendancePercentage}%</strong></td>

            <!-- AVG SCORE -->
            <td>
                <div class="score-wrapper">
                    <div class="score-bar">
                        <div class="score-progress" style="width: ${student.averageScore}%;"></div>
                    </div>
                    <strong>${student.averageScore}%</strong>
                </div>
            </td>

            <!-- SUBMITTED -->
            <td>
                <div class="submission-info">
                    <strong>${submittedText}</strong>
                    ${submissionDetails}
                </div>
            </td>

            <!-- LAST ACTIVE -->
            <td>${student.lastActive}</td>

            <!-- STATUS -->
            <td>
                <span class="status ${student.calculatedStatus}">${statusText}</span>
            </td>

            <!-- ACTIONS -->
            <td>
                <div class="actions">
                    <button class="view-btn" data-id="${student.id}"title="View Profile">👁</button>
                    <button class="edit-btn" data-id="${student.id}">Edit</button>
                    <button class="delete-btn" data-id="${student.id}">Delete</button>
                </div>
            </td>
        `;

        studentsTableBody.appendChild(row);
    });
}

// GET INITIALS
function getInitials(name) {
    if (!name) {
        return "?";
    }

    return name
        .trim()
        .split(" ")
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

// STATUS FILTER BUTTONS
statusButtons.forEach(button => {
    button.addEventListener("click", () => {
        statusButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedStatus = button.dataset.status;

        applyFilters();
    });
});

// SEARCH, COURSE FILTER, SORT
searchInput.addEventListener("input", applyFilters);
courseFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);


// OPEN ADD MODAL
addStudentBtn.addEventListener("click", () => {
    modalTitle.textContent = "Add Student";

    studentForm.reset();

    studentId.value = "";
    studentStatus.value = "active";

    studentModal.classList.add("show");
});

// CLOSE MODAL
closeModalBtn.addEventListener("click", () => {
    studentModal.classList.remove("show");
});

// close if clicking background
studentModal.addEventListener("click", event => {
    if (event.target === studentModal) {
        studentModal.classList.remove("show");
    }
});

// ADD / UPDATE STUDENT
studentForm.addEventListener("submit", async event => {
    event.preventDefault();

    const data = {
        name: studentName.value.trim(),
        email: studentEmail.value.trim(),
        course: studentCourse.value.trim(),
        status: studentStatus.value,
        phone: studentPhone.value.trim(),
        address: studentAddress.value.trim(),
        age: Number(studentAge.value),
        major: studentMajor.value.trim()
    };

    try {
        // ADD
        console.log("studentId value:", studentId.value);
        if (studentId.value === "") {
            const newStudent = {
                ...data,
                instructorId: Number(currentInstructor.id),
                attendance: [],
                feedback: []
            };
            console.log("newStudent:", newStudent);
            await addStudent(newStudent);
        }

        // UPDATE
        else {
            const id = studentId.value;
            const student = students.find(student => String(student.id) === String(id));

            if (!student) {
                const result = await Swal.fire({
                    title: "Error",
                    text: "Student not found",
                    icon: "error",
                    confirmButtonText: "OK"
                });
                return;
            }

            if (Number(student.instructorId) !== Number(currentInstructor.id)) {
                const result = await Swal.fire({
                    title: "Error",
                    text: "You cannot update this student",
                    icon: "error",
                    confirmButtonText: "OK"
                });
                return;
            }

            await updateStudent(id, data);
        }

        studentModal.classList.remove("show");

        await loadStudents();
    } catch (error) {
        console.error(error);
        const result = await Swal.fire({
            title: "Error",
            text: "Failed to save student",
            icon: "error",
            confirmButtonText: "OK"
        });
    }
});

// EDIT / DELETE
studentsTableBody.addEventListener("click", async event => {
    // EDIT
    if (event.target.classList.contains("edit-btn")) {
        const id = event.target.dataset.id;
        const student = students.find(student => String(student.id) === String(id));

        if (!student) {
            return;
        }

        studentId.value = student.id;
        studentName.value = student.name ?? "";
        studentEmail.value = student.email ?? "";
        studentCourse.value = student.course ?? "";
        studentStatus.value = student.status ?? "active";
        studentPhone.value = student.phone ?? "";
        studentAddress.value = student.address ?? "";
        studentAge.value = student.age ?? "";
        studentMajor.value = student.major ?? "";

        modalTitle.textContent = "Edit Student";

        studentModal.classList.add("show");
    }
    if (event.target.classList.contains("view-btn")) { 
            const id = event.target.dataset.id;
            window.location.href =
                `student-profile.html?id=${id}`;
            return;
        }
    // DELETE
    if (event.target.classList.contains("delete-btn")) {
        const id = event.target.dataset.id;
        const student = students.find(student => String(student.id) === String(id));

        if (!student) {
            return;
        }

        if (Number(student.instructorId) !== Number(currentInstructor.id)) {
            const result = await Swal.fire({
                title: "Error",
                text: "You cannot delete this student",
                icon: "error",
                confirmButtonText: "OK"
            });
            return;
        }

        const confirmed = await Swal.fire({
            title: "Confirm Delete",
            text: `Are you sure you want to delete ${student.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel"
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteStudent(id);
            await loadStudents();
        } catch (error) {
            console.error(error);
            await showPopup("Failed to delete student", "error");
        }
    }
});


// Export CSV
function exportStudentsToCSV() {
    if (displayedStudents.length === 0) {
        showPopup("No students to export", "error");
        
        return;
    }
    const headers = [
        "ID",
        "Name" ,
        "Email",
        "Course",
        "Attendance",
        "Average Score",
        "Submitted",
        "Missing",
        "Pending",
        "Late",
        "Last Active",
        "Status",
        "Phone",
        "Address",
        "Age",
        "Major"
    ];

    const rows = displayedStudents.map(student => {
        return [
             student.id,

                student.name,
                student.email,
                student.course,
                `${student.attendancePercentage}%`,
                `${student.averageScore}%`,
                `${student.submittedCount}/${student.totalTasks}`,
                student.missingCount,
                student.pendingCount,
                student.lateCount,
                student.lastActive,
                student.calculatedStatus,
                student.phone ?? "",
                student.address ?? "",
                student.age ?? "",
                student.major ?? ""
        ];
    });
    const csvContent = [headers, ...rows]
    .map(row => {
        return row
            .map(value => {
                const stringValue =
                    String(value ?? "");

                return `"${stringValue.replace(/"/g, '""')}"`;
            })
            .join(",");
    })
    .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =`students-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

}
exportCsvBtn.addEventListener(
    "click",
    exportStudentsToCSV
);

loadStudents();