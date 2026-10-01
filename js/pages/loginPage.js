const Showpass=document.getElementById("showpass");
const Theme=document.getElementById("theme") ;


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


