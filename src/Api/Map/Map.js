import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    map: _rootPath + "/map"

}

function getMap(callback) {
    rootAPI().get(path.map)
        .then(res => {
            return callback(null, res)
        })
        .catch(err => {
            displayError(err)
            return callback(err)
        })
}
function getMapByCode(data, callback) {
    rootAPI().get(path.map + "/" + data.id)
        .then(res => {
            return callback(null, res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err)
        })
}
function editMap(data,callback) {
    rootAPI().patch(path.map + "/" + data.id, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err)
        })
}

export default {
    getMap,
    editMap,
    getMapByCode
}