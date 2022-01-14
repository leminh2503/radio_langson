import rootAPI, {_rootPath, displayError} from "../rootAPI";
import axios                              from "axios";

const path = {
    file: {
        local: _rootPath + "/file",
        download: _rootPath + "/file/download",
        play: _rootPath + "/file/play"
    }
};

function textToSpeech(data, callback) {
    rootAPI().post(path.file.local, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function downloadFile(data, callback) {
    rootAPI().get(path.file.download + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function getInfoFile(data, callback) {
    rootAPI().get(path.file.local + "/" + data.id, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createFile(data, callback) {
    const formData = new FormData();
    const {url, title, parent, duration, tags} = data;
    formData.append("url", url);
    formData.append("title", title);
    formData.append("parent", parent);
    formData.append("duration", parseInt(duration));
    formData.append("contentType", "mp3");
    if (tags) formData.append("tags", tags);
    rootAPI().post(path.file.local, formData)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function editFile(data, callback) {
    rootAPI().patch(path.file.local + "/" + data.id, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function deleteFile(data, callback) {
    rootAPI().delete(path.file.local + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function playFile(data, callback) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    rootAPI({responseType: 'blob'}).get(path.file.play + "/" + data.id, {
        cancelToken: source.token
    })
        .then(res => {
            return callback(null, res.data);
        })
        .catch(thrown => {
            if (axios.isCancel(thrown)) {

            } else {
                displayError(thrown);
                return callback(thrown);
            }
        });
}

function searchFile(data, callback) {
    rootAPI().get(path.file.local + `?search=${data.search}`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(thrown => {
            if (axios.isCancel(thrown)) {

            } else {
                displayError(thrown);
                return callback(thrown);
            }
        });
}

export default {
    textToSpeech,
    downloadFile,
    getInfoFile,
    createFile,
    editFile,
    deleteFile,
    playFile,
    searchFile
};
