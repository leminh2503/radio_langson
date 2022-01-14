const smalltalk = require('./SmallTalk');

const _defaultTitle = "Radio Internet";

function alert(msg, title = _defaultTitle) {
    smalltalk.alert(title, msg);
}

function confirm(msg, callback) {
    smalltalk.confirm(_defaultTitle, msg, {className: 'slideInTop'})
        .then(() => {
            return callback(true);
        })
        .catch(() => {
            return callback(false);
        })
}

export default {
    alert,
    confirm
};
