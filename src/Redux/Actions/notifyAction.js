import * as types from "../Constants";

export const notifyChange = notify => ({
    type: types.NOTIFY_CHANGE,
    notify
});

export const notifyClear = () => ({
    type: types.NOTIFY_CLEAR
});


