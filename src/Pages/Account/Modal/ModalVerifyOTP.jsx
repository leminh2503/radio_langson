import React, {useEffect, useRef, useState}                                                   from 'react';
import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";

import apiUser           from "../../../Api/User/User";
import Notify            from "../../../Utils/Notify/Notify";
import {faSyncAlt}       from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const CountComponent = React.memo(({resendOtp}) => {
    const intervalCountNumber = useRef(null);

    const initTimer = useRef(30).current;

    const [count, setCount] = useState(initTimer);

    const [startCount, setStartCount] = useState(true);

    const handleReSendOtp = () => {
        setStartCount(true);
        setCount(initTimer);
        resendOtp(null, 'resend');
    };

    useEffect(() => {
        if (startCount) {
            intervalCountNumber.current = setInterval(() => {
                setCount(prev => prev - 1);
            }, 1000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startCount]);

    useEffect(() => {
        if (count === 0) {
            clearInterval(intervalCountNumber.current);
            setStartCount(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    return (
        <Button
            color={startCount ? 'secondary' : 'primary'}
            size="md"
            onClick={handleReSendOtp}
            disabled={startCount}
        >
            <FontAwesomeIcon icon={faSyncAlt} className="mr-2"/>
            <span>Gửi lại mã {startCount ? `(${count})` : ''}</span>
        </Button>
    );
});

const ModalVerifyOtp = React.memo(({isOpen, onClose, type, onChange}) => {
    const key = type === 'email' ? 'email' : 'phoneNumber';

    const initState = useRef({
        isLoading: false,
        hasOtp: false
    }).current;

    const inputString = useRef({
        email: '',
        phoneNumber: '',
        otp: ''
    });

    const [state, setState] = useState(initState);

    const onChangeInput = (key, e) => {
        inputString.current[key] = e.target.value;
    };

    const getOtp = (e, action) => {
        if (!action) {
            if (!inputString.current[key]) {
                return Notify.error(`${type.upperFirstCharacter()} không được để trống`);
            }
            setState(prev => ({...prev, isLoading: true}));
        }
        apiUser.editMe({
            [key]: inputString.current[key]
        }, (err, res) => {
            if (res) {
                setState(prev => ({...prev, isLoading: false, hasOtp: true}));
                if (action === 'resend') {
                    Notify.success(`Gửi lại OTP thành công`);
                }
                if (res?.otp) {
                    Notify.info(`Mã OTP là ${res.otp}`, {autoClose: 5000});
                }
            } else {
                setState(prev => ({...prev, isLoading: false}));
            }
        });
    };

    const verifyOtp = () => {
        if (!inputString.current.otp) {
            Notify.error('Mã xác thực OTP trống');
            return;
        }
        setState(prev => ({...prev, isLoading: true}));
        apiUser.verifyOtp({
            otp: inputString.current.otp,
            verifyType: key === 'email' ? 2 : 1
        }, (err, res) => {
            if (res) {
                onChange(key, res[key]);
                onClose();
                setState(prev => ({...prev, isLoading: false}));
                Notify.success(`Xác thực ${type} thành công`);
            } else {
                setState(prev => ({...prev, isLoading: false}));
            }
        });
    };

    React.useEffect(() => {
        if (isOpen) {
            inputString.current = {
                email: '',
                phoneNumber: '',
                otp: ''
            };
            setState(initState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <Modal toggle={onClose} isOpen={isOpen}>
            <ModalHeader toggle={onClose}>
                Xác thực {type}
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <div>
                        <Label className="text-bold-5">
                            {type.upperFirstCharacter()}:
                        </Label>
                        <Input
                            disabled={state.hasOtp}
                            placeholder={`Nhập ${type}`}
                            onChange={(e) => onChangeInput(key, e)}
                        />
                    </div>
                    {
                        state.hasOtp &&
                        <div className="mt-2">
                            <Label className="text-bold-5">
                                Mã xác thực OTP:
                            </Label>
                            <Input
                                placeholder="Nhập mã OTP"
                                onChange={(e) => onChangeInput('otp', e)}
                            />
                        </div>
                    }
                    {
                        state.hasOtp &&
                        <div className="mt-2">
                            <CountComponent
                                resendOtp={getOtp}
                            />
                        </div>
                    }
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={state.isLoading}
                    className="mr-1"
                    color="danger"
                    size="md"
                    onClick={onClose}
                >
                    Hủy
                </Button>
                <Button
                    disabled={state.isLoading}
                    color="primary"
                    size="md"
                    onClick={state.hasOtp ? verifyOtp : getOtp}
                >
                    Xác nhận
                    {
                        state.isLoading &&
                        <Spinner size="sm" className="ml-1"/>
                    }
                </Button>
            </ModalFooter>
        </Modal>
    );
});

export default ModalVerifyOtp;