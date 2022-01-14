import React                  from 'react';
import {ConfigProvider}       from 'antd';
import {Flip, ToastContainer} from "react-toastify";
import {Provider}             from "react-redux";
import locale                 from 'antd/lib/locale/vi_VN';
import {PersistGate}          from "redux-persist/integration/react";

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/antd.css';
import './Assets/scss/_app.scss';
import 'react-h5-audio-player/lib/styles.css';
import 'leaflet/dist/leaflet.css';

import 'moment/locale/vi';

import Routes             from "./Routes/Routes";
import {persistor, store} from "./Redux/Store";
import Player             from "./Components/Player/Player";
import withClearCache     from "./ClearCache";

const ClearCacheComponent = withClearCache(() => null);

const App = () => {
    // Disable right click
    // window.oncontextmenu = () => {
    //     return false;
    // };

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ClearCacheComponent/>
                <ToastContainer
                    containerId="notify"
                    limit={5}
                    transition={Flip}
                />
                <ConfigProvider locale={locale}>
                    <Player/>
                    <Routes/>
                </ConfigProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
