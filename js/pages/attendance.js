const studentsBody = document.getElementById("studentsBody");
const searchInput = document.getElementById("searchInput");
const dateInput = document.getElementById("dateInput");
const courseSelect = document.getElementById("courseSelect");

fetch("http://localhost:3000/students")
  .then(response => response.json())
  .then(students => {

    // إضافة الكورسات الموجودة في البيانات
    const courses = [];

    students.forEach(student => {

      if (!courses.includes(student.course)) {
        courses.push(student.course);
      }

    });

    courses.forEach(course => {

      courseSelect.innerHTML += `
        <option value="${course}">${course}</option>
      `;

    });


    function displayStudents(studentList) {

      studentsBody.innerHTML = "";

      studentList.forEach(student => {

        // حالة الطالب في التاريخ المختار
        const attendance = student.attendance.find(
          item => item.date === dateInput.value
        );

        let status = "-";

        if (attendance) {
          status = attendance.status;
        }


        // حساب Overall
        const totalDays = student.attendance.length;

        const presentDays = student.attendance.filter(
          item => item.status === "present"
        ).length;

        let overall = 0;

        if (totalDays > 0) {
          overall = Math.round((presentDays / totalDays) * 100);
        }


        // عرض الطالب في الجدول
        studentsBody.innerHTML += `
          <tr>
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.course}</td>
            <td>${overall}%</td>
            <td>${status}</td>
          </tr>
        `;

      });

    }


    // عرض جميع الطلاب
    displayStudents(students);


    // تغيير التاريخ
    dateInput.addEventListener("change", () => {

      displayStudents(students);

    });


    // البحث بالاسم أو ID
    searchInput.addEventListener("input", () => {

      const searchValue = searchInput.value.toLowerCase();

      const filteredStudents = students.filter(student =>
        student.id.includes(searchValue) ||
        student.name.toLowerCase().includes(searchValue)
      );

      displayStudents(filteredStudents);

    });


    // اختيار الكورس
    courseSelect.addEventListener("change", () => {

      const selectedCourse = courseSelect.value;

      if (selectedCourse === "all") {

        displayStudents(students);

      } else {

        const filteredStudents = students.filter(student =>
          student.course === selectedCourse
        );

        displayStudents(filteredStudents);

      }

    });

  });