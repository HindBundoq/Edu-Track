const studentsBody = document.getElementById("studentsBody");
const dateInput = document.getElementById("dateInput");
fetch("http://localhost:3000/students")
  .then(response => response.json())
  .then(students => {
    students.forEach(student => {
      studentsBody.innerHTML += `
        <tr>
          <td>${student.name}</td>
          <td>${student.id}</td>
          <td>${student.course}</td>
        </tr>
      `;
    });
  });