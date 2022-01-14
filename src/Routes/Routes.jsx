import React, {useRef} from "react";

import {shallowEqual, useDispatch, useSelector}           from "react-redux";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import {auth as authRoutes, dashboard as dashboardRoutes} from "./index";

import DashboardLayout                     from "../Components/Layouts/DashboardLayout";
import AuthLayout                          from "../Components/Layouts/AuthLayout";
import {clearFirebaseApp, FirebaseService} from "../Service/FirebaseService";
import {userChange, userClear}             from "../Redux/Actions/userAction";
import apiAuth                             from "../Api/Auth/Auth";
import {appClear}                          from "../Redux/Actions/appActions";
import {checkTokenExpiration}              from "../Service/CheckTokenService";

const childRoutes = (Layout, routes, rootPath = "") => {
    return (
        routes.map(({name, path, children, component: Component}, index) => (
            children
                ?
                childRoutes(Layout, children, rootPath + path)
                :
                <Route
                    key={index}
                    path={rootPath + path}
                    exact
                    render={props => (
                        <Layout>
                            <Component {...props} />
                        </Layout>
                    )}
                />
        ))
    );
};

const Routes = () => {
    const user = useSelector(state => state.user, shallowEqual);

    const _persist = useSelector(state => state._persist, shallowEqual);

    const dispatch = useDispatch();

    const isLogin = Boolean(user.authToken);

    const isComponentMounted = useRef(false);

    const interval = useRef(null);

    const timeInterval = useRef(5 * 1000).current;

    function setTokenFirebase() {
        FirebaseService().then();
    }

    const checkToken = (auth_token, refresh_token) => {
        const isExpirationToken = checkTokenExpiration(auth_token);
        if (!isExpirationToken || !refresh_token) return;
        if (interval.current !== null) clearInterval(interval.current);
        apiAuth.refreshToken({refresh_token}, (err, result) => {
            if (isComponentMounted.current) {
                if (result) {
                    dispatch(userChange(result));
                    setTokenFirebase();
                    interval.current = setInterval(() => {
                        checkToken(result?.authToken, result?.refresh_token);
                    }, timeInterval);
                } else {
                    dispatch(userClear());
                    dispatch(appClear());
                    window.location.reload();
                }
            }
        });
    };

    React.useEffect(() => {
        isComponentMounted.current = true;
        const refresh_token = user?.refreshToken ?? "";
        const auth_token = user?.authToken ?? "";
        if (isLogin && auth_token) {
            const isExpirationToken = checkTokenExpiration(auth_token);
            if (isExpirationToken) {
                dispatch(userClear());
                dispatch(appClear());
                clearFirebaseApp().then();
                return;
            }
            setTokenFirebase();
            interval.current = setInterval(() => {
                checkToken(auth_token, refresh_token);
            }, timeInterval);
        }
        return () => {
            isComponentMounted.current = false;
            if (interval.current !== null) clearInterval(interval.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLogin]);

    if (!_persist.rehydrated) {
        return null;
    }

    return (
        <Router>
            <Switch>
                {
                    isLogin ?
                        childRoutes(DashboardLayout, dashboardRoutes)
                        :
                        childRoutes(AuthLayout, authRoutes)
                }
                <Route
                    render={() => <Redirect to={`${isLogin ? "/dashboard" : "/auth/sign-in"}`}/>}
                />
            </Switch>
        </Router>
    );
};

export default Routes;
