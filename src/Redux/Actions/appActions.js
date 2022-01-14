import * as types from '../Constants';

export const appChange = app => ({
    type: types.APP_CHANGE,
    app
});

export const appClear = () => ({
    type: types.APP_CLEAR
});

export const openSidebar = () => ({
    type: types.OPEN_SIDEBAR
});

export const closeSidebar = () => ({
    type: types.CLOSE_SIDEBAR
});

export const toggleSidebar = () => ({
    type: types.TOGGLE_SIDEBAR
});

export const toggleTheme = () => ({
    type: types.TOGGLE_THEME
});

export const closeContent = () => ({
    type: types.CLOSE_CONTENT
});

export const openContent = () => ({
    type: types.OPEN_CONTENT
});

export const togglePlayer = () => ({
    type: types.TOGGLE_PLAYER
});

export const toggleAudio = (status) => ({
    type: types.TOGGLE_AUDIO,
    status
});

export const changeAudioVolume = (audio) => ({
    type: types.CHANGE_VOLUME_AUDIO,
    audio
});