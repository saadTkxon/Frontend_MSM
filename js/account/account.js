const loginBtn = document.getElementById('accountLoginBtn');
const registerBtn = document.getElementById('accountRegisterBtn');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

function openLogin(){
    loginBtn.ariaSelected = "true";
    registerBtn.ariaSelected = "false";
    registerForm.style.display = "none";
    loginForm.style.display = "block";
}

function openRegister(){
    loginBtn.ariaSelected = "false";
    registerBtn.ariaSelected = "true";
    registerForm.style.display = "block";
    loginForm.style.display = "none";
}

openLogin();

