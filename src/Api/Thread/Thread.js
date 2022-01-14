import rootAPI,{_rootPath, displayError} from "../rootAPI";

const path = {
    thread: _rootPath + '/thread'
}

function getThread(params, callback) {
    rootAPI().get(path.thread, {params})
        .then(res => {
            return callback(null,res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err)
        })
}

function getThreadById(data, callback) {
    rootAPI().get(path.thread + "/" + data.id)
        .then(res => {
            return callback(null, res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err)
        })
}

function createThread(data, callback) {
    rootAPI().post(path.thread,{...data, id: undefined})
        .then(res => {
            callback(null, res.data)
        })
        .catch(error => {
            displayError(error);
            return callback(error)
        })
}

function editThread(data, callback) {
    rootAPI().patch(path.thread + "/" + data.id, {...data, id: undefined})
        .then(res => {
            return callback(null,res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err)
        })
}

function deleteThread(data, callback) {
    rootAPI().delete(path.thread + "/" + data.id)
        .then(res => {
            return callback(null, res.data)
        })
        .catch(err => {
            displayError(err);
            return callback(err)
        })
}

export default {
    getThread,
    createThread,
    editThread,
    deleteThread,
    getThreadById
}