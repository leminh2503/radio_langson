import rootAPI, {_rootPath} from "../rootAPI";

const path = {
    role: {
        local: _rootPath + "/role",
    },
};

function getAllRole(callback) {
    rootAPI().get(path.role.local)
        .then(res => {
            return callback(null, res.data);
        })
        .catch(err => {
            return callback(err);
        });
}

export default {
    getAllRole
};
