import * as types from "../Constants";

const initialState = {
    "unread": 0
};

export default function (state = initialState, action) {
    switch (action.type) {
        case types.NOTIFY_CHANGE:
            return {
                unread: action.notify
            };
        case types.NOTIFY_CLEAR:
            return initialState;
        default:
            return state;
    }
}
