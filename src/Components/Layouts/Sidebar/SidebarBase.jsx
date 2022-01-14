import React                      from 'react';
import {useDispatch, useSelector} from "react-redux";
import propTypes                  from "prop-types";

import {closeSidebar} from "../../../Redux/Actions/appActions";

const SidebarBase = (props) => {
    const {children, moreCondition} = props;

    const app = useSelector(state => state.app);

    const dispatch = useDispatch();

    return (
        app.isOpenSidebar && moreCondition &&
        <div className="sidebar_base">
            <div
                className={`overlay d-block ${app.isOpenSidebar ? "show hover-pointer" : ""}`}
                onClick={() => dispatch(closeSidebar())}
            />
            {children}
        </div>
    );
};

SidebarBase.defaultProps = {
    moreCondition: true
};

SidebarBase.propTypes = {
    moreCondition: propTypes.bool,
    children: propTypes.any.isRequired
};

export default SidebarBase;