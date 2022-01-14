import React                      from "react";
import {FontAwesomeIcon}          from '@fortawesome/react-fontawesome';
import {useDispatch, useSelector} from "react-redux";
import {faBars}                   from "@fortawesome/free-solid-svg-icons";
import {openSidebar}              from "../../Redux/Actions/appActions";
import {allRole}                  from "../../Config/role";

const ActionBar = React.memo(({listItem = [], className = ""}) => {
    const dispatch = useDispatch();

    const user = useSelector(state => state.user);

    const defaultListItem = [
        {
            title: '',
            icon: faBars,
            color: 'darkolivegreen',
            className: 'sidebar-icon',
            visible: window.location.pathname !== 'equipment-management' && allRole.system === user?.role?.id,
            onClick: () => dispatch(openSidebar())
        }
    ];

    return (
        <div className={`action-bar border ${className}`}>
            {
                defaultListItem.concat(listItem).map(({
                                                          title,
                                                          key,
                                                          icon,
                                                          color,
                                                          visible = true,
                                                          onClick,
                                                          className
                                                      }, index) => (
                    visible &&
                    <div
                        key={index}
                        role="presentation"
                        className={`row-all-center action-bar_item px-3 ${className === undefined ? '' : className}`}
                        onClick={onClick}
                    >
                        <FontAwesomeIcon icon={icon} color={color}/>
                        <div
                            key={index}
                            className="ml-2 action-bar-title"
                        >
                            {title}
                        </div>
                    </div>
                ))
            }
        </div>
    );
});

export default ActionBar;