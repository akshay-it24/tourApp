const form = document.querySelector('.form--forgotPassword');

const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/forgotPassword',
            data: {
                email
            }
        })
        if (res.data.status === 'success') {
            showAlert('success', `${res.data.message}`);
            window.setTimeout(() => {
                location.assign('/login');
            }, 1000);
        }
    }
    catch (err) {
        // alert("error");
        showAlert('error', err.response.data.message);
    }
}

if (form) {

    form.addEventListener('submit', el => {
        el.preventDefault();
        const email = document.getElementById('email').value;
        forgotPassword(email);
    });
}