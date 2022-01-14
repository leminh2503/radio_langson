import * as types from "../Constants";

const initialState = {
    authToken: "",
    refreshToken: "",
    worker: 0
};

export default function (state = initialState, action) {
    switch (action.type) {
        case types.USER_CHANGE:
            return {
                ...state,
                ...action.user
            };
        case types.USER_CLEAR:
            return initialState;
        default:
            return state;
    }
}
