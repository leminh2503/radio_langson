import * as types from "../Constants";

const initialState = {
    audioVolume: 1,
    isOpenSidebar: true,
    isOpenNavbar: true,
    isOpenContent: true,
    theme: "light",
    webview: false,
    isOpenPlayerView: false,
    isPlayingAudio: false,
    isMutedAudio: false
};

export default function (state = initialState, action) {
    switch (action.type) {
        case types.APP_CHANGE:
            return {
                ...state,
                ...action.app
            };
        case types.APP_CLEAR:
            return initialState;
        case types.OPEN_SIDEBAR:
            return {
                ...state,
                isOpenSidebar: true
            };
        case types.CLOSE_SIDEBAR:
            return {
                ...state,
                isOpenSidebar: false
            };
        case types.TOGGLE_SIDEBAR:
            return {
                ...state,
                isOpenSidebar: !state.isOpenSidebar
            };
        case types.TOGGLE_THEME:
            return {
                ...state,
                theme: state.theme === "light" ? "dark" : "light"
            };
        case types.CLOSE_CONTENT:
            return {
                ...state,
                isOpenContent: false
            };
        case types.OPEN_CONTENT:
            return {
                ...state,
                isOpenContent: true
            };
        case types.TOGGLE_PLAYER:
            return {
                ...state,
                isOpenPlayerView: !state.isOpenPlayerView
            };
        case types.TOGGLE_AUDIO:
            return {
                ...state,
                isPlayingAudio: action.status
            };
        case types.CHANGE_VOLUME_AUDIO:
            return {
                ...state,
                audioVolume: action.audio.volume
            };
        default:
            return state;
    }
}
