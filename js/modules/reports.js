// =====================================================================
//  reports.js
//  All grade calculations use the "submissions" and "tasks" collections
//  from db.json. Each grade is converted to a percentage of the task's
//  points, so a quiz out of 20 and an assignment out of 100 count fairly.
// =====================================================================

// ===================== Helpers =====================

function sameId(a, b) {
  return Number(a) === Number(b);
}

export function getStudentSubmissions(student, submissions = []) {
  return submissions.filter((sub) => sameId(sub.studentId, student.id));
}

// ===================== Average Grade (%) =====================

export function calculateStudentAverage(student, submissions = [], tasks = []) {
  const mine = getStudentSubmissions(student, submissions);

  const percents = mine
    .map((sub) => {
      const task = tasks.find((t) => sameId(t.id, sub.taskId));
      if (!task || !task.points) return null;
      return (Number(sub.grade) / Number(task.points)) * 100;
    })
    .filter((p) => p !== null && !Number.isNaN(p));

  if (percents.length === 0) {
    return 0;
  }

  const total = percents.reduce((sum, p) => sum + p, 0);
  return total / percents.length;
}

// ===================== Attendance Rate (%) =====================

export function calculateAttendanceRate(student) {
  const attendance = student.attendance || [];

  if (attendance.length === 0) {
    return 0;
  }

  const presentCount = attendance.filter(
    (record) => record.status === "present",
  ).length;

  return (presentCount / attendance.length) * 100;
}

// ===================== At Risk =====================

export function isAtRisk(student, submissions = [], tasks = []) {
  const average = calculateStudentAverage(student, submissions, tasks);
  const attendance = calculateAttendanceRate(student);

  return average < 50 || attendance < 75;
}

// ===================== Top Students =====================

export function getTopStudents(
  students,
  submissions = [],
  tasks = [],
  limit = 3,
) {
  return [...students]
    .sort(
      (a, b) =>
        calculateStudentAverage(b, submissions, tasks) -
        calculateStudentAverage(a, submissions, tasks),
    )
    .slice(0, limit);
}

// ===================== At Risk Students =====================

export function getAtRiskStudents(students, submissions = [], tasks = []) {
  return students.filter((student) => isAtRisk(student, submissions, tasks));
}

// ===================== Class Average (%) =====================

export function calculateClassAverage(students, submissions = [], tasks = []) {
  if (students.length === 0) {
    return 0;
  }

  const total = students.reduce(
    (sum, student) =>
      sum + calculateStudentAverage(student, submissions, tasks),
    0,
  );

  return total / students.length;
}

// ===================== Average Attendance (%) =====================

export function calculateClassAttendance(students) {
  if (students.length === 0) {
    return 0;
  }

  const total = students.reduce(
    (sum, student) => sum + calculateAttendanceRate(student),
    0,
  );

  return total / students.length;
}

// ===================== Pass Rate (%) =====================

export function calculatePassRate(students, submissions = [], tasks = []) {
  if (students.length === 0) {
    return 0;
  }

  const passed = students.filter(
    (student) => calculateStudentAverage(student, submissions, tasks) >= 50,
  );

  return (passed.length / students.length) * 100;
}

// ===================== Grade Distribution =====================

export function getGradeDistribution(students, submissions = [], tasks = []) {
  const distribution = {
    excellent: 0,
    good: 0,
    satisfactory: 0,
    fail: 0,
  };

  students.forEach((student) => {
    const average = calculateStudentAverage(student, submissions, tasks);

    if (average >= 85) distribution.excellent++;
    else if (average >= 70) distribution.good++;
    else if (average >= 50) distribution.satisfactory++;
    else distribution.fail++;
  });

  return distribution;
}

// ===================== Student Status =====================

export function getStudentPerformanceStatus(
  student,
  submissions = [],
  tasks = [],
) {
  const average = calculateStudentAverage(student, submissions, tasks);

  if (average >= 85) return "Excellent";
  if (average >= 70) return "Good";
  if (average >= 50) return "Needs Improvement";
  return "Fail";
}
