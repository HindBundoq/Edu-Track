const BASE_URL = "http://localhost:3000";

// ================= AUTH API ===========================

export async function loginApi(email, password) {
  try {
    const response = await fetch(
      `${BASE_URL}/instructors?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    );

    if (!response.ok) {
      throw new Error("Login request failed");
    }

    const instructors = await response.json();

    if (instructors.length === 0) {
      throw new Error("Email or password is not valid");
    }

    return instructors[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// ================= STUDENTS API =======================

// Get all students for one instructor
export async function getAllStudents(instructorId) {
  try {
    const response = await fetch(
      `${BASE_URL}/students?instructorId=${instructorId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get instructor students");
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Get one student belonging to one instructor
export async function getStudentById(id, instructorId) {
  try {
    const response = await fetch(
      `${BASE_URL}/students/${id}?instructorId=${instructorId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get student");
    }

    const students = await response.json();

    if (students.length === 0) {
      throw new Error("Student not found");
    }

    return students[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Add student
export async function addStudent(student) {
  try {
    const response = await fetch(`${BASE_URL}/students`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(student),
    });

    if (!response.ok) {
      throw new Error("Failed to add student");
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Update student
export async function updateStudent(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update student");
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Delete student
export async function deleteStudent(id) {
  try {
    const response = await fetch(`${BASE_URL}/students/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete student");
    }

    return true;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// ================= ACTIVITIES API =====================

// Get all activities for instructor
export async function getInstructorActivities(instructorId) {
  try {
    const response = await fetch(
      `${BASE_URL}/activities?instructorId=${instructorId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get instructor activities");
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Get activities for specific student + instructor
export async function getStudentActivities(studentId, instructorId) {
  try {
    const response = await fetch(
      `${BASE_URL}/activities?studentId=${studentId}&instructorId=${instructorId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get student activities");
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Add activity
export async function addActivity(activity) {
  try {
    const response = await fetch(`${BASE_URL}/activities`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      throw new Error("Failed to add activity");
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
