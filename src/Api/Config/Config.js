import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    config: {
        path: _rootPath + "/config"
    }
};

function getConfig(data, callback) {
    rootAPI().get(path.config.path)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function editConfig(data, callback) {
    rootAPI().patch(path.config.path + `/${data.id}`, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error, {autoClose: 1000});
            return callback(error);
        });
}

export default {
    getConfig,
    editConfig
};
