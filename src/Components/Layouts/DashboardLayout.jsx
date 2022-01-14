import React                      from 'react';
import propTypes                  from "prop-types";
import {useDispatch, useSelector} from "react-redux";

import Navbar                                                 from "./Navbar/Navbar";
import Main                                                   from "./Main/Main";
import Content                                                from "./Content/Content";
import {closeSidebar, openContent, openSidebar, togglePlayer} from "../../Redux/Actions/appActions";

const DashboardLayout = React.memo(({children}) => {
    const app = useSelector(state => state.app);

    const dispatch = useDispatch();

    const handleWindowLT768 = () => {
        dispatch(closeSidebar());
        dispatch(openContent());
    };

    const handleWindowGT768 = () => {
        dispatch(openSidebar());
    };

    const handleClosePlayer = () => {
        if (app.isOpenPlayerView) {
            dispatch(togglePlayer());
        }
    };

    React.useEffect(() => {
        function toggleSidebar() {
            if (window.innerWidth <= 768) {
                handleWindowLT768();
            } else {
                handleWindowGT768();
            }
        }

        if (window.innerWidth <= 768) {
            handleWindowLT768();
        } else {
            handleWindowGT768();
        }

        window.addEventListener('resize', toggleSidebar);

        return () => window.removeEventListener('resize', toggleSidebar);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window]);

    return (
        <div className="wrapper" onClick={handleClosePlayer}>
            <Main>
                <Navbar/>
                <Content>
                    {children}
                </Content>
            </Main>
        </div>
    );
});

DashboardLayout.propTypes = {
    children: propTypes.any.isRequired
};

export default DashboardLayout;
