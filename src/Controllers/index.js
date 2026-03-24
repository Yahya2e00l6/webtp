// recuperation des elements DOM
const loginBtn  = document.getElementById("Loginbtn");
//const signinBtn = document.getElementById("Signinbtn");

const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

// bouton Login
loginBtn.addEventListener("click", handleLogin);

function handleLogin() {
    loginBtn.textContent = "loading...";
    delay(2000).then(() => {
        document.location = "login.html";
    });
}