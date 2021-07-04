const logout = document.querySelector('.nav__el--logout');

const logoutUser = async (req, res, next) => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',

        })
        if (res.data.status === 'success') {
            showAlert('success', 'Logout successfully!');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1000);
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message);
    }
}

if (logout) {
    logout.addEventListener('click', logoutUser)
}