import React, {useState}                                from "react";
import {Button, Form, FormGroup, Input, Label, Spinner} from "reactstrap";
import {useDispatch}                                    from "react-redux";
import {Link}                                           from "react-router-dom";

import {FontAwesomeIcon}   from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-regular-svg-icons";
import apiAuth             from '../../Api/Auth/Auth';
import {userChange}        from "../../Redux/Actions/userAction";

const SignIn = React.memo(() => {
    const dispatch = useDispatch();

    const [username, setUsername] = useState('');

    const [password, setPassword] = useState('');

    const [isCheckedUsername, setIsCheckedUsername] = useState(false);

    const [isCheckedPassword, setIsCheckedPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [isHidePassword, setIsHidePassword] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (username === '' && password === '') {
            setIsCheckedUsername(true);
            setIsCheckedPassword(true);
            return;
        }
        if (username === '') {
            setIsCheckedUsername(true);
            return;
        }
        if (password === '') {
            setIsCheckedPassword(true);
            return;
        }
        setIsLoading(true);
        apiAuth.login({username, password}, (err, result) => {
            if (result) {
                dispatch(userChange(result));
            } else {
                setIsLoading(false);
            }
        });
    };

    return (
        <div className="auth_sign-in d-flex justify-content-center align-items-center">
            <div>
                <Form className="sign-in_form">
                    <h3 className="font-weight-bold text-center mb-3">
                        Đăng nhập
                    </h3>
                    <FormGroup className="sign-in_form-group-size mb-0">
                        <Label>Tài khoản</Label>
                        <Input
                            className="sign-in_input"
                            type="email"
                            name="username"
                            id="exampleEmail"
                            placeholder="Tài khoản"
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setIsCheckedUsername(false);
                            }}
                        />
                        {
                            isCheckedUsername &&
                            <div className="sign-in_alert-auth">Không được để tài khoản trống!</div>
                        }
                    </FormGroup>
                    <FormGroup className="sign-in_form-group-size mb-0">
                        <Label>Mật khẩu</Label>
                        <div className="d-flex align-items-center justify-content-end">
                            <Input
                                className="sign-in_input"
                                type={isHidePassword ? "text" : "password"}
                                name="password"
                                placeholder="Mật khẩu"
                                id="examplePassword"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setIsCheckedPassword(false);
                                }}
                            />
                            <FontAwesomeIcon
                                className="sign-in_icon-show-password position-absolute"
                                icon={isHidePassword ? faEyeSlash : faEye}
                                onClick={() => setIsHidePassword(!isHidePassword)}
                            />
                        </div>
                        {
                            isCheckedPassword && <div className="sign-in_alert-auth">Không được để mật khẩu trống!</div>
                        }
                    </FormGroup>
                    <div className="d-flex flex-row-reverse">
                        <Link to="/auth/forgot-password">
                            <div className="sign-in_forgot-password mt-2">
                                Quên mật khẩu?
                            </div>
                        </Link>

                    </div>
                    <div className="d-flex justify-content-center mt-4">
                        <Button
                            className="sign-in_button"
                            type="submit"
                            color="primary"
                            disabled={isLoading}
                            onClick={handleSubmit}
                        >
                            {
                                isLoading ?
                                    <Spinner
                                        color="white"
                                        size="sm"
                                    />
                                    :
                                    "Đăng nhập"
                            }
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
});

export default SignIn;
