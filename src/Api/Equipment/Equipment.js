import rootAPI, {_rootPath, displayError} from "../rootAPI";

const path = {
    equipment: {
        path: _rootPath + "/device",
        control: _rootPath + "/device/control",
        export: _rootPath + "/device/export"
    }
};

function getListEquipment(params, callback) {
    rootAPI().get(path.equipment.path, {
        params: {
            ...params
        }
    })
        .then(res => {
            const totalPage = res.headers['x-pagination-page_count'];
            return callback(null, res.data, totalPage);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function createEquipment(data, callback) {
    rootAPI().post(path.equipment.path, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function editEquipment(data, callback) {
    rootAPI().patch(path.equipment.path + "/" + data.id, {...data, id: undefined})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function deleteEquipment(data, callback) {
    rootAPI().delete(path.equipment.path + "/" + data.id)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function controlEquipment(data, callback) {
    rootAPI().post(path.equipment.control, data)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}

function exportEquipment(data, callback) {
    rootAPI({responseType: 'blob'}).post(path.equipment.export)
        .then(res => {
            return callback(null, res.data)
        })
        .catch(error => {
            displayError(error);
            return callback(error)
        })
}

export default {
    getListEquipment,
    createEquipment,
    editEquipment,
    deleteEquipment,
    controlEquipment,
    exportEquipment
};
