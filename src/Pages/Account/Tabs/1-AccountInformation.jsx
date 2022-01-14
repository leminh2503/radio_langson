import React, {useRef, useState}                         from 'react';
import {Button, Col, Divider, Image, Input, Row, Upload} from 'antd';
import {MenuOutlined}                                    from '@ant-design/icons';
import {useDispatch, useSelector}                        from "react-redux";
import {FontAwesomeIcon}                                 from "@fortawesome/react-fontawesome";
import {faEdit}                                          from "@fortawesome/free-regular-svg-icons";
import {faCheck, faTimes}                                from "@fortawesome/free-solid-svg-icons";

import {openSidebar}   from "../../../Redux/Actions/appActions";
import apiUser         from "../../../Api/User/User";
import defaultAvatar   from "../../../Assets/icon/logo-ptit.jpg";
import {userChange}    from "../../../Redux/Actions/userAction";
import useModalManager from "../../../Components/ModalManger/useModalManager";
import ModalVerifyOtp  from "../Modal/ModalVerifyOTP";

const AccountInformation = React.memo(() => {
    const user = useSelector(state => state.user);

    const dispatch = useDispatch();

    const typeModal = useRef('');

    const fullName = useRef('');

    const [state, setState] = useState({
        isLoading: true,
        isEditingFullName: false,
        isChangingFullName: false
    });

    const [visibleModal, , handleOpenModal, handleCloseModal] = useModalManager();

    React.useEffect(() => {
        apiUser.getMe((err, res) => {
            if (res) {
                dispatch(userChange());
                setState(prev => ({...prev, isLoading: false}));
            } else {
                setState(prev => ({...prev, isLoading: false}));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeAvatar = ({file}) => {
        if (file.status !== 'uploading') {
            apiUser.changeAvatar({file: file?.originFileObj}, (err, result) => {
                if (!err) {
                    dispatch(userChange(result));
                    setState(prev => ({
                        ...prev,
                        isLoading: false
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        isLoading: false
                    }));
                }
            });
        }
    };

    const handleBeforeOpenModal = (type) => {
        typeModal.current = type;
        handleOpenModal();
    };

    const handleVerifyEmailPhoneNumber = (key, value) => {
        dispatch(userChange({[key]: value}));
    };

    const onOpenChangeFullName = () => {
        fullName.current = user?.fullName;
        setState(prev => ({...prev, isEditingFullName: true}));
    };

    const onCloseChangeFullName = () => {
        setState(prev => ({...prev, isEditingFullName: false}));
    };

    const handleChangeFullName = () => {
        if (fullName.current === user?.fullName) {
            setState(prev => ({...prev, isEditingFullName: false}));
            return;
        }
        setState(prev => ({...prev, isChangingFullName: true}));
        apiUser.editMe({
            fullName: fullName.current
        }, (err, res) => {
            if (res) {
                dispatch(userChange(res));
                setState(prev => ({...prev, isEditingFullName: false, isChangingFullName: false}));
            } else {
                setState(prev => ({...prev, isChangingFullName: false}));
            }
        });
    };

    return (
        <div className="account_information_page">
            <div className="row-vertical-center border-bottom py-1 custom-button-menu">
                <MenuOutlined
                    className='icon-menu'
                    onClick={() => {
                        dispatch(openSidebar());
                    }}
                />
                <span className="ml-2 font-weight-bold">
                    Thông tin cá nhân
                </span>
            </div>
            <Row className="mt-2 general-info">
                <div className="display-avatar">
                    <div className="avatar-frame border">
                        <Upload
                            accept="image/png, image/jpeg"
                            onChange={onChangeAvatar}
                        >
                            <Image
                                width="150px"
                                height="150px"
                                alt=""
                                src={user?.avatar ? user.avatar : defaultAvatar}
                                preview={{visible: false, mask: 'Upload'}}
                            />
                        </Upload>
                    </div>
                </div>
                <div className="display-information">
                    <div className="row-vertical-center">
                        <span className="information-title">
                            Họ và tên:
                        </span>
                        <span className="information-display-name ml-2">
                        {
                            !state.isEditingFullName ?
                                <span className="row-vertical-center">
                                        <span>{user?.fullName}</span>
                                        <span
                                            className="btn-edit-info"
                                            onClick={onOpenChangeFullName}
                                        >
                                            <FontAwesomeIcon icon={faEdit}/>
                                        </span>
                                    </span>

                                :
                                <span className="row-vertical-center">
                                    <Input
                                        defaultValue={user?.fullName}
                                        onChange={e => fullName.current = e.target.value}
                                    />
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        color="green"
                                        className="hover-pointer ml-2"
                                        onClick={handleChangeFullName}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTimes}
                                        color="red"
                                        className="hover-pointer ml-2"
                                        onClick={onCloseChangeFullName}
                                    />
                                </span>
                        }
                        </span>
                    </div>
                    <div>
                        <span className="information-title">
                            Vị trí:
                        </span>
                        <span className="information-display-name ml-2">
                            {user?.role?.roleName}
                        </span>
                    </div>
                </div>
            </Row>
            <Divider>
                <span className="text-uppercase font-weight-bold">
                    Thông tin chi tiết
                </span>
            </Divider>
            <Row className="detail-information">
                <Row className="detail-information-child d-flex">
                    <Col span={12} className="font-weight-bold detail-text pr-3">
                        Tài khoản:
                    </Col>
                    <Col span={12}>
                        {user?.username}
                    </Col>
                </Row>
                <Row className="detail-information-child d-flex">
                    <Col span={12} className="font-weight-bold detail-text pr-3">
                        Email:
                    </Col>
                    <Col span={12} className="row-vertical-center">
                        {
                            user?.email ?
                                user.email
                                :
                                <Button onClick={() => handleBeforeOpenModal('email')}>
                                    Cập nhật
                                </Button>
                        }
                        {
                            user?.email &&
                            <div
                                className="btn-edit-info"
                                onClick={() => handleBeforeOpenModal('email')}
                            >
                                <FontAwesomeIcon icon={faEdit}/>
                            </div>
                        }
                    </Col>
                </Row>
                <Row className="detail-information-child d-flex">
                    <Col span={12} className="font-weight-bold detail-text pr-3">
                        Khu vực:
                    </Col>
                    <Col span={12}>
                        <div>
                            {
                                user?.administrativeCode?.pathWithType ?
                                    user?.administrativeCode.pathWithType
                                    :
                                    "Chưa cập nhật"
                            }
                        </div>
                    </Col>
                </Row>
                <Row className="detail-information-child d-flex">
                    <Col span={12} className="font-weight-bold detail-text pr-3">
                        Số điện thoại:
                    </Col>
                    <Col span={12}>
                        <div className="row-vertical-center">
                            {
                                user?.phoneNumber ?
                                    user.phoneNumber
                                    :
                                    <Button onClick={() => handleBeforeOpenModal('số điện thoại')}>
                                        Cập nhật
                                    </Button>
                            }
                            {
                                user?.phoneNumber &&
                                <div
                                    className="btn-edit-info"
                                    onClick={() => handleBeforeOpenModal('số điện thoại')}
                                >
                                    <FontAwesomeIcon icon={faEdit}/>
                                </div>
                            }
                        </div>
                    </Col>
                </Row>
            </Row>
            <ModalVerifyOtp
                isOpen={visibleModal}
                onClose={handleCloseModal}
                type={typeModal.current}
                onChange={handleVerifyEmailPhoneNumber}
            />
        </div>
    );
});

export default AccountInformation;
