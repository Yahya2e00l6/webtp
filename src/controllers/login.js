import { finduserbymail} from '../modules/database.js';

const emailInput = document.getElementById('mail');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitbtn');
const errorMessage = document.getElementById('error');
const togglePassword = document.getElementById('display');

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁' : '🔒';
    });
}

if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        submitBtn.disabled = true;
        submitBtn.textContent = "Vérification...";
        errorMessage.textContent = "";
        const email = emailInput.value;
        const password = passwordInput.value;
        setTimeout(()=>{
            finduserbymail(email, password, (loginErr, user) => {
                if (loginErr) {
                    errorMessage.textContent = loginErr;
                    errorMessage.style.color = "red"
                    submitBtn.textContent = "Se connecter";
                    submitBtn.disabled = false;
                } else {
                    errorMessage.textContent = "Connexion réussie";
                    errorMessage.style.color = "green"
                    submitBtn.textContent = "Redirection...";
                    localStorage.setItem('loggedInUserId', user.id);
                    setTimeout(() => {
                        window.location.href = '/src/View/dashboard.html';
                    }, 1000);
                }
            }); 
        },500)
    })
};

