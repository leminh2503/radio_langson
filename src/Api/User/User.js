import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    user: {
        path: _rootPath + "/user",
        me: _rootPath + "/user/me",
        changePassword: _rootPath + "/user/change_password",
        passwordRecovery: _rootPath + "/user/password_recovery",
        changePasswordFromRecovery: _rootPath + "/user/change_password_from_recovery",
        changeAvatar: _rootPath + "/user/change_avatar",
        verifyOtp: _rootPath + "/user/verify_otp",
        logout: _rootPath + "/user/logout"
    }
};

function blockUser(data, callback) {
    rootAPI().delete(path.user.path + "/" + data.username)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function changeAvatar(data, callback) {
    const formData = new FormData();
    formData.append("avatar", data?.file);
    rootAPI().post(path.user.changeAvatar, formData)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function deleteUser(data, callback) {
    rootAPI().delete(path.user.path + "/" + data.username)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function resetPassword(data, callback) {
    rootAPI().post(path.user.path + "/" + data.username + "/reset_password")
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function changePassword(data, callback) {
    rootAPI().post(path.user.changePassword, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function editUser(data, callback) {
    rootAPI().post(path.user.path + "/" + data.id + "/" + data.action)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function getListUser(params, callback) {
    rootAPI().get(path.user.path, {params})
        .then(res => {
            const totalPage = res.headers['x-pagination-page_count'];
            return callback(null, res.data, totalPage);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function passwordRecovery(data, callback) {
    rootAPI().post(path.user.passwordRecovery, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function changePasswordFromRecovery(data, callback) {
    rootAPI().post(path.user.changePasswordFromRecovery, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function getMe(callback) {
    rootAPI().get(path.user.me)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function editMe(data, callback) {
    rootAPI().patch(path.user.me, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function adminEditUser(data, callback) {
    rootAPI().patch(path.user.path + "/" + data.username, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function verifyOtp(data, callback) {
    rootAPI().post(path.user.verifyOtp, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

async function logout() {
    await rootAPI().post(path.user.logout);
}

export default {
    blockUser,
    changeAvatar,
    deleteUser,
    resetPassword,
    changePassword,
    getMe,
    editUser,
    getListUser,
    passwordRecovery,
    changePasswordFromRecovery,
    editMe,
    adminEditUser,
    verifyOtp,
    logout
};
