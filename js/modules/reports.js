// ===================== Average Grade =====================

export function calculateStudentAverage(student) {
    const assignments = student.scores?.assignments || [];
    const quizzes = student.scores?.quizzes || [];
    const exam = student.scores?.exam;

    const grades = [];

    assignments.forEach(item => {
        grades.push(Number(item.grade));
    });

    quizzes.forEach(item => {
        grades.push(Number(item.grade));
    });

    if (exam !== null && exam !== undefined) {
        grades.push(Number(exam));
    }

    if (grades.length === 0) {
        return 0;
    }

    const total = grades.reduce((sum, grade) => {
        return sum + grade;
    }, 0);

    return total / grades.length;
}


// ===================== Attendance Rate =====================

export function calculateAttendanceRate(student) {
    const attendance = student.attendance || [];

    if (attendance.length === 0) {
        return 0;
    }

    const presentCount = attendance.filter(record => {
        return record.status === "present";
    }).length;

    return (presentCount / attendance.length) * 100;
}


// ===================== At Risk =====================

export function isAtRisk(student) {
    const average = calculateStudentAverage(student);
    const attendance = calculateAttendanceRate(student);

    return average < 50 || attendance < 75;
}

// ===================== Top Students =====================

export function getTopStudents(students, limit = 3) {
    return [...students]
        .sort((a, b) => {
            return (
                calculateStudentAverage(b) -
                calculateStudentAverage(a)
            );
        })
        .slice(0, limit);
}


// ===================== At Risk Students =====================

export function getAtRiskStudents(students) {
    return students.filter(student => {
        return isAtRisk(student);
    });
}


// ===================== Class Average =====================

export function calculateClassAverage(students) {
    if (students.length === 0) {
        return 0;
    }

    const total = students.reduce((sum, student) => {
        return sum + calculateStudentAverage(student);
    }, 0);

    return total / students.length;
}




// ===================== Average Attendance =====================

export function calculateClassAttendance(students) {
    if (students.length === 0) {
        return 0;
    }

    const total = students.reduce((sum, student) => {
        return sum + calculateAttendanceRate(student);
    }, 0);

    return total / students.length;
}


// ===================== Pass Rate =====================

export function calculatePassRate(students) {
    if (students.length === 0) {
        return 0;
    }

    const passedStudents = students.filter(student => {
        return calculateStudentAverage(student) >= 50;
    });

    return (passedStudents.length / students.length) * 100;
}


// ===================== Grade Distribution =====================

export function getGradeDistribution(students) {
    const distribution = {
        excellent: 0,
        good: 0,
        satisfactory: 0,
        fail: 0
    };

    students.forEach(student => {
        const average = calculateStudentAverage(student);

        if (average >= 85) {
            distribution.excellent++;
        } else if (average >= 70) {
            distribution.good++;
        } else if (average >= 50) {
            distribution.satisfactory++;
        } else {
            distribution.fail++;
        }
    });

    return distribution;
}


// ===================== Student Status =====================

export function getStudentPerformanceStatus(student) {
    const average = calculateStudentAverage(student);

    if (average >= 85) {
        return "Excellent";
    }

    if (average >= 70) {
        return "Good";
    }

    if (average >= 50) {
        return "Needs Improvement";
    }

    return "Fail";
}