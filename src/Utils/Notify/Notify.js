// import React   from "react";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const success = (msg = "", options = {}) => {
    toast.clearWaitingQueue();
    openNotification('success', msg, options);
};

const info = (msg = "", options = {}) => {
    toast.clearWaitingQueue();
    openNotification('info', msg, options);
};

const warning = (msg = "", options = {}) => {
    toast.clearWaitingQueue();
    openNotification('warning', msg, options);
};

const error = (msg = "", options = {}) => {
    toast.clearWaitingQueue();
    openNotification('error', msg, options);
};

const openNotification = (type, msg, options) => {
    toast[type](msg, {
        pauseOnFocusLoss: false,
        autoClose: type === 'error' ? 3500 : 1500,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        ...options
    });
};

export default {
    success,
    info,
    warning,
    error
};
