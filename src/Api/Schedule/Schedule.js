import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    schedule: {
        path: _rootPath + "/schedule",
        confirm_schedule: _rootPath + "/confirm_schedule",
        create_emergency: _rootPath + "/schedule/create_emergency"
    }
};

function getSchedule(params, callback) {
    rootAPI().get(path.schedule.path, {params})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function getScheduleById(data, callback) {
    rootAPI().get(path.schedule.path + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function searchSchedule(callback) {
    rootAPI().get(path.schedule.path)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createSchedule(data, callback) {
    rootAPI().post(path.schedule.path, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function editSchedule(data, callback) {
    rootAPI().patch(path.schedule.path + "/" + data.id, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function deleteSchedule(data, callback) {
    rootAPI().delete(path.schedule.path + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function handleStatusSchedule(data, callback) {
    rootAPI().patch(
        (
            path.schedule.path
            + "?statusSchedule=" + data.status
            + "&scheduleId=" + data.id
        )
    )
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function getRequestConfirmSchedule(params, callback) {
    rootAPI().get(path.schedule.confirm_schedule, {
        params
    })
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function requestConfirmScheduleDeputyEditor(data, callback) {
    rootAPI().post(path.schedule.confirm_schedule, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function requestConfirmScheduleEditor(data, callback) {
    rootAPI().post(path.schedule.confirm_schedule + `/${data.id}/level_2`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function confirmOrDenySchedule(data, callback) {
    rootAPI().patch(path.schedule.confirm_schedule + `/${data.id}`, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}



export default {
    getSchedule,
    getScheduleById,
    searchSchedule,
    createSchedule,
    editSchedule,
    deleteSchedule,
    handleStatusSchedule,
    getRequestConfirmSchedule,
    requestConfirmScheduleDeputyEditor,
    requestConfirmScheduleEditor,
    confirmOrDenySchedule,
};
