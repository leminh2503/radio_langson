import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    auth: {
        login: _rootPath + "/auth",
        register: _rootPath + "/auth/register",
        refresh_token: _rootPath + "/auth/refresh_token"
    }
};

function login(data, callback) {
    rootAPI({
        withToken: false
    }).post(path.auth.login, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function register(data, callback) {
    rootAPI().post(path.auth.register, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function refreshToken(data, callback) {
    rootAPI().post(path.auth.refresh_token, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

export default {
    login,
    register,
    refreshToken
};
