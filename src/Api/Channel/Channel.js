import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    equipment: _rootPath + "/channel"
};

function getListChannel(callback) {
    rootAPI().get(path.equipment)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}
function updateChannel(data, callback) {
    rootAPI().patch(path.equipment + "/" + data.id, {...data})
        .then(res => {
          return callback(null, res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        })
}

function deleteChannel(data, callback) {
    rootAPI().delete(path.equipment + "/" + data.id)
        .then(res => {
            return callback(null, res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        })
}

function createChannel(data, callback) {
    rootAPI().post(path.equipment, data)
        .then(res => {
        return callback(null, res.data)
    })
        .catch(err => {
            displayError(err);
            return callback(err);
        })
}
export default {
    getListChannel,
    updateChannel,
    deleteChannel,
    createChannel,
};