import React, {useState} from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {Button as ButtonAntd, Col, Row, Slider, Tooltip} from 'antd';
import {QuestionCircleOutlined} from '@ant-design/icons';

import icon from '../../../Assets/icon/Radio.png';
import apiEquipment from '../../../Api/Equipment/Equipment';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faVolumeMute, faVolumeUp} from '@fortawesome/free-solid-svg-icons';
import {isEmpty} from '../../../Utils';
import {statusDevices} from '../Main';

const ModalDetails = React.memo(props => {
    const {isOpen, onClose, device, convertProgram, vol, oldVol} = props;

    const oldData = React.useRef({
        status: 0,
        oldVol,
    });
    const definedStatus = React.useRef({
        on: [statusDevices.PLAYING.status, statusDevices.STOP.status],
        off: [statusDevices.OFFLINE.status],
        try: [statusDevices.TRY_CONNECT.status, statusDevices.ERROR.status],
        ban: [statusDevices.BAN.status],
    }).current;
    const [data, setData] = useState({
        status: 0,
        vol,
        isToggle: false,
    });
    React.useEffect(() => {
        if (isOpen) {
            let status = 0;
            if (definedStatus.on.includes(device.status)) {
                status = 1;
            } else if (definedStatus.off.includes(device.status)) {
                status = -1;
            } else if (definedStatus.try.includes(device.status)) {
                status = 2;
            } else if (definedStatus.ban.includes(device.status)) {
                status = 99;
            }
            const value = {
                mac: device?.mac,
                status: device?.status,
                vol: device?.volume,
                isToggle: false,
            };
            oldData.current = value;
            setData(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device, isOpen]);

    const handleBanEquitpment = status => {
        const prevStatus = data?.status;
        
        apiEquipment.controlEquipment(
            {
                mac: device?.mac,
                message: `BAN=${prevStatus === 99 ? 0 : 1}`,
            },
            (err) => {
                if (!err) {
                    setData(prev => ({
                        ...prev,
                        status: data.status
                    }))
                }
                if (err){
                    setData(prev => ({
                        ...prev,
                        status: prevStatus,
                    }));
                }
            },
        );
    };

    const handleToggleEquipment = status => {
        if (status === data.status) return;
        const prevStatus = data.status;
        setData(prev => ({
            ...prev,
            status: status,
        }));
        apiEquipment.controlEquipment(
            {
                mac: device?.mac,
                message: `PLY=${status === 1 ? 1 : 0}`,
            },
            err => {
                if (err) {  
                    setData(prev => ({
                        ...prev,
                        status: prevStatus,
                        isToggle: false,
                    }));
                }
            },
        );
    };

    const handleControlVolume = (key, value) => {
        if (String(oldData.current[key]) === String(value)) return;
        apiEquipment.controlEquipment(
            {
                mac: device?.mac,
                message: `${key.toUpperCase()}=${value}`,
            },
            err => {
                if (!err) {
                } else {
                    setData(oldData.current);
                }
            },
        );
    };

    return (
        <Modal isOpen={isOpen} toggle={onClose}>
            <ModalHeader toggle={onClose}>Thiết bị</ModalHeader>
            <ModalBody>
                <Row className="border">
                    <Col
                        span={8}
                        className="radio-image-modal border-right row-all-center">
                        <div className="py-2">
                            <img width="98px" height="88px" alt="" src={icon} />
                        </div>
                    </Col>
                    <Col span={16} className="p-2 content-radio-modal">
                        <div className="text-bold-5">Mã: {data?.mac}</div>
                        <div className="text-bold-5 mt-2 row-vertical-center">
                            Khu vực: {device?.administrativeCode?.pathWithType}
                        </div>
                        <div className="text-bold-5 mt-2 row-vertical-center">
                            Ch.trình hiện tại: {convertProgram(device)}
                        </div>
                        <div className="text-bold-5 mt-2 row-vertical-center">
                            Thông tin:{' '}
                            {isEmpty(device?.info) ? '' : device?.info}
                        </div>
                        <div className="text-bold-5 mt-2 row-vertical-center">
                            Vĩ độ: {device?.latitude}
                        </div>
                        <div className="text-bold-5 mt-2 row-vertical-center">
                            Kinh độ: {device?.longitude}
                        </div>
                    </Col>
                </Row>
                <div className="text-bold-5 my-2 row-vertical-center">
                    <Col span={4}>Điều khiển:</Col>
                    <Col span={20}>
                        <Row>
                            <ButtonAntd
                                shape="round"
                                disabled={data?.status === 99}
                                style={
                                    data?.status === 1
                                        ? {
                                              backgroundColor: 'green',
                                              color: '#FFFFFF',
                                          }
                                        : {}
                                }
                                onClick={handleToggleEquipment.bind(this,1)}>
                                Phát
                            </ButtonAntd>
                            <ButtonAntd
                                shape="round"
                                disabled={data?.status === 99}
                                className="ml-2"
                                style={
                                    data?.status === 0
                                        ? {
                                              backgroundColor: '#076990',
                                              color: '#FFFFFF',
                                          }
                                        : {}
                                }
                                onClick={handleToggleEquipment.bind(this, 0)}>
                                Dừng
                            </ButtonAntd>
                            <ButtonAntd
                                disabled={data?.status !== 2}
                                shape="round"
                                className="ml-2"
                                style={
                                    data?.status === 2
                                        ? {
                                              backgroundColor: '#8D1EFF',
                                              color: '#FFFFFF',
                                          }
                                        : {}
                                }>
                                Đang kết nối
                            </ButtonAntd>

                            <ButtonAntd
                                shape="round"
                                className="ml-2"
                                style={
                                    data?.status === 99
                                        ? {
                                              backgroundColor: '#F12435',
                                              color: '#FFFFFF',
                                          }
                                        : {}
                                }
                                onClick={handleBanEquitpment.bind(this)}>
                                Tạm Khóa
                            </ButtonAntd>

                            <div className="ml-2" style={{cursor: 'pointer'}}>
                                <Tooltip title="Trạng thái thiết bị cập nhật liên tục 5s/lần. Nếu lúc điều khiển bị nhảy trạng thái từ Bật sang Tắt hoặc ngược lại, vui lòng đợi trong giây lát và thử lại.">
                                    <QuestionCircleOutlined size="2x" />
                                </Tooltip>
                            </div>
                        </Row>
                    </Col>
                </div>
                
                <div className="row-vertical-center mt-2">
                    <Col span={4} className="text-bold-5">
                        Âm lượng:
                    </Col>
                    <Col span={20}>
                        <div className="row-vertical-center  border p-1">
                            <div className="row-vertical-center w-100 px-1">
                                <div
                                    className="hover-pointer"
                                    onClick={() => {
                                        if (data?.vol > 0) {
                                            setData(prev => ({
                                                ...prev,
                                                vol: 0,
                                            }));
                                            handleControlVolume('vol', 0);
                                        } else {
                                            setData(prev => ({
                                                ...prev,
                                                vol: 20,
                                            }));
                                            handleControlVolume('vol', 20);
                                        }
                                    }}>
                                    <FontAwesomeIcon
                                        icon={
                                            data?.vol === 0
                                                ? faVolumeMute
                                                : faVolumeUp
                                        }
                                        color="#185C98"
                                    />
                                </div>
                                <div className="w-100 px-1">
                                    <Slider
                                        value={data?.vol}
                                        onChange={value =>
                                            setData(prev => ({
                                                ...prev,
                                                vol: value,
                                            }))
                                        }
                                        onAfterChange={value =>
                                            handleControlVolume('vol', value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </Col>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" size="md" onClick={onClose}>
                    Đóng
                </Button>
            </ModalFooter>
        </Modal>
    );
});

export default ModalDetails;
