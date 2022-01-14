import rootAPI, {_rootPath, displayError} from "../rootAPI";

const program = {
    schedule: _rootPath + "/schedule",
    createLive: _rootPath + "/schedule/create_live",
    createEmergency: _rootPath + "/schedule/create_eme",
    playingProgram: _rootPath + "/schedule/playing"
};

function listProgram(params, callback) {
    rootAPI().get(program.schedule, {params})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createProgram(data, callback) {
    rootAPI().post(program.schedule, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            if (error.response.data.data === null) {
                displayError(error);
            }
            return callback(error);
        });
}

function editProgram(data, callback) {
    rootAPI().patch(program.schedule + "/" + data.idSchedule, {...data, idSchedule: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            if (error.response.data.data === null) {
                displayError(error);
            }
            return callback(error);
        });
}

function deleteProgram(data, callback) {
    rootAPI().delete(program.schedule + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createEmergency(data, callback) {
    rootAPI().post(program.createEmergency, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createLive(data, callback) {
    rootAPI().post(program.createLive, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function endLive(data, callback) {
    rootAPI().post(program.schedule + `/${data.id}/end_live`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function endEme(data, callback) {
    rootAPI().post(program.schedule + `/${data.id}/end_eme`)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function lockProgram(data, callback) {
    rootAPI().patch(program.schedule + `/${data.id}`, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function getPlayingProgram(data, callback) {
    rootAPI().get(program.playingProgram)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            // displayError(error);
            return callback(error);
        });
}

export default {
    listProgram,
    createProgram,
    editProgram,
    deleteProgram,
    createEmergency,
    createLive,
    endLive,
    endEme,
    lockProgram,
    getPlayingProgram
};
