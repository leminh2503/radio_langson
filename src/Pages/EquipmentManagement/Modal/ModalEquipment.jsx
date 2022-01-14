import React, {useEffect, useState}                                                           from "react";
import propTypes                                                                              from "prop-types";
import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {Col, Row}                                                                             from "antd";
import Notify
                                                                                              from "../../../Utils/Notify/Notify";
import AlertValid
                                                                                              from "../../../Components/CustomTag/AlertValid";

const CustomInput = React.memo(({
                                    label,
                                    type,
                                    keyValue,
                                    value,
                                    options,
                                    required,
                                    onChange,
                                    visible,
                                    halfWidth = false,
                                    placeholder = ''
                                }) => {
    if (visible) return null;
    if (type === 'select') {
        return (
            <FormGroup>
                <Label
                    for={keyValue}
                    className={`text-bold-5${required ? ' equipment-management_required-item' : ''}`}
                >
                    {label}
                </Label>
                <Input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                >
                    {
                        options.map(({optionValue, title}, index) => (
                            <option
                                value={optionValue}
                                key={index}
                            >
                                {title}
                            </option>
                        ))
                    }
                </Input>
            </FormGroup>
        );
    }
    if (halfWidth) {
        return (
            <Col span={11} className="w-100">
                <FormGroup>
                    <Label
                        for={keyValue}
                        className={`text-bold-5${required ? ' equipment-management_required-item' : ''}`}
                    >
                        {label}
                    </Label>
                    <Input
                        placeholder={placeholder}
                        type={type}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                    />
                </FormGroup>
            </Col>
        );
    }
    return (
        <Col span={24}>
            <FormGroup>
                <Label
                    for={keyValue}
                    className={`text-bold-5${required ? ' equipment-management_required-item' : ''}`}
                >
                    {label}
                </Label>
                <Input
                    placeholder={placeholder}
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </FormGroup>
        </Col>
    );
});

CustomInput.defaultProps = {
    options: [],
    value: "",
    required: false
};

CustomInput.propTypes = {
    label: propTypes.string.isRequired,
    type: propTypes.string.isRequired,
    value: propTypes.any,
    options: propTypes.array,
    onChange: propTypes.func.isRequired,
    keyValue: propTypes.string.isRequired,
    required: propTypes.bool
};

const ModalEquipment = React.memo(({isOpen, onClose, onChange, typeModal, dataEdit, continueFetchDevice}) => {
    const requiredMacLength = 20;

    const _requiredFields = React.useRef([
        // {label: "Administrative Code", key: 'administrativeCode'},
        // {label: "Địa chỉ", key: 'address'},
        {label: "Mã thiết bị", key: 'mac'},
        {label: "Vĩ độ", key: 'longitude'},
        {label: "Kinh độ", key: 'latitude'},
        {label: "Thông tin chi tiết", key: 'description'}
    ]).current;

    const _listInput = React.useRef([
        {
            label: "Mã thiết bị",
            type: 'text',
            keyValue: "mac",
            required: true,
            placeholder: "Mã thiết bị"
        },
        {
            label: "Vĩ độ (Latitude)",
            type: 'number',
            keyValue: "latitude",
            required: true,
            halfWidth: true,
            placeholder: "Vĩ độ"
        },
        {
            label: "Kinh độ (Longitude)",
            type: 'number',
            keyValue: "longitude",
            required: true,
            halfWidth: true,
            placeholder: "Kinh độ"
        },
        {
            label: "Thông tin chi tiết",
            type: "text",
            keyValue: "description",
            required: true,
            placeholder: "Thông tin chi tiết"
        }
        // {label: "Administrative Code", type: 'text', keyValue: "administrativeCode", required: true},
        // {label: "Khu vực", type: 'text', keyValue: "administrative_code", required: true},
        // {
        //     label: "Trạng thái",
        //     type: 'select',
        //     keyValue: "status",
        //     options: [{optionValue: 1, title: "Hoạt động"}, {optionValue: 0, title: "Dừng hoạt động"}],
        //     visible: typeModal === 'new'
        // }
    ]).current;

    const initData = React.useRef({
        mac: null,
        // note: null,
        latitude: null,
        longitude: null,
        description: ''
    }).current;

    const [data, setData] = useState(initData);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (dataEdit) {
                setData({
                    mac: dataEdit?.mac,
                    status: dataEdit?.status,
                    latitude: dataEdit?.latitude ?? "",
                    longitude: dataEdit?.longitude ?? "",
                    description: dataEdit?.description ?? ""
                });
            } else {
                setData(initData);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, dataEdit]);

    const handleChange = () => {
        for (let i = 0; i < _requiredFields.length; i++) {
            if (!data[_requiredFields[i].key]) {
                Notify.error(`${_requiredFields[i].label} không được để trống`);
                return;
            }
        }
        if (data.mac?.length > requiredMacLength) {
            Notify.error(`Mã thiết bị vượt quá ${requiredMacLength} ký tự`);
            return;
        }
        setIsLoading(true);
        onChange(data, setIsLoading, continueFetchDevice);
    };

    const handleClose = () => {
        onClose();
        continueFetchDevice();
    };

    return (
        <Modal isOpen={isOpen} toggle={handleClose}>
            <ModalHeader toggle={onClose}>
                {typeModal === 'new' ? "Thêm" : 'Sửa thông tin'} thiết bị
            </ModalHeader>
            <ModalBody>
                <Row justify="space-between">
                    {
                        _listInput.map(({
                                            visible,
                                            label,
                                            type,
                                            keyValue,
                                            options,
                                            required,
                                            halfWidth,
                                            placeholder
                                        }, index) => (
                            <CustomInput
                                placeholder={placeholder}
                                visible={visible}
                                halfWidth={halfWidth}
                                key={index}
                                label={label}
                                type={type}
                                keyValue={keyValue}
                                options={options}
                                value={data[keyValue]}
                                required={required}
                                onChange={(value) => {
                                    setData(prev => ({
                                        ...prev,
                                        [keyValue]: keyValue === 'status' ? Number(value) : value
                                    }));
                                }}
                            />
                        ))
                    }
                    {
                        data.mac?.length > requiredMacLength &&
                        <AlertValid message={`Mã thiết bị không được vượt quá ${requiredMacLength} ký tự`}/>
                    }
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={isLoading}
                    className="mr-1"
                    color="danger"
                    size="md"
                    onClick={handleClose}
                >
                    Hủy
                </Button>
                <Button
                    disabled={isLoading}
                    color="primary"
                    size="md"
                    onClick={handleChange}
                    className="mr-1"
                >
                    Lưu
                    {
                        isLoading &&
                        <Spinner size="sm" className="ml-1"/>
                    }
                </Button>
            </ModalFooter>
        </Modal>
    );
});

ModalEquipment.defaultProps = {
    typeModal: 'new',
    dataEdit: {
        // administrativeCode: "",
        // name: "",
        address: "",
        map: "",
        isActive: "true"
    }
};

ModalEquipment.propTypes = {
    isOpen: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
    onChange: propTypes.func.isRequired,
    typeModal: propTypes.oneOf(['new', 'edit']),
    dataEdit: propTypes.object
};

export default ModalEquipment;
