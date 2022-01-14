import React, {useEffect, useState} from 'react';
import {Col, Modal, Row, Select}    from "antd";

import {_configTimeline} from "../Etc/Etc";

const ModalSizeTimeline = ({visible, onOk, closeModal, value}) => {
    const [configTimeline, setConfigTimeline] = useState(value);

    const onChange = (newValue, key) => {
        setConfigTimeline(prev => ({...prev, [key]: newValue}));
    };

    const handleOk = () => {
        document.documentElement.style.setProperty('--size_per_lines-timeline', `${configTimeline.size}px`);
        onOk(configTimeline);
        closeModal();
        localStorage.setItem("configTimeline", JSON.stringify(configTimeline));
    };

    useEffect(() => {
        if (visible) {
            setConfigTimeline(value);
        }
    }, [visible]);

    return (
        <Modal
            title="Tùy chỉnh hiển thị"
            visible={visible}
            onOk={handleOk}
            onCancel={closeModal}
            okText="Xác nhận"
            cancelText="Hủy bỏ"
            width={380}
        >
            <Row className="align-items-center">
                <Col span={12} className="text-bold-5">
                    Độ rộng dòng:
                </Col>
                <Col span={12} className="d-flex justify-content-end">
                    <Select
                        value={configTimeline.size}
                        onChange={(value) => onChange(value, 'size')}
                        style={{minWidth: "100px"}}
                    >
                        {
                            _configTimeline.sizePerLines.map(({value}, i) => (
                                <Select.Option value={value} key={i}>
                                    {value}
                                </Select.Option>
                            ))
                        }
                    </Select>
                </Col>
            </Row>
            <Row className="align-items-center mt-2">
                <Col span={12} className="text-bold-5">
                    Số dòng/60p:
                </Col>
                <Col span={12} className="d-flex justify-content-end">
                    <Select
                        value={configTimeline.lines}
                        onChange={(value) => onChange(value, 'lines')}
                        style={{minWidth: "155px"}}
                    >
                        {
                            _configTimeline.minutesAndLines.map(({minutes, lines}, i) => (
                                <Select.Option value={lines} key={i}>
                                    {lines} dòng ({minutes}p/dòng)
                                </Select.Option>
                            ))
                        }
                    </Select>
                </Col>
            </Row>
        </Modal>
    );
};

export default ModalSizeTimeline;