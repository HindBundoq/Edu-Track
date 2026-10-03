// =====================================================
// registrationPage.js
// Registration page logic: show/hide passwords, validate the form,
// save the new instructor, then go to the login page.
// HTML: registration.html   |   Helpers: js/modules/auth.js
// =====================================================

import {
  validateRegistration,
  isEmailTaken,
  registerInstructor,
} from "../modules/auth.js";

// =====================================================
// 1. Get the elements from the HTML
// =====================================================

const form = document.querySelector("form");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

const showPasswordBtn = document.getElementById("showpass");
const showConfirmPasswordBtn = document.getElementById("show-confirm-pass");

const message = document.getElementById("message");

// =====================================================
// 2. Show / hide password
// One function works for both password fields.
// =====================================================

function togglePassword(input, button) {
  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
  }
}

showPasswordBtn.addEventListener("click", () => {
  togglePassword(passwordInput, showPasswordBtn);
});

showConfirmPasswordBtn.addEventListener("click", () => {
  togglePassword(confirmPasswordInput, showConfirmPasswordBtn);
});

// =====================================================
// 3. Show a message under the form
// type: "error" (red) or "success" (green), colors come from main.css
// =====================================================

function showMessage(text, type) {
  message.textContent = text;

  if (type === "success") {
    message.style.color = "var(--ok)";
  } else {
    message.style.color = "var(--bad)";
  }
}

// =====================================================
// 4. Register the instructor
// =====================================================

async function handleRegister(event) {
  // stop the form from reloading the page
  event.preventDefault();

  // read the values (trim() removes extra spaces at the start and end)
  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // 4.1 check the inputs (destructuring: take isValid and message from the result object)
  const { isValid, message: errorMessage } = validateRegistration(
    name,
    email,
    password,
    confirmPassword,
  );

  if (!isValid) {
    showMessage(errorMessage, "error");
    return;
  }

  try {
    // 4.2 the email must not be used before
    const emailTaken = await isEmailTaken(email);

    if (emailTaken) {
      showMessage("This email is already registered. Please log in.", "error");
      return;
    }

    // 4.3 save the new instructor (same shape as instructors in db.json)
    const newInstructor = {
      name: name,
      email: email,
      password: password,
    };

    await registerInstructor(newInstructor);

    // 4.4 success: show a welcome message (template literal)
    showMessage(
      `Welcome ${name}! Your account was created. Redirecting to login...`,
      "success",
    );

    // wait 1.5 seconds so the user can read the message, then go to the login page

    window.location.href = "index.html";
  } catch (error) {
    // the server is not running or the request failed
    console.error(error);
    showMessage(
      "Something went wrong. Please make sure json-server is running.",
      "error",
    );
  }
}

// =====================================================
// 5. Events
// Register is a submit button, so one "submit" event covers both:
// - click on the Register button
// - pressing Enter inside any input
// =====================================================

form.addEventListener("submit", handleRegister);
