import React, {useCallback, useEffect, useRef, useState}        from 'react';
import {NavLink, useHistory, useParams}                         from "react-router-dom";
import {FontAwesomeIcon}                                        from '@fortawesome/react-fontawesome';
import {faBell, faCircle, faLaptop, faTachometerAlt, faUserCog} from '@fortawesome/free-solid-svg-icons';
import {faCalendarAlt, faPlayCircle}                            from '@fortawesome/free-regular-svg-icons';
import propTypes                                                from "prop-types";
import {useDispatch, useSelector}                               from "react-redux";
import {Badge, Button, Col, Dropdown, Menu, Row, Spin}          from "antd";
import {CheckCircleOutlined, LikeOutlined}                      from "@ant-design/icons";

import logo                        from "../../../Assets/icon/logo-ptit.jpg";
import apiNotify                   from "../../../Api/Notify/Notify";
import {notifyChange, notifyClear} from "../../../Redux/Actions/notifyAction";
import {checkIsBottomScrollDown}   from "../../../Utils";

const _navBarItem = [
    {
        title: 'Bảng điều khiển',
        link: '/dashboard',
        icon: faTachometerAlt
    },
    {
        title: 'Quản lý thiết bị',
        link: '/equipment-management',
        icon: faLaptop
    },
    {
        title: 'Quản lý lịch phát',
        link: '/broadcast-calendar',
        icon: faCalendarAlt
    },
    {
        title: 'Quản lý nội dung',
        link: '/content-management',
        icon: faPlayCircle
    },
    {
        title: 'Quản lý chung',
        link: '/account',
        icon: faUserCog
    }
];

const ButtonComponent = React.memo(({disabled, setNotifications}) => {
    const dispatch = useDispatch();

    const intervalCountNumber = useRef(null);

    const initTimer = useRef(30).current;

    const [count, setCount] = useState(initTimer);

    const [isClicked, setIsClicked] = useState(false);

    const handleSetAllAsRead = () => {
        setIsClicked(true);

        apiNotify.setAllAsRead((err) => {
            if (!err) {
                setNotifications(prev => {
                    const cpPrev = JSON.parse(JSON.stringify(prev));
                    cpPrev.data.map(x => {
                        if (!x.read) x.read = 1;
                        return x;
                    });
                    console.log(cpPrev);
                    return cpPrev;
                });
                dispatch(notifyClear());
            }
        });
    };

    useEffect(() => {
        if (isClicked) {
            intervalCountNumber.current = setInterval(() => {
                setCount(prev => {
                    const copyPrev = JSON.parse(JSON.stringify(prev));
                    return copyPrev - 1;
                });
            }, 1000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isClicked]);

    useEffect(() => {
        if (count === 0) {
            clearInterval(intervalCountNumber.current);
            setIsClicked(false);
            setCount(initTimer);

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    return (
        <>
            <Button
                className="w-100 row-all-center border-0"
                onClick={handleSetAllAsRead}
                disabled={isClicked || disabled}
            >
                <CheckCircleOutlined/>
                <span>Đánh dấu đọc tất cả thông báo</span>
                {isClicked && <span className="ml-1">({count})</span>}
            </Button>
        </>
    );
});

const NavBarItem = React.memo(({tab, NotificationDropdown, handleGetNotifications}) => {
    const user = useSelector(state => state.user);

    const notify = useSelector(state => state.notify);

    const [isShowNotifications, setIsShowNotifications] = useState(false);

    const getClassName = useCallback((link) => {
        if (tab.includes(link) || (tab.includes("radio-program") && link === '/broadcast-calendar')) {
            return "navbar_link-color";
        }
        return "";
    }, [tab]);

    React.useEffect(() => {
        if (user?.administrativeCode?.division !== 1) return;

        function showNotifications() {
            if (window.innerWidth <= 900 && !isShowNotifications) {
                setIsShowNotifications(true);
            } else if (window.innerWidth > 900 && isShowNotifications) {
                setIsShowNotifications(false);
            }
        }

        showNotifications();
        window.addEventListener('resize', showNotifications);
        return () => window.removeEventListener('resize', showNotifications);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window, isShowNotifications]);


    return (
        <div className="d-flex justify-content-center">
            {
                _navBarItem.map(({link, title, icon}, index) => (
                    <NavLink
                        key={index}
                        to={link}
                        className={`p-2 text-decoration-none navbar_link_size ${getClassName(link)}`}
                    >

                        <FontAwesomeIcon
                            icon={icon}
                            size="lg"
                            color="white"
                        />
                        {
                            <div className="mt-2 navbar-tabs_text">
                                {title}
                            </div>
                        }
                    </NavLink>
                ))
            }
            {
                isShowNotifications && user?.administrativeCode?.division === 1 &&
                <Dropdown
                    trigger="click"
                    overlay={NotificationDropdown}
                    onClick={handleGetNotifications}
                    arrow
                >
                    <div className="p-2 text-decoration-none notify-item">
                        <Badge
                            className="hover-pointer"
                            count={notify.unread}
                            showZero
                            size="small"
                        >
                            <FontAwesomeIcon
                                color="white"
                                icon={faBell}
                                size="lg"
                            />
                        </Badge>
                        <div className="mt-2 navbar-tabs_text">
                            Thông báo
                        </div>
                    </div>
                </Dropdown>
            }
        </div>
    );
});

NavBarItem.propTypes = {
    tab: propTypes.string.isRequired
};

const Navbar = React.memo(() => {
    const app = useSelector(state => state.app);

    const notify = useSelector(state => state.notify);

    const dispatch = useDispatch();

    const history = useHistory();

    const {id: idCalendar} = useParams();

    const [notifications, setNotifications] = useState({
        data: [],
        totalPage: 0,
        pageSize: 20,
        isLast: false,
        currentPage: 1,
        isLoading: true,
    });

    const [isVisible, setIsVisible] = useState(false);

    const handleGetNotifications = (action) => {
        if (isVisible && action === 'click') return;
        if (action === 'click') setNotifications(prev => ({...prev, data: [], isLast: false, currentPage: 1}));
        if (notifications.isLast) return;
        if (!notifications.isLoading) setNotifications(prev => ({...prev, isLoading: true}));
        apiNotify.listNotification({
            page: action === 'click' ? 1 : notifications.currentPage,
            page_size: notifications.pageSize
        }, (err, res, totalPage) => {
            if (res) {
                setNotifications(prev => ({
                    ...prev,
                    data: action === 'click' ? res : [...notifications.data, ...res],
                    isLast: res?.length < notifications.pageSize,
                    currentPage: action === 'click' ? 2 : res?.length < notifications.pageSize ? prev.currentPage : prev.currentPage + 1,
                    totalPage,
                    isLoading: false
                }));
            }
        });
    };

    const handleScrollToBottom = (e) => {
        if (checkIsBottomScrollDown(e.target) && !notifications.isLast && !notifications.isLoading) {
            handleGetNotifications('scroll');
        }
    };


    const NotificationDropdown = () => {
        const {data, isLoading} = notifications;

        const handleSetAsRead = (item) => {
            const idItem = item?.data?.broadcastCalendar?.id;
            const index = notifications?.data.indexOf(item);

            if (String(idItem) === String(idCalendar) || !idItem) return setIsVisible(false);

            setNotifications(prev => {
                const cpPrev = JSON.parse(JSON.stringify(prev));
                cpPrev.data[index].read = 1;
                return cpPrev;
            });

            if (!item?.read) {
                apiNotify.setAsRead(item, (err) => {
                    if (!err) {
                    apiNotify.countUnread((err, res) => {
                        if(res) {
                            dispatch(notifyChange(res.count));
                        }
                    })
                }
                });
            }

            if (String(idItem) !== String(idCalendar)) {
                setIsVisible(false);
                history.push(`/radio-program/${idItem}`);
            }
        };

        return (
            <Menu
                className="notification-menu"
                onScroll={handleScrollToBottom}
            >
                <ButtonComponent
                    disabled={notifications.isLoading}
                    setNotifications={setNotifications}
                />
                {
                    data.length === 0 && !isLoading &&
                    <Menu.Item className="row-horizontal-center">
                        <LikeOutlined/>
                        Không có thông báo mới
                    </Menu.Item>
                }
                {
                    data.length > 0 &&
                    data.map((item, i) => (
                        <Menu.Item
                            key={i}
                            className={`border-bottom ${item.read ? '' : 'unread-item-bg'} m-1`}
                            onClick={handleSetAsRead.bind(this, item)}
                        >
                            {
                                item.read ? null
                                    :
                                    <FontAwesomeIcon
                                        color="cyan"
                                        icon={faCircle}
                                        style={{fontSize: "9px"}}
                                    />
                            }
                            <span className={`${item.read ? 'read-item_ml' : ''}`}>{item.message}</span>
                        </Menu.Item>
                    ))
                }
                {
                    isLoading &&
                    <Menu.Item className="row-horizontal-center mt-1">
                        <Spin/>
                    </Menu.Item>
                }
            </Menu>
        );
    };

    const handleVisibleChange = (flag) => {
        setIsVisible(flag);
        if (!flag) {
            setNotifications(prev => ({...prev, currentPage: 1}));
        }
    };

    return (
        <div className="navbar p-0">
            <Row className={`w-100 ${app.isOpenSidebar ? '' : 'row-horizontal-center'}`}>
                {
                    app.isOpenSidebar &&
                    <Col span="3" className="d-flex align-items-center pl-2 navbar-icon">
                        <img
                            width={60}
                            height={60}
                            className="d-flex"
                            alt=""
                            src={logo}
                        />
                    </Col>
                }
                <Col span="18" className="text-center navbar-tabs">
                    <NavBarItem
                        tab={window.location.pathname}
                        NotificationDropdown={NotificationDropdown}
                        handleGetNotifications={handleGetNotifications}
                    />
                </Col>
                {
                    app.isOpenSidebar &&
                    <Col
                        span="3"
                        className="d-flex justify-content-end align-items-center text-white pr-2 navbar-notify"
                    >
                        <Dropdown
                            trigger="click"
                            overlay={NotificationDropdown}
                            onClick={handleGetNotifications.bind(this, 'click')}
                            visible={isVisible}
                            onVisibleChange={handleVisibleChange}
                        >
                            <Badge
                                className="mr-4 hover-pointer"
                                count={notify.unread}
                                showZero
                            >
                                <FontAwesomeIcon
                                    color="white"
                                    icon={faBell}
                                    size="2x"
                                    onClick={() => setIsVisible(!isVisible)}
                                />
                            </Badge>
                        </Dropdown>
                    </Col>
                }
            </Row>
        </div>
    );
});

export default Navbar;
