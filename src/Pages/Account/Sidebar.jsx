import React, {useRef} from "react";
import {Button}        from "reactstrap";
import {
    useDispatch,
    useSelector
}                      from "react-redux";
import {
    ApartmentOutlined,
    HistoryOutlined,
    KeyOutlined,
    SettingOutlined,
    UsergroupAddOutlined,
    UserOutlined,
}                      from "@ant-design/icons";

import {userClear}        from "../../Redux/Actions/userAction";
import {appClear}         from "../../Redux/Actions/appActions";
import Alert              from "../../Utils/Notify/Alert";
import {allRole}          from "../../Config/role";
import apiUser            from "../../Api/User/User";
import {notifyClear}      from "../../Redux/Actions/notifyAction";
import {clearFirebaseApp} from "../../Service/FirebaseService";

const Sidebar = React.memo(({isOpenPage, setIsOpenPage}) => {
    const dispatch = useDispatch();

    const user = useSelector(state => state.user);

    const _itemsSidebar = useRef([
        {
            tab: 'info',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined className="mr-2"/>,
            visible: true,
            onClick: () => setIsOpenPage("info")
        },
        {
            tab: 'user_management',
            label: 'Quản lý người dùng',
            icon: <UsergroupAddOutlined className="mr-2"/>,
            visible: user?.role?.id === allRole.system,
            onClick: () => setIsOpenPage("user_management")
        },
        {
            tab: 'history',
            label: 'Lịch sử hoạt động',
            icon: <HistoryOutlined className="mr-2"/>,
            visible: true,
            onClick: () => setIsOpenPage("history")
        },
        {
            tab: 'config',
            label: 'Cấu hình',
            icon: <SettingOutlined className="mr-2"/>,
            visible: user?.role?.id === allRole.system,
            onClick: () => setIsOpenPage("config")
        },
        {
            tab: 'administrative',
            label: 'Địa phương',
            icon: <ApartmentOutlined className="mr-2"/>,
            visible: user?.role?.id === allRole.system,
            onClick: () => setIsOpenPage("administrative")
        },
        {
            tab: 'change_password',
            label: 'Thay Đổi mật khẩu',
            icon: <KeyOutlined className="mr-2"/>,
            visible: true,
            onClick: () => setIsOpenPage("change_password")
        }
    ]).current;

    const logout = () => {
        Alert.confirm('Xác nhận đăng xuất ?', async (check) => {
            if (check) {
                setTimeout(() => {
                    clearFirebaseApp();
                    dispatch(userClear());
                    dispatch(appClear());
                    dispatch(notifyClear());
                    localStorage.clear();
                }, 10);
                await apiUser.logout();
            }
        });
    };

    return (
        <div className="account-management_sidebar row-vertical-center flex-column border-right">
            <div className="w-100">
                {
                    _itemsSidebar.map(({tab, label, icon, onClick, visible}, i) => (
                        visible &&
                        <div
                            key={i}
                            className={(isOpenPage === tab ? "change-color " : "") + "account-management_tab text-uppercase text-bold-5"}
                            onClick={onClick}
                        >
                            {icon} {label}
                        </div>
                    ))
                }
                <div className="custom-button">
                    <Button
                        outline
                        color="primary"
                        onClick={logout}
                    >
                        Đăng xuất
                    </Button>
                </div>

            </div>
        </div>
    );
});

export default Sidebar;
