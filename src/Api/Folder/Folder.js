import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    folder: {
        path: _rootPath + "/folder",
        root: _rootPath + "/folder/root"
    }
};

function listAllInFolder(data, callback) {
    // type: 'administrative', 'folder'
    rootAPI().get(_rootPath + `/${data.type}/${data.id}/children`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createFolder(data, callback) {
    rootAPI().post(path.folder.path, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function editFolder(data, callback) {
    rootAPI().patch(path.folder.path + "/" + data.id, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function deleteFolder(data, callback) {
    rootAPI().delete(path.folder.path + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}


export default {
    createFolder,
    listAllInFolder,
    editFolder,
    deleteFolder,
};
