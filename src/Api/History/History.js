import rootAPI, {_rootPath, displayError, getTotalPage} from "../rootAPI";

const path = {
    history: {
        path: _rootPath + "/history_action"
    }
};

function getHistory(params, callback) {
    rootAPI().get(path.history.path, {
        params: {
            page_size: 50,
            ...params
        }
    })
        .then(res => {
            const totalPage = getTotalPage(res);
            return callback(null, res.data, totalPage);
        })
        .catch(err => {
            displayError(err);
            return callback(err);
        });
}


export default {
    getHistory
};
