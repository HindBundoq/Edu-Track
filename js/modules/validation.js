const api_url = "http://localhost:3000/instructors";

const Email = document.getElementById("email");
const Password = document.getElementById("password");
const Form = document.querySelector("form");
const Message=document.getElementById("message")


const RememberMe = document.getElementById("remember-me");
Form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const res = await fetch(api_url);
    const instructors = await res.json();


    const instructor = instructors.find(function(user) 
    {
        return user.email === Email.value && user.password === Password.value;
    });




      if(instructor){
              Message.textContent="Login successful";
                  if (RememberMe.checked) 
                     {
                         sessionStorage.setItem("instructorId", instructor.id);
                             console.log("id=" +sessionStorage.getItem("instructorId"));

                     }

                    
    }
    else{
        Message.textContent="Invalid Email Or Password";

    }



});






