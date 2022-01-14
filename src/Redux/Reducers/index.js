import {combineReducers} from "redux";

import app    from './appReducer';
import user   from "./userReducer";
import notify from "./notifyReducer";

export default combineReducers({
    app,
    user,
    notify
});
