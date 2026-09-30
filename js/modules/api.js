const BASE_URL = "http://localhost:3000"

// ===================== Login ===========================

export async function login(email, password) {
    try {
        const response = await fetch(
            `${BASE_URL}/instructors?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );

        if (!response.ok) {
            throw new Error("Login request failed");
        }

        const instructors = await response.json();

        if (instructors.length === 0) {
            throw new Error("Email or password is not valid");
        }

        const instructor = instructors[0];

        localStorage.setItem(
            "currentInstructor",
            JSON.stringify(instructor)
        );

        return instructor;

    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// ===================== Get all student Api =============

export async function getAllStudents(instructorId) {
    try {
        const response = await fetch(
            `${BASE_URL}/students?instructorId=${instructorId}`
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

// ====================== Get student by id =============

export async function getStudentById(id, instructorId) {
    try {
        const response = await fetch(
            `${BASE_URL}/students?id=${id}&instructorId=${instructorId}`
        );

        if (!response.ok) {
            throw new Error("Failed to get student");
        }

        const students = await response.json();

        if (students.length === 0) {
            throw new Error("Student not found for this instructor");
        }

        return students[0];

    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// ===================== Add student api ==============

export async function addStudent(student) {
    try {
          const response = await fetch(`${BASE_URL}/students`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },
      
          body: JSON.stringify(student)
        });
    
        if (!response.ok) {
          throw new Error("Failed to add student");
        }

        return await response.json();

    }catch (error) {
    console.error(error.message);
    throw error;
}
}

// =================== Delete User =====================

export async function deleteStudent(id) {
    try {
        const response = await fetch(`${BASE_URL}/students/${id}`, {
          method: "DELETE",
          
        });
        if (!response.ok) {
            throw new Error("Failed to Delete student")
          }

        return await response.json();
    }catch(error) {
        console.error(error.message);
        throw error;
    }
}

// ===================  Update ========================

export async function updateStudent(id, data) {
    try {
        const response = await fetch(`${BASE_URL}/students/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error("Failed to Update student")
          }

        return await response.json();
    }catch(error) {
        console.error(error.message);
        throw error;
    }
}


// =================  Activities =================

// Get all activities for one instructor
export async function getInstructorActivities(instructorId) {
    try {
        const response = await fetch(
            `${BASE_URL}/activities?instructorId=${instructorId}`
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


// Get activities for one specific student
export async function getStudentActivities(studentId) {
    try {
        const response = await fetch(
            `${BASE_URL}/activities?studentId=${studentId}`
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


// Add new activity
export async function addActivity(activity) {
    try {
        const response = await fetch(
            `${BASE_URL}/activities`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(activity)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to add activity");
        }

        return await response.json();

    } catch (error) {
        console.error(error.message);
        throw error;
    }
}