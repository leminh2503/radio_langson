import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Button,
    Col,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
}                                                    from "reactstrap";

import Notify                                                           from "../../../Utils/Notify/Notify";
import apiUser                                                          from "../../../Api/User/User";
import Alert                                                            from "../../../Utils/Notify/Alert";
import apiRole                                                          from "../../../Api/Role/Role";
import {listInputModalAccount as _listInput, listRoleForAdministrative} from "../Etc/Etc";
import CustomInput                                                      from "./CustomInput";
import SelectAddressComponent                                           from "./SelectAddress";

const ModalAccount = React.memo(({isOpen, onClose, onChange, typeModal, dataEdit}) => {
    const _requiredFields = React.useRef([
        {label: "Tài khoản", key: 'username'},
        {label: "Tên đầy đủ", key: 'fullName'},
        {label: "Email", key: 'email'},
        {label: "Số điện thoại", key: 'phoneNumber'}
    ]).current;

    const currentCode = useRef({
        province: '',
        district: '',
        wards: '',
        village: ''
    });

    const initData = useRef({
        username: "",
        password: "",
        fullName: "",
        role: ""
    }).current;

    const [data, setData] = useState(initData);

    const [isResetting, setIsResetting] = useState(false);

    const [isEditedInfo, setIsEditedInfo] = useState(false);

    const [listRole, setListRole] = useState([]);

    const [isEditing, setIsEditing] = useState(false);

    const [selectedTypeNameAd, setSelectedTypeNameAd] = useState('province');

    const checkCurrentCode = () => {
        const administrativeCode = currentCode.current;
        if (administrativeCode?.village) {
            return administrativeCode.village;
        }
        if (administrativeCode?.wards) {
            return administrativeCode.wards;
        }
        if (administrativeCode?.district) {
            return administrativeCode.district;
        }
        if (administrativeCode?.province) {
            return administrativeCode.province;
        }
    };

    const handleChange = () => {
        if (!isEditedInfo && typeModal === 'edit') {
            onClose();
            return;
        }
        for (let i = 0; i < _requiredFields.length; i++) {
            if (data[_requiredFields[i].key] === '' || !data[_requiredFields[i].key]) {
                return Notify.error(`${_requiredFields[i].label} không được để trống`);
            }
            if (_listInput[i].typeValid === 'lte') {
                if (data[_listInput[i].keyValue].length > _listInput[i].conditionValid) {
                    return Notify.error(`${_listInput[i].label} ${_listInput[i].messageValid}`);
                }
            } else {
                if (data[_listInput[i].keyValue]?.length < _listInput[i].conditionValid) {
                    return Notify.error(`${_listInput[i].label} ${_listInput[i].messageValid}`);
                }
            }
        }
        if (!data.role) {
            return Notify.error("Vui lòng lựa chọn lại vị trí công việc");
        }
        setIsEditing(true);
        const administrativeCode = checkCurrentCode();
        onChange(data, setIsEditing, administrativeCode);
    };

    /*  check button   */
    const checkSubmit = () => {
        if (typeModal === "new") {
            return "Tạo mới";
        }
        return "Lưu";
    };
    /*-----------------------------------------*/

    const handleResetPassword = () => {
        Alert.confirm(`Xác nhân khôi phục mật khẩu cho tài khoản " ${dataEdit.username} " ?`, (check) => {
            if (check) {
                setIsResetting(true);
                apiUser.resetPassword({username: dataEdit.username}, (err) => {
                    if (!err) {
                        Notify.success("Khôi phục mật khẩu thành công");
                        setIsResetting(false);
                        onClose();
                    }
                });
            }
        });
    };

    useEffect(() => {
        if (isOpen) {
            if (typeModal === 'edit') {
                setData({
                    ...dataEdit,
                    role: dataEdit?.role?.id
                });
            } else {
                setData({
                    username: "",
                    password: "",
                    fullName: "",
                    role: listRole?.length > 0 ? listRole[0].id : ""
                    // email: "",
                    // phoneNumber: ""
                });
            }
        } else {
            currentCode.current = {
                province: '',
                district: '',
                wards: '',
                village: ''
            };
            setSelectedTypeNameAd('province');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, dataEdit, listRole]);

    useEffect(() => {
        if (isOpen && listRole?.length === 0) {
            apiRole.getAllRole((err, result) => {
                if (result) {
                    setListRole(result);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, listRole]);

    const listRoleFilter = useMemo(() => {
        setData(prev => ({
            ...prev,
            role: listRoleForAdministrative[selectedTypeNameAd][0]
        }));
        return listRole.filter(r => listRoleForAdministrative[selectedTypeNameAd].includes(r.id));
    }, [listRole, selectedTypeNameAd]);

    return (
        <Modal isOpen={isOpen} toggle={onClose}>
            <ModalHeader toggle={onClose}>
                {typeModal === 'new' ? "Tạo tài khoản" : 'Sửa thông tin tài khoản'}
            </ModalHeader>
            <ModalBody>
                {
                    typeModal === 'edit' &&
                    <div className="d-flex justify-content-between my-1">
                        <Button
                            color="primary"
                            onClick={handleResetPassword}
                            disabled={isResetting}
                        >
                            Khôi phục mật khẩu
                        </Button>
                    </div>
                }
                <Row>
                    {
                        _listInput.map(({
                                            label,
                                            type,
                                            size,
                                            keyValue,
                                            options,
                                            disabled,
                                            required,
                                            keyName,
                                            visible,
                                            requiredValid,
                                            typeValid,
                                            conditionValid,
                                            messageValid,
                                            placeholder
                                        }, index) => (
                            <CustomInput
                                key={index}
                                label={label}
                                type={type}
                                keyValue={keyValue}
                                value={data[keyValue]}
                                disabled={typeModal === 'edit' && disabled}
                                required={typeModal === 'new' && required}
                                typeModal={typeModal}
                                visible={visible}
                                requiredValid={requiredValid}
                                typeValid={typeValid}
                                conditionValid={conditionValid}
                                messageValid={messageValid}
                                placeholder={placeholder}
                                onChange={(value) => {
                                    if (!isEditedInfo) {
                                        setIsEditedInfo(true);
                                    }
                                    setData(prev => ({
                                        ...prev,
                                        [keyValue]: value
                                    }));
                                }}
                            />
                        ))
                    }
                    {
                        typeModal === 'new' &&
                        <SelectAddressComponent
                            currentCode={currentCode}
                            setSelectedTypeNameAd={setSelectedTypeNameAd}
                        />
                    }
                    {
                        (typeModal === 'new' || (typeModal === 'edit' && dataEdit?.administrativeCode?.division === 1)) &&
                        <Col md={12}>
                            <FormGroup>
                                <Label for="role" className="account_required">
                                    Vị trí công việc
                                </Label>
                                <Input
                                    type="select"
                                    value={data.role}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setData(prev => ({...prev, role: value}));
                                        if (!isEditedInfo) {
                                            setIsEditedInfo(true);
                                        }
                                    }}
                                >
                                    {
                                        listRoleFilter.map(({roleName, id}, index) => (
                                            <option
                                                value={id}
                                                key={index}
                                            >
                                                {roleName}
                                            </option>
                                        ))
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                    }
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button
                    className="mr-1"
                    color="danger"
                    size="md"
                    onClick={onClose}
                    disabled={isEditing}
                >
                    Hủy
                </Button>
                <Button
                    disabled={isEditing}
                    color="primary"
                    size="md"
                    onClick={handleChange}
                >
                    {checkSubmit()}
                    {
                        isEditing &&
                        <Spinner size="sm" className="ml-1"/>
                    }
                </Button>
            </ModalFooter>
        </Modal>
    );
});

ModalAccount.defaultProps = {
    typeModal: 'new',
    dataEdit: {
        username: "",
        password: "",
        fullName: "",
        role: "",
        // email: "",
        // phoneNumber: "",
        accountStatusId: "1"
    }
};

export default ModalAccount;
