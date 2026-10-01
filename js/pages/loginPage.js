const Showpass=document.getElementById("showpass");
const Theme=document.getElementById("theme") ;
const Email = document.getElementById("email");
const Password = document.getElementById("password");
const LoginButton = document.getElementById("login-button");
const Form = document.querySelector("form");

Showpass.addEventListener("click", function() {
      if (Password.type === "password")
         {
                 Showpass.textContent="hide"

            Password.type="text";
         } 
        else 
          {
            Password.type="password";
             Showpass.textContent="show"



          }

});






Theme.addEventListener("click", function() {
    document.body.classList.toggle("dark");
     if (document.body.classList.contains("dark")) {
        Theme.textContent = "Light Mode";
    } else {
        Theme.textContent = "Dark Mode";
    }
});


//لما المستخدم يضعط login
Form.addEventListener("submit" , function(event){
    event.preventDefault();
    console.log(Email.value);
    console.log(Password.value)
})




