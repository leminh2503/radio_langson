import React, {useCallback, useEffect, useRef, useState} from "react";
import propTypes                                         from "prop-types";
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
}                                                        from "reactstrap";
import {DatePicker}                                      from "antd";
import moment                                            from "moment";

import Notify     from "../../../Utils/Notify/Notify";
import apiChannel from "../../../Api/Channel/Channel";

const dateFormat = "HH:mm:ss";

const CustomInput = React.memo(({
                                    label,
                                    type,
                                    keyValue,
                                    value,
                                    required,
                                    onChange,
                                    readOnly,
                                    options,
                                    visible = true
                                }) => {
    if (!visible) return null;
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
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                >
                    {
                        options.map(({id, title, visible = true}, index) => (
                            visible &&
                            <option
                                value={id}
                                title={title}
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

    return (
        <FormGroup>
            <Label
                for={keyValue}
                className={`text-bold-5 ${required ? 'account_required-item' : ''}`}
            >
                {label}
            </Label>
            {(label === "Thời gian bắt đầu" || label === "Thời gian kết thúc")
                ?
                (
                    <Row className="ml-0">
                        <DatePicker.TimePicker
                            showNow={false}
                            allowClear={false}
                            inputReadOnly
                            value={value}
                            className="form-control"
                            style={{marginRight: '16px'}}
                            onOk={date => onChange(date)}
                            format={dateFormat}
                        />
                    </Row>
                )
                :
                <Input
                    readOnly={readOnly}
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            }
        </FormGroup>
    );
});

CustomInput.defaultProps = {
    value: "",
    required: false,
    readOnly: false,
    label: ""
};

CustomInput.propTypes = {
    label: propTypes.string,
    type: propTypes.string.isRequired,
    value: propTypes.any,
    onChange: propTypes.func.isRequired,
    keyValue: propTypes.string.isRequired,
    required: propTypes.bool,
    readOnly: propTypes.bool
};

const ModalForward = React.memo(({isOpen, onClose, onChange, typeModal, dataEdit}) => {
    const _requiredFields = useRef([
        // {label: "Kiểu tiếp sóng", key: 'typeRadio'},
        {label: "Đài phát sóng", key: 'location'},
        {label: "Thời gian bắt đầu", key: 'datetimeStart'},
        {label: "Thời gian kết thúc", key: 'datetimeEnd'}
    ]).current;

    const _listDateTime = useRef([
        {label: "Thời gian bắt đầu", type: 'text', keyValue: "datetimeStart", required: true},
        {label: "Thời gian kết thúc", type: 'text', keyValue: "datetimeEnd", required: true}
    ]).current;

    const initData = useRef({
        title: "",
        datetimeStart: moment().add(10, 'minutes'),
        datetimeEnd: moment().add(20, 'minutes'),
        administrative_code: "",
        typeRadio: 0,
        location: null,
    }).current;

    const dateArrays = useRef([]);

    const isEdited = useRef(false);

    const [isLast, setIsLast] = useState(false);

    const [data, setData] = useState(initData);

    const [isLoading, setIsLoading] = useState(false);

    const [options, setOptions] = useState([
        {
            label: 'Chọn Đài VOV',
            data: []
        },
        {
            label: 'Chọn Đài Tỉnh',
            data: [
                {id: 1, title: "Tỉnh A"},
                {id: 0, title: "Tỉnh B"}
            ]
        },
        {
            label: 'Chọn Đài Huyện',
            data: [
                {id: 0, title: "Huyện A"},
                {id: 1, title: "Huyện B"}
            ]
        }
    ]);

    const _listInput = [
        {
            visible: true,
            label: "Kiểu tiếp sóng",
            type: 'select',
            keyValue: "typeRadio",
            required: true,
            options: [
                {id: 0, title: "Đài VOV", visible: true, optionsVisible: true}
                // {id: 1, title: "Đài Tỉnh", visible: division === 2 || division === 3},
                // {id: 2, title: "Đài Huyện", visible: division === 3}
            ]
        },
        {
            visible: Number(data?.typeRadio) === 0,
            label: options[data?.typeRadio]?.label,
            type: 'select',
            keyValue: "location",
            required: true,
            options: options[data?.typeRadio]?.data
        }
    ];

    const checkTypeRadio = useCallback((sourceStream) => {
        if (sourceStream) {
            const {sourceType, division} = sourceStream;
            if (sourceType === 3) {
                return 0;
            } else if (sourceType === 4) {
                if (division === 1) {
                    return 1;
                } else if (division === 2) {
                    return 2;
                }
            }
        }

    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
            if (typeModal === 'edit') {
                const cpDataEdit = dataEdit.current;
                setData({
                    ...cpDataEdit,
                    typeRadio: checkTypeRadio(cpDataEdit?.sourceStream),
                    location: cpDataEdit?.sourceStream?.channel?.id ?? undefined,
                    datetimeStart: moment(cpDataEdit?.datetimeStart),
                    datetimeEnd: moment(cpDataEdit?.datetimeEnd)
                });
                return;
            }
            apiChannel.getListChannel((err, res) => {
                if (res) {
                    setData(prev => ({
                        ...prev,
                        location: res[0]?.id,
                        titleL: res[0]?.title
                    }))
                } else {
                    setData(prev => ({
                        ...prev,
                        location: 0
                    }));
                }
            });
        }
        return () => setIsLast(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && options[0].data.length === 0 && !isLast) {
            apiChannel.getListChannel((err, res) => {
                if (res) {
                    if (res?.length === 0) {
                        setIsLast(true);
                    }
                    setOptions(prev => {
                        const copyPrev = JSON.parse(JSON.stringify(prev));
                        copyPrev[0].data = res;
                        return copyPrev;
                    });
                } else {
                    setData(prev => ({
                        ...prev,
                        location: 0
                    }));
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, options, isLast]);

    const handleChange = () => {
        for (let i = 0; i < _requiredFields.length; i++) {
            if (!data[_requiredFields[i].key]) {
                Notify.error(`${_requiredFields[i].label} không được để trống`);
                return;
            }
        }
        if (data?.datetimeEnd - data?.datetimeStart >= 86400 * 1000) {
            Notify.error(`Thời gian chương trình dài hơn 1 ngày`);
            return;
        }
        if (!isEdited.current && typeModal === 'edit') {
            onChange({});
            return;
        }
        isEdited.current = false;
        setIsLoading(true);
        const typeRadio = String(data?.typeRadio);
        if (dateArrays.current.length > 0) {
            dateArrays.current = dateArrays.current.map(d => d.format("YYYY-MM-DD"));
        }
        onChange({
            date_loop: dateArrays.current.length > 0 ? dateArrays.current : undefined,
            id: typeModal === 'edit' ? data?.id : undefined,
            title: 'Tiếp sóng',
            timeStart: data?.datetimeStart.format(dateFormat) ?? null,
            timeEnd: data?.datetimeEnd.format(dateFormat) ?? null,
            sourceStream: {
                sourceType: typeRadio === "0" ? 3 : 4,
                channel: typeRadio === "0" ? data?.location : null,
                division: typeRadio === "0" ? undefined : typeRadio
            }
        }, setIsLoading);
    };
    return (
        <Modal isOpen={isOpen}>
            <ModalHeader toggle={onClose}>
                {`${typeModal === 'new' ? 'Tạo' : 'Sửa'} chương trình tiếp sóng`}
            </ModalHeader>
            <ModalBody>
                {
                    _listInput.map(({label, type, keyValue, options, required, readOnly, visible}, index) => (
                        <CustomInput
                            visible={visible}
                            readOnly={readOnly}
                            key={index}
                            label={label}
                            type={type}
                            keyValue={keyValue}
                            options={options}
                            value={data[keyValue]}
                            required={typeModal === 'new' && required}
                            onChange={(value) => {
                                if (!isEdited.current) {
                                    isEdited.current = true;
                                }
                                setData(prev => ({
                                    ...prev,
                                    [keyValue]: value
                                }));
                            }}
                        />
                    ))
                }
                <FormGroup className="mb-0">
                    <Row>
                        {
                            _listDateTime.map(({label, type, keyValue, options, required}, index) => (
                                <Col md={6} key={index}>
                                    <CustomInput
                                        label={label}
                                        type={type}
                                        keyValue={keyValue}
                                        options={options}
                                        value={data[keyValue]}
                                        required={required}
                                        onChange={(value) => {
                                            if (!isEdited.current) {
                                                isEdited.current = true;
                                            }
                                            if (keyValue === 'datetimeStart') {
                                                const datetimeStart = value.clone();
                                                const datetimeEnd = value.clone().add(20, 'minutes');
                                                setData(prev => ({
                                                    ...prev,
                                                    datetimeStart,
                                                    datetimeEnd
                                                }));
                                                return;
                                            }
                                            setData(prev => ({
                                                ...prev,
                                                [keyValue]: value
                                            }));
                                        }}
                                    />
                                </Col>
                            ))
                        }
                    </Row>
                    {/*{*/}
                    {/*    typeModal === 'new' &&*/}
                    {/*    <CustomCalendar dateArrays={dateArrays}/>*/}
                    {/*}*/}
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={isLoading}
                    color="danger"
                    size="md"
                    onClick={onClose}
                    className="mr-1"
                >
                    Hủy
                </Button>
                <Button
                    disabled={isLoading}
                    color="primary"
                    size="md"
                    onClick={handleChange}
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

ModalForward.defaultProps = {
    typeModal: 'new',
    dataEdit: {}
};

ModalForward.propTypes = {
    isOpen: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
    onChange: propTypes.func.isRequired,
    typeModal: propTypes.oneOf(['new', 'edit']),
    dataEdit: propTypes.object
};

export default ModalForward;
