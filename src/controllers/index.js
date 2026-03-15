const loginBtn = document.getElementById('Loginbtn');
const signinBtn = document.getElementById('Signinbtn');

const redirectToUrl = (url, delay, callback) => {
    setTimeout(() => {
        window.location.href = url;
        if (callback) callback();
    }, delay);
};

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        console.log("Redirecting to login...");
        redirectToUrl('/src/View/login.html', 1500, () => {
            console.log("Redirection completed");
        });
    });
}

if (signinBtn) {
    signinBtn.addEventListener('click', () => {
        alert('Inscription non encore implémentée');
    });
}
