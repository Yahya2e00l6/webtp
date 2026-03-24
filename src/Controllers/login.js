
import {finduserbymail} from "../Model/database.js";

// recuperation des elements DOM
const mailInput = document.getElementById("mail");
const passwordInput  = document.getElementById("password");
const submitBtn = document.getElementById("submitbtn");
const display   = document.getElementById("display");

const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

// event listener sur le bouton Se connecter
submitBtn.addEventListener("click", handleSubmit);

function handleSubmit() {
    const mail = mailInput.value;
    const password = passwordInput.value;

    if (!mail || password === "") {
        alert("Bad credentials.");
        return;
    }

    submitBtn.textContent = "Checking!!!";
    submitBtn.disabled = true;

    delay(500)
        .then(() => finduserbymail(mail, password))
        .then((user) => {
            sessionStorage.setItem("currentUser", JSON.stringify(user));
            return delay(1000);
        })
        .then(() => {
            document.location = "dashboard.html";
        })
        .catch((error) => {
            alert(error?.message || "Bad credentials.");
            submitBtn.textContent = "Se connecter";
            submitBtn.disabled = false;
        });
}