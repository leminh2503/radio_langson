import React, {useEffect, useRef, useState} from "react";
import propTypes                            from "prop-types";
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
}                                           from "reactstrap";
import {DatePicker}                         from "antd";
import moment                               from "moment";

import Notify            from "../../../Utils/Notify/Notify";
import {formatSecToTime} from "../../../Utils/DateTime/DateTime";
import Alert             from "../../../Utils/Notify/Alert";
import {isEmpty}         from "../../../Utils";

const datetimeFormat = "HH:mm:ss";

const CustomInput = React.memo(({label, type, keyValue, value, required, onChange, readOnly}) => {
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
                            showTime
                            value={value}
                            className="form-control"
                            style={{marginRight: '16px'}}
                            onOk={date => onChange(date)}
                            format={datetimeFormat}
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
    readOnly: false
};

CustomInput.propTypes = {
    label: propTypes.string.isRequired,
    type: propTypes.string.isRequired,
    value: propTypes.any,
    onChange: propTypes.func.isRequired,
    keyValue: propTypes.string.isRequired,
    required: propTypes.bool,
    readOnly: propTypes.bool
};

const ModalBroadcastSchedule = React.memo(({
                                               isOpen,
                                               onClose,
                                               onChange,
                                               typeModal,
                                               dataEdit,
                                               dataProgram,
                                               dateDroppedItem,
                                               isLive,
                                               editedOverride
                                           }) => {
    const _requiredFields = [
        {label: "Thời gian bắt đầu", key: 'timeStart', isLive: isLive?.current},
        {label: "Thời gian kết thúc", key: 'timeEnd', isLive: isLive?.current}
    ];

    const _listInput = [
        {label: "Tên file", type: 'text', keyValue: "fileName", readOnly: true},
        {label: "Tên chương trình", type: 'text', keyValue: "title"},
        {label: "Thời lượng của File", type: 'text', keyValue: "duration", readOnly: true},
        {
            label: "Thời gian bắt đầu",
            type: 'text',
            keyValue: "timeStart",
            required: true,
            visible: isLive?.current !== true
        },
    ];

    const initData = useRef({
        timeStart: moment(),
        timeEnd: moment(),
        fileId: "",
        title: "",
        fileName: "",
        duration: "",
        overridden: false
    }).current;

    const dateArrays = useRef([]);

    const [data, setData] = useState(initData);

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = React.useCallback(() => {
        for (let i = 0; i < _requiredFields.length; i++) {
            if (!data[_requiredFields[i].key]) {
                Notify.error(`${_requiredFields[i].label} không được để trống`);
                return;
            }
        }
        const start = data?.timeStart.clone().startOf("date");
        const end = data?.timeEnd.clone().startOf("date");
        if (start - end >= 86400 * 1000) {
            Notify.error(`Thời gian chương trình không hợp lệ`);
            return;
        }
        setIsLoading(true);
        if (dateArrays.current.length > 0) {
            dateArrays.current = dateArrays.current.map(d => d.format("YYYY-MM-DD"));
        }
        const dataModal = {
            ...data,
            title: data?.title ? data.title : data?.fileName,
            date_loop: dateArrays.current.length > 0 ? dateArrays.current : undefined,
            fileId: undefined,
            fileName: undefined,
            duration: undefined,
            timeStart: isLive?.current ? undefined : data?.timeStart.format(datetimeFormat),
            timeEnd: isLive?.current ? undefined : data?.timeEnd.format(datetimeFormat),
            sourceStream: {
                sourceType: isLive?.current ? 5 : 1,
                file: data?.fileId
            }
        };
        if (data?.checked) {
            Alert.confirm(`Xác nhận ghi đè lịch phát ?`, (check) => {
                if (check) {
                    onChange(dataModal, setIsLoading);
                }
            });
        } else {
            onChange(dataModal, setIsLoading);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const handleCloseModal = () => {
        if (dateDroppedItem?.current) {
            dateDroppedItem.current = undefined;
        }
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
            if (dataEdit?.Guid) {
                const datetimeStart = dataEdit?.datetimeStart ?? "";
                const datetimeEnd = dataEdit?.datetimeEnd ?? "";
                const data = {
                    id: dataEdit?.id,
                    fileId: dataEdit?.sourceStream?.file?.id,
                    duration: formatSecToTime(dataEdit?.sourceStream?.file?.duration),
                    title: dataEdit?.title,
                    fileName: dataEdit?.sourceStream?.file?.title,
                    timeStart: moment(datetimeStart),
                    timeEnd: moment(datetimeEnd)
                    // overridden: true,
                };
                setData(prev => ({...prev, ...data}));
                return;
            } else if (dataProgram?.Guid && !isEmpty(dataEdit)) {
                const datetimeEnd = dataProgram?.datetimeEnd ?? "";
                const data = {
                    id: dataEdit?.id,
                    fileId: dataEdit?.id,
                    duration: formatSecToTime(dataEdit?.duration),
                    title: dataEdit?.title,
                    fileName: dataEdit?.title,
                    timeStart: moment(datetimeEnd).add(10, 'seconds'),
                    timeEnd: moment(datetimeEnd).clone().add(dataEdit?.duration + 10, 'seconds')
                    // overridden: true,
                };
                setData(prev => ({...prev, ...data}));
                return;
            }
            const timeStart = dateDroppedItem?.current ? moment(Number(dateDroppedItem.current)) : moment().startOf("day").add(4, 'hours');
            const timeEnd = timeStart.clone().add(dataEdit?.duration, 'seconds');
            setData(({
                ...initData,
                fileId: dataEdit?.id,
                fileName: dataEdit?.title,
                timeStart,
                timeEnd,
                duration: formatSecToTime(dataEdit?.duration)
            }));
        } else {
            if (isLive?.current) {
                isLive.current = false;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, dataEdit, dateDroppedItem, dataProgram]);

    useEffect(() => {
        if (!isOpen && editedOverride) {
            editedOverride.current = {
                editMode: false,
                programId: null
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen}>
            <ModalHeader toggle={handleCloseModal}>
                {
                    typeModal === 'new' && !isLive?.current ?
                        "Tạo chương trình"
                        : typeModal === 'new' && isLive?.current ?
                        'Phát trực tiếp File'
                        :
                        'Sửa thông tin chương trình'
                }
            </ModalHeader>
            <ModalBody>
                {
                    _listInput.map(({label, type, keyValue, options, required, readOnly}, index) => (
                        (keyValue !== 'timeStart' && keyValue !== 'timeEnd') &&
                        <CustomInput
                            readOnly={readOnly}
                            key={index}
                            label={label}
                            type={type}
                            keyValue={keyValue}
                            options={options}
                            value={data[keyValue]}
                            required={typeModal === 'new' && required}
                            onChange={(value) => {
                                setData(prev => ({
                                    ...prev,
                                    [keyValue]: value
                                }));
                            }}
                        />
                    ))
                }
                <FormGroup>
                    <Row>
                        {
                            _listInput.map(({label, type, keyValue, options, required, visible}, index) => (
                                ((keyValue === 'timeStart') && visible) &&
                                <Col md={12} key={index}>
                                    <CustomInput
                                        label={label}
                                        type={type}
                                        keyValue={keyValue}
                                        options={options}
                                        value={data[keyValue]}
                                        required={typeModal === 'new' && required}
                                        onChange={(value) => {
                                            if (keyValue === 'timeStart') {
                                                const timeStart = value.clone();
                                                const timeEnd = value.clone().add(data?.duration, 'seconds');
                                                setData(prev => ({
                                                    ...prev,
                                                    timeStart,
                                                    timeEnd
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
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={isLoading}
                    className="mr-1"
                    color="danger"
                    size="md"
                    onClick={handleCloseModal}
                >
                    Hủy
                </Button>
                <Button
                    color="primary"
                    size="md"
                    onClick={handleChange}
                    disabled={isLoading}
                >
                    Xác nhận
                    {
                        isLoading &&
                        <Spinner size="sm" className="ml-1"/>
                    }
                </Button>
            </ModalFooter>
        </Modal>
    );
});

ModalBroadcastSchedule.defaultProps = {
    typeModal: 'new',
    dataEdit: {
        id: null,
        title: null,
        fileName: null,
        timeStart: new Date().setMinutes(30),
        timeEnd: new Date().setMinutes(60)
    },
    dataProgram: {}
};

ModalBroadcastSchedule.propTypes = {
    isOpen: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
    onChange: propTypes.func.isRequired,
    typeModal: propTypes.oneOf(['new', 'edit']),
    dataEdit: propTypes.object,
    dataProgram: propTypes.object
};

export default ModalBroadcastSchedule;
