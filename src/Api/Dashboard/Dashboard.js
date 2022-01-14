import rootAPI, {_rootPath, displayError} from "../rootAPI";

const dashboard = {
    schedule: _rootPath + "/dashboard/schedule",
    device: _rootPath + "/dashboard/device",
    file: _rootPath + "/dashboard/file",
    user: _rootPath + "/dashboard/user"
};

const getUrl = (type) => {
    switch (type) {
        case 'schedule':
            return dashboard.schedule;
        case 'device':
            return dashboard.device;
        case 'file':
            return dashboard.file;
        case 'user':
            return dashboard.user;
        default:
            return '';
    }
};

function getDataChart(type, params, callback) {
    const url = getUrl(type);
    rootAPI().get(url, {params})
        .then(res => {
            return callback(null, res.data);
        })
        .catch(error => {
            displayError(error);
            return callback(error);
        });
}


export default {
    getDataChart
};
