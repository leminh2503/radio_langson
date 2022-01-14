import axios from "axios";

import {_rootPath}  from "../Config/index";
import displayError from "../Utils/Notify/DisplayError";
import {getCookie}  from "../Utils";
import {store}      from '../Redux/Store';

export {_rootPath, displayError};

export function getTotalPage(res) {
    return res.headers['x-pagination-page_count'];
}

const _defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
    }
};


export default function rootAPI(options = {}) {
    const _root = axios.create(_defaultOptions);

    let defaultOptions = {
        withToken: true,
        displayError: false
    };

    defaultOptions = {
        ...defaultOptions,
        ...options
    };

    _root.interceptors.request.use((config) => {
            if (defaultOptions.withToken) {
                const state = store.getState();
                const token = state?.user?.authToken ?? "";
                config.headers.Authorization = token ? `Bearer ${token}` : '';
            } else {
                const cookie = getCookie('csrftoken') ?? "";
                if (cookie) {
                    config.headers['X-CSRFToken'] = getCookie('csrftoken');
                }
            }
            if (defaultOptions.responseType) {
                config.responseType = defaultOptions.responseType;
            }
            return config;
        }
    );

    _root.interceptors.response.use(undefined, (error) => {
        // const retryApi = axios.create();
        // if (error.response.data?.errorCode === "AUTH3002") {
        //     const state = store.getState();
        //     const refresh_token = state?.user?.refreshToken;
        //     apiAuth.refreshToken(refresh_token, (err, res) => {
        //         if (res) {
        //             store.dispatch(userChange(res));
        //             retryApi(error.config);
        //         }
        //     })
        // }
        return Promise.reject(error);
    });
    return _root;
}
