import rootAPI, {_rootPath, displayError, getTotalPage} from "../rootAPI";

const path = {
    notify: _rootPath + '/notify',
    setTokenFirebase: _rootPath + '/notify/set_token_firebase',
    setAllAsRead: _rootPath + '/notify/set_all_as_read',
    countUnread: _rootPath + '/notify/count_unread'
};

function listNotification(params, callback) {
    rootAPI().get(path.notify, {params})
        .then(res => {
            return callback(null, res.data, getTotalPage(res));
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function setTokenFirebase(data, callback) {
    rootAPI().patch(path.setTokenFirebase, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function setAsRead(data, callback) {
    rootAPI().patch(path.notify + `/${data.id}/set_as_read`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function setAllAsRead(callback) {
    rootAPI().patch(path.setAllAsRead)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

function countUnread(callback) {
    rootAPI().get(path.countUnread)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}

export default {
    listNotification,
    setTokenFirebase,
    setAsRead,
    setAllAsRead,
    countUnread
};
