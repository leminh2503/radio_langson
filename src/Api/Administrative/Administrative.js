import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    administrative: {
        local: _rootPath + "/administrative",
    }
};

function getAdministrativeByCode(data, callback) {
    rootAPI().get(path.administrative.local + "/" + data.code)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function getListAdministrative(callback) {
    rootAPI().get(path.administrative.local)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createAdministrative(data, callback) {
    rootAPI().post(path.administrative.local, {...data, code: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function editAdministrative(data, callback) {
    rootAPI().patch(path.administrative.local + "/" + data.code, {...data, code: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function deleteAdministrative(data, callback) {
    rootAPI().delete(path.administrative.local + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function getAdministrativeWithSelf(data, callback) {
    rootAPI().get(path.administrative.local + "/" + data.code + "/children_with_self")
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

export default {
    getAdministrativeByCode,
    getListAdministrative,
    createAdministrative,
    editAdministrative,
    deleteAdministrative,
    getAdministrativeWithSelf
};
