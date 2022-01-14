import React, {useState}                                from "react";
import {Button, Form, FormGroup, Input, Label, Spinner} from "reactstrap";
import {Link, Redirect}                                 from "react-router-dom";
import {faEye, faEyeSlash}                              from "@fortawesome/free-regular-svg-icons";
import {faArrowLeft}                                    from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon}                                from "@fortawesome/react-fontawesome";
import propTypes                                        from "prop-types";
import apiUser                                          from "../../Api/User/User";
import Notify                                           from "../../Utils/Notify/Notify";

const ResetPassword = React.memo(({username, setIsShowResetPasswordTab, otpCode, recovery_type}) => {
    const [password, setPassword] = useState('');

    const [retypePassword, setRetypePassword] = useState('');

    const [otp, setOtp] = useState(otpCode);

    const [isHidePassword, setIsHidePassword] = useState(false);

    const [isHideRetypePassword, setIsHideRetypePassword] = useState(false);

    const [isResetting, setIsResetting] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = (event) => {
        event.preventDefault();
        if (password === '') {
            return Notify.error("Mật khẩu không được để trống");
        }
        if (retypePassword === '') {
            return Notify.error("Nhập lại mật khẩu không được để trống");
        }
        if (password.length < 6 || password.length > 30) {
            return Notify.error("Độ dài mật khẩu mới phải lớn hơn 6 và nhỏ hơn 30 ký tự");
        }
        if (String(password) !== String(retypePassword)) {
            return Notify.error("Mật khẩu mới và Nhập lại mật khẩu không trùng khớp");
        }
        if (otpCode === '') {
            return Notify.error("OTP code không được để trống");
        }
        setIsResetting(true);
        apiUser.changePasswordFromRecovery({
            email_or_phone_number: username,
            password,
            otp,
            recovery_type
        }, (err, result) => {
            if (result) {
                setTimeout(() => {
                    setIsSuccess(true);
                }, 1500);
                Notify.success("Đặt lại mật khẩu thành công, vui lòng đợi trong giây lát");
            } else {
                setIsResetting(false);
            }
        });
    };

    return (
        <div className="forgot-password_form p-5">
            {isSuccess ? <Redirect to="/"/> : null}
            <Button
                color="link"
                className="position-absolute"
                onClick={() => setIsShowResetPasswordTab(false)}
            >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-1"/>
            </Button>
            <h3 className="font-weight-bold text-center mb-3">
                Quên mật khẩu
            </h3>
            <FormGroup>
                <Label for="exampleNewPassword">Mật khẩu mới</Label>
                <div className="d-flex align-items-center justify-content-end">
                    <Input
                        autoFocus
                        className="forgot-password_input"
                        type={isHidePassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Mật khẩu mới"
                        id="exampleNewPassword"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FontAwesomeIcon
                        className="forgot-password_icon-show-password position-absolute"
                        icon={isHidePassword ? faEyeSlash : faEye}
                        onClick={() => setIsHidePassword(!isHidePassword)}
                    />
                </div>
            </FormGroup>
            <FormGroup>
                <Label for="exampleRetypeNewPassword">Nhập lại mật khẩu mới</Label>
                <div className="d-flex align-items-center justify-content-end">
                    <Input
                        className="forgot-password_input"
                        type={isHideRetypePassword ? "text" : "password"}
                        name="retypeNewPassword"
                        id="exampleRetypeNewPassword"
                        placeholder="Nhập lại mật khẩu"
                        onChange={(e) => setRetypePassword(e.target.value)}
                    />
                    <FontAwesomeIcon
                        className="forgot-password_icon-show-password position-absolute"
                        icon={isHideRetypePassword ? faEyeSlash : faEye}
                        onClick={() => setIsHideRetypePassword(!isHideRetypePassword)}
                    />
                </div>
            </FormGroup>
            <FormGroup>
                <Label for="optCode">OTP code</Label>
                <div className="d-flex align-items-center justify-content-end">
                    <Input
                        defaultValue={otp}
                        className="forgot-password_input"
                        type="text"
                        name="otp"
                        placeholder="Mã OTP"
                        id="optCode"
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
            </FormGroup>
            <div className="d-flex justify-content-center mt-4">
                <Button
                    className="forgot-password_change-button"
                    type="submit"
                    color="primary"
                    disabled={isResetting}
                    onClick={handleResetPassword}
                >
                    {
                        isResetting ?
                            <Spinner
                                color="white"
                                size="sm"
                            />
                            :
                            "Đặt lại mật khẩu"
                    }
                </Button>
            </div>
        </div>
    );
});
ResetPassword.propTypes = {
    username: propTypes.string.isRequired,
    setIsShowResetPasswordTab: propTypes.func.isRequired,
    otpCode: propTypes.string.isRequired
};

const ForgotPassword = React.memo(() => {
    const [username, setUsername] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [isShowResetPasswordTab, setIsShowResetPasswordTab] = useState(false);

    const [otpCode, setOTPCode] = useState(null);

    const handleSubmitForm = (event) => {
        event.preventDefault();
        if (username === '') {
            Notify.error("Email không được để trống");
            return;
        }
        setIsLoading(true);
        apiUser.passwordRecovery({
            email_or_phone_number: username,
            recovery_type: username.includes("@") ? 2 : 1
        }, (err, result) => {
            if (result) {
                Notify.success("OTP của bạn là: " + result.otp);
                setOTPCode(result.otp);
                setIsShowResetPasswordTab(true);
            }
            setIsLoading(false);
        });
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSubmitForm(e);
        }
    };

    return (
        <div className="auth_forgot-password d-flex justify-content-center align-items-center">
            {!isShowResetPasswordTab
                ?
                <Form className="forgot-password_form p-5" onKeyDown={onKeyDown}>
                    <Link to="/">
                        <Button color="link" className="position-absolute">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-1"/>
                        </Button>
                    </Link>
                    <h3 className="font-weight-bold text-center mb-3">
                        Quên mật khẩu
                    </h3>
                    <FormGroup className="mt-2">
                        <Input
                            autoFocus
                            className="forgot-password_input"
                            type="string"
                            name="username"
                            id="exampleEmail"
                            placeholder="Nhập Email"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </FormGroup>
                    <div className="d-flex justify-content-center mt-4">
                        <Button
                            className="forgot-password_change-button"
                            color="primary"
                            disabled={isLoading}
                            onClick={handleSubmitForm}
                        >
                            {
                                isLoading ?
                                    <Spinner
                                        color="white"
                                        size="sm"
                                    />
                                    :
                                    "Xác nhận"
                            }
                        </Button>
                    </div>
                </Form>
                :
                <ResetPassword
                    username={username}
                    setIsShowResetPasswordTab={setIsShowResetPasswordTab}
                    otpCode={otpCode}
                    recovery_type={username.includes("@") ? 2 : 1}
                />
            }
        </div>
    );
});

export default ForgotPassword;
