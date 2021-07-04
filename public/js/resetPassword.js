const reset = document.querySelector('.form--resetPassword');

const resetPassword = async (resetToken, password, passwordConfirm) => {

    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:3000/api/v1/users/resetPassword/${resetToken}`,
            data: {
                password,
                passwordConfirm
            }
        })

        if (res.data.status === 'success') {
            showAlert('success', 'Password reset successfully!');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1000);
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message);
    }
}


if (reset) {
    reset.addEventListener('submit', el => {
        el.preventDefault();
        const resetToken = document.getElementById('resetToken').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        resetPassword(resetToken, password, passwordConfirm);
    })

}