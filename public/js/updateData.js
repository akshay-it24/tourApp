const updateData = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');


const update = async (data, type) => {
    const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updatePassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe'
    try {
        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} update successfully!`);
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message);
    }

}

if (updateData) {
    updateData.addEventListener('submit', el => {
        el.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        console.log(document.getElementById('photo').files[0]);

        update(form, 'data');
    })
}

if (updatePassword) {
    updatePassword.addEventListener('submit', async el => {
        el.preventDefault();
        document.querySelector('.btn-save--password').innerHTML = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        update({ passwordCurrent, password, passwordConfirm }, 'password');

        document.querySelector('.btn-save--password').innerHTML = 'Save password'
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}