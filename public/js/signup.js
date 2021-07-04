const formSignup = document.querySelector('.form--signup');

const signup = async (name, email, password, passwordConfirm) => {
  
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })
        if (res.data.status === 'success') {
            showAlert('success', 'sign up successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message);
    }
}

if (formSignup) {

    formSignup.addEventListener('submit', el => {
        el.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    });
}