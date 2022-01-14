import rootAPI, {_rootPath, displayError, getTotalPage} from "../rootAPI";

const path = {
    calendar: _rootPath + "/calendar",
    confirm_response: _rootPath + "/confirm_response"
};
function getDetailCalendar(data, callback) {
    rootAPI().get(path.calendar + `/${data.id}`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error, {notFound: true});
            return callback(error);
        });
}

function listCalendar(params, callback) {
    rootAPI().get(path.calendar, {
        params: {
            ...params,
            ordering: '-date_schedule',
            search: !params?.search ? undefined : params?.search
        }
    })
        .then(res => {
            return callback(null, res.data, getTotalPage(res));
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createCalendar(data, callback) {
    rootAPI().post(path.calendar, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function lockCalendar(data, callback) {
    rootAPI().patch(path.calendar + `/${data.id}`, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function requestDeputy(id, callback) {
    rootAPI().post(path.calendar + `/${id}/confirm_request`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function requestEditor(id, callback) {
    rootAPI().post(path.calendar + `/${id}/confirm_level2`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function changeStatusCalendar(data, callback) {
    rootAPI().post(path.calendar + `/${data.id}/confirm_response`, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function deleteCalendar(id, callback) {
    rootAPI().delete(path.calendar + `/${id}`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function repeatCalendar(data, callback) {
    rootAPI().post(path.calendar + `/${data.id}/clone`, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}


export default {
    getDetailCalendar,
    listCalendar,
    createCalendar,
    lockCalendar,
    requestDeputy,
    requestEditor,
    changeStatusCalendar,
    deleteCalendar,
    repeatCalendar
};
