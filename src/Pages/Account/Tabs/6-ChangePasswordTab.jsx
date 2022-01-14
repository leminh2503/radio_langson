import React, {useCallback, useState} from "react";
import {Button, Input, Spinner}       from "reactstrap";
import {useDispatch}                  from "react-redux";
import {MenuOutlined}                 from "@ant-design/icons";

import Notify        from "../../../Utils/Notify/Notify";
import apiAccount    from "../../../Api/User/User";
import {userClear}   from "../../../Redux/Actions/userAction";
import {openSidebar} from "../../../Redux/Actions/appActions";


const ChangePasswordTab = React.memo(() => {
    const [currentPassword, setCurrentPassword] = useState('');

    const [newPassword, setNewPassword] = useState('');

    const [retypeNewPassword, setRetypeNewPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    // const app = useSelector(state => state.app);

    /*  handle change password  */
    const handleChangePassword = useCallback(() => {
        if (isLoading) {
            return;
        }
        if (!currentPassword) {
            return Notify.error("Mật khẩu hiện tại không được để trống");
        }
        if (!newPassword) {
            return Notify.error("Mật khẩu mới không được để trống");
        }
        if (!retypeNewPassword) {
            return Notify.error("Nhập lại mật khẩu Không được để trống");
        }
        if (currentPassword.length < 6 || currentPassword.length > 30) {
            return Notify.error("Độ dài mật khẩu hiện tại phải lớn hơn 6 và nhỏ hơn 30 ký tự");
        }
        if (newPassword.length < 6 || newPassword.length > 30) {
            return Notify.error("Độ dài mật khẩu mới phải lớn hơn 6 và nhỏ hơn 30 ký tự");
        }
        if (newPassword !== retypeNewPassword) {
            Notify.error("Mật khẩu mới và nhập lại mật khẩu không khớp");
            return;
        }
        apiAccount.changePassword({
            current_password: currentPassword,
            new_password: newPassword
        }, (error, result) => {
            if (result === "") {
                setIsLoading(false);
                Notify.success("Đổi mật khẩu thành công");
                setTimeout(() => {
                    dispatch(userClear());
                }, 1000);
            } else {
                setIsLoading(false);
            }
        });

    }, [isLoading, currentPassword, newPassword, retypeNewPassword, dispatch]);
    /*-----------------------------------------*/

    return (
        <div className="change-password-tab change-password_animate_slide-in-fade-in">
            <div className="row-vertical-center border-bottom py-1 custom-button-menu">
                <MenuOutlined
                    className="icon-menu"
                    onClick={() => {
                        dispatch(openSidebar());
                    }}
                />
                <span className="ml-2 font-weight-bold">
                    Thay đổi mật khẩu
                </span>
            </div>
            <div className="align-items-center mt-2">
                <div className="mt-1">Mật khẩu hiện tại</div>
                <Input
                    className="input-change-password"
                    type="password"
                    placeholder="Mật khẩu hiện tại"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <div className="mt-1">Mật khẩu mới</div>
                <Input
                    className="input-change-password"
                    type="password"
                    placeholder="Mật khẩu mới"
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="mt-1">Nhập lại mật khẩu</div>
                <Input
                    className="input-change-password"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    onChange={(e) => setRetypeNewPassword(e.target.value)}
                />
                <Button
                    className="mt-2"
                    color="primary"
                    onClick={handleChangePassword}
                >
                    {
                        isLoading
                            ?
                            <Spinner size="sm"/>
                            :
                            "Đổi mật khẩu"
                    }
                </Button>
            </div>
        </div>
    );
});

export default ChangePasswordTab;
