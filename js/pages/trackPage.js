import {
    getTasks,
    getSubmissions,
    getAllStudents,
    updateSubmission
} from "../modules/api.js";

// const instructor = JSON.parse(localStorage.getItem("instructor"));

// const instructorId = instructor.id;
// after save the instructor id in localstorge 

const instructorId = 1;

// if (!instructor) {
//     window.location.href = "./login.html";
// }


const tasks = await getTasks(instructorId);

const submissions = await getSubmissions(instructorId);

function renderHeaderStatistics() {
    const openTasks = tasks.filter(t => t.status === "open");
    const upcomingTasks = tasks.filter(t => t.status === "upcoming");
    const closedTasks = tasks.filter(t => t.status === "closed");
    const needsGrading = submissions.filter(s => s.grade === null);

    document.getElementById("open").textContent = `${openTasks.length} open`;
    document.getElementById("upcoming").textContent = `${upcomingTasks.length} upcoming`;
    document.getElementById("closed").textContent = `${closedTasks.length} closed`;
    document.getElementById("needs-grading").textContent = `${needsGrading.length} submissions need grading`;
}

renderHeaderStatistics();






const filterButtons = document.querySelectorAll(".filter-btn");

const allCount = document.getElementById("all-count");
const assignmentCount = document.getElementById("assignment-count");
const quizCount = document.getElementById("quiz-count");
const projectCount = document.getElementById("project-count");
const labCount = document.getElementById("lab-count");

allCount.textContent = tasks.length;

assignmentCount.textContent = tasks.filter(task => {
    return task.type === "assignment";
}).length;

quizCount.textContent = tasks.filter(task => {
    return task.type === "quiz";
}).length;

projectCount.textContent = tasks.filter(task => {
    return task.type === "project";
}).length;

labCount.textContent = tasks.filter(task => {
    return task.type === "lab";
}).length;

// the filter functionaltye

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const type = button.dataset.type;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");


        if (type === "all") {

            renderTasks(tasks);

        } else {

            const filteredTasks = tasks.filter(task => {
                return task.type === type;
            });

            renderTasks(filteredTasks);
        }

    });

});


//  cards section functionaltye 

const tasksList = document.getElementById("tasks-list");
const students = await getAllStudents(instructorId);

function renderTasks(tasksToRender) {

    tasksList.innerHTML = "";

    tasksToRender.forEach(task => {

        const taskSubmissions = submissions.filter(submission => {
            return Number(submission.taskId) === Number(task.id);
        });
        const gradedSubmissions = taskSubmissions.filter(submission => {
            return submission.grade !== null;
        });
        let average = "—";

        if (gradedSubmissions.length > 0) {
        
            const totalGrades = gradedSubmissions.reduce((sum, submission) => {
                return sum + submission.grade;
            }, 0);
        
            const averageGrade =
                totalGrades / gradedSubmissions.length;
        
            const averagePercentage =
                (averageGrade / task.points) * 100;
        
            average = `${Math.round(averagePercentage)}%`;
        }
        const card = document.createElement("div");

        card.classList.add("task-card");

        card.dataset.id = task.id;


        card.innerHTML = `
            <div class="task-card-header">

                <div class="task-info">

                    <span class="task-number">
                        T${task.id}
                    </span>

                    <span class="task-type">
                        ${task.type}
                    </span>

                </div>


                <span class="task-status ${task.status}">
                    ${task.status}
                </span>

            </div>


            <h3 class="task-title">
                ${task.title}
            </h3>


            <p class="task-meta">
                Week ${task.week}
                ·
                Due ${formatDate(task.dueDate)}
                ·
                ${task.points} pts
            </p>


            <div class="task-card-footer">
                <span>
                    ${taskSubmissions.length}/${students.length} submitted
                </span>

                <span>
                    Avg ${average}
                </span>
            </div>
        `;


        tasksList.appendChild(card);
        card.addEventListener("click", () => {

    const allCards = document.querySelectorAll(".task-card");

    allCards.forEach(card => {
        card.classList.remove("active");
    });

    card.classList.add("active");
    renderTaskDetails(task);
        });
    });
}

function formatDate(date) {

    const taskDate = new Date(date);

    return taskDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}
const taskDetails = document.getElementById("task-details");
renderTasks(tasks);


//  task detailes 

function renderTaskDetails(task) {

    const taskSubmissions = submissions.filter(submission => {
        return Number(submission.taskId) === Number(task.id);
    });


    const submittedCount = taskSubmissions.length;


    const needsGradingCount = taskSubmissions.filter(submission => {
        return submission.grade === null;
    }).length;


    const missingCount =
        students.length - taskSubmissions.length;


    const lateCount = taskSubmissions.filter(submission => {
        return new Date(submission.submittedAt) > new Date(task.dueDate);
    }).length;


    taskDetails.innerHTML = `
        <div class="details-header">

            <div>
                <span class="task-type">
                    ${task.type}
                </span>

                <h2>${task.title}</h2>
            </div>

            <span class="task-status ${task.status}">
                ${task.status}
            </span>

        </div>


        <p class="details-meta">
            Due ${formatDate(task.dueDate)}
            · Week ${task.week}
            · ${task.points} pts
        </p>


        <p class="task-description">
            ${task.description}
        </p>


        <div class="submission-summary">

            <div class="summary-box">
                <span>Submitted</span>
                <strong>${submittedCount}</strong>
            </div>

            <div class="summary-box">
                <span>Needs grading</span>
                <strong>${needsGradingCount}</strong>
            </div>

            <div class="summary-box">
                <span>Missing</span>
                <strong>${missingCount}</strong>
            </div>

            <div class="summary-box">
                <span>Late</span>
                <strong>${lateCount}</strong>
            </div>

        </div>


        <div class="students-section">

            <h3>Students</h3>

            <div id="students-container"></div>

        </div>
    `;


    renderStudentRows(task);
}


// show all student in task 
function renderStudentRows(task) {

    const studentsContainer =
        document.getElementById(
            "students-container"
        );


    studentsContainer.innerHTML = "";


    students.forEach(student => {


        // ================= Find Submission =================

        const submission =
            submissions.find(submission => {

                return (

                    Number(submission.taskId)
                    === Number(task.id)

                    &&

                    Number(submission.studentId)
                    === Number(student.id)

                );

            });


        // ================= Default Values =================

        let status =
            "Not submitted";

        let grade =
            "";

        let feedback =
            "";

        let late =
            false;


        // ================= Submission Exists =================

        if (submission) {


            late =
                new Date(submission.submittedAt)
                >
                new Date(task.dueDate);


            feedback =
                submission.feedback ?? "";


            if (submission.grade === null) {

                status =
                    "Needs grading";

            } else {

                status =
                    "Graded";

                grade =
                    submission.grade;

            }

        }


        // ================= Create Row =================

        const row =
            document.createElement("div");


        row.classList.add(
            "student-row"
        );


        // ================= Student Submitted =================

        if (submission) {

            row.innerHTML = `

                <div class="student-info">

                    <strong>
                        ${student.name}
                    </strong>

                    <span>
                        ${student.email}
                    </span>

                </div>


                <div class="student-status">

                    <span class="submission-status">
                        ${status}
                    </span>


                    <span class="submission-time">

                        ${
                            late
                                ? "Late"
                                : "On time"
                        }

                    </span>

                </div>


                <div class="student-grade">

                    <label>
                        Grade
                    </label>


                    <div class="grade-field">

                        <input
                            type="number"
                            class="grade-input"
                            min="0"
                            max="${task.points}"
                            value="${grade}"
                        >

                        <span>
                            / ${task.points}
                        </span>

                    </div>

                </div>


                <div class="student-feedback">

                    <label>
                        Feedback
                    </label>


                    <textarea
                        class="feedback-input"
                        placeholder="Write feedback..."
                    >${feedback}</textarea>

                </div>


                <button
                    class="save-grade-btn"
                    data-submission-id="${submission.id}"
                >
                    Save
                </button>
            `;

        }

        // ================= Not Submitted =================

        else {

            row.innerHTML = `

                <div class="student-info">

                    <strong>
                        ${student.name}
                    </strong>

                    <span>
                        ${student.email}
                    </span>

                </div>


                <div class="student-status">

                    <span class="not-submitted">
                        Not submitted
                    </span>

                </div>


                <div class="student-grade">

                    <span>
                        — / ${task.points}
                    </span>

                </div>

            `;

        }


        studentsContainer.appendChild(row);

    });


    // =====================================================
    // Save Grade + Feedback
    // =====================================================

    const saveButtons =
        document.querySelectorAll(
            ".save-grade-btn"
        );


    saveButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {


                // ================= Get Row =================

                const row =
                    button.closest(
                        ".student-row"
                    );


                const gradeInput =
                    row.querySelector(
                        ".grade-input"
                    );


                const feedbackInput =
                    row.querySelector(
                        ".feedback-input"
                    );


                // ================= Values =================

                const submissionId =
                    Number(
                        button.dataset.submissionId
                    );


                const gradeValue =
                    gradeInput.value.trim();


                const feedback =
                    feedbackInput.value.trim();


                // ================= Validate Grade =================

                if (gradeValue === "") {

                    alert(
                        "Please enter a grade."
                    );

                    return;
                }


                const grade =
                    Number(gradeValue);


                if (
                    grade < 0
                    ||
                    grade > task.points
                ) {

                    alert(
                        `Grade must be between 0 and ${task.points}`
                    );

                    return;
                }


                // ================= Update Database =================

                try {

                    await updateSubmission(
                        submissionId,
                        {
                            grade: grade,
                            feedback: feedback
                        }
                    );


                    // ================= Update Local Array =================

                    const submission =
                        submissions.find(
                            submission => {

                                return (
                                    Number(submission.id)
                                    === submissionId
                                );

                            }
                        );


                    if (submission) {

                        submission.grade =
                            grade;

                        submission.feedback =
                            feedback;

                    }


                    // ================= Update UI =================

                    renderHeaderStatistics();

                    renderTasks(tasks);

                    renderTaskDetails(task);


                    alert(
                        "Grade and feedback saved successfully."
                    );


                } catch (error) {

                    console.error(error);

                    alert(
                        "Failed to save grade."
                    );

                }

            }
        );

    });

}



renderTasks(tasks);


// show first task automatically

if (tasks.length > 0) {

    renderTaskDetails(
        tasks[0]
    );


    const firstCard =
        document.querySelector(
            ".task-card"
        );


    if (firstCard) {

        firstCard.classList.add(
            "active"
        );

    }

}