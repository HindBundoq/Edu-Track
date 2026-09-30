const BASE_URL = "http://localhost:3000/students"
export async function addStudent(student) {
  const response = await fetch(BASE_URL, {
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
}