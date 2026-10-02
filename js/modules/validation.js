const api_url = "http://localhost:3000/instructors";

const Email = document.getElementById("email");
const Password = document.getElementById("password");
const Form = document.querySelector("form");
const Message = document.getElementById("message");
const RememberMe = document.getElementById("remember-me");

Form.addEventListener("submit", async function(event) {
    event.preventDefault();

    try {
        const res = await fetch(api_url);

        if (!res.ok) {
            throw new Error("Failed to load instructors");
        }

        const instructors = await res.json();

        const instructor = instructors.find(function(user) {
            return (
                user.email === Email.value.trim() &&
                user.password === Password.value
            );
        });

        if (!instructor) {
            Message.textContent = "Invalid Email Or Password";
            return;
        }

        Message.textContent = "Login successful";

        const {
            password,
            ...safeInstructor
        } = instructor;

        if (RememberMe.checked) {
            localStorage.setItem(
                "currentInstructor",
                JSON.stringify(safeInstructor)
            );

            sessionStorage.removeItem("currentInstructor");
        } else {
            sessionStorage.setItem(
                "currentInstructor",
                JSON.stringify(safeInstructor)
            );

            localStorage.removeItem("currentInstructor");
        }

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error(error);

        Message.textContent = "Something went wrong";
    }
});