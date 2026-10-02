const Showpass = document.getElementById("showpass");

Showpass.addEventListener("click", function () {
  if (Password.type === "password") {
    Showpass.textContent = "hide";

    Password.type = "text";
  } else {
    Password.type = "password";
    Showpass.textContent = "show";
  }
});
