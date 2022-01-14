import React, {useEffect, useRef, useState} from 'react';
import {Input, Modal, Row, Select, Slider}  from "antd";
import Notify                               from "../../../Utils/Notify/Notify";

const marks = {
    '-3': '-3',
    '-2': '-2',
    '-1': '-1',
    0: '0',
    1: '1',
    2: '2',
    3: '3'
};

const ModalTTS = (props) => {
    const {visible, onOk, onCancel, currentFolder} = props;

    const _data = useRef({
        service: ["servicebin", "servicegoo"],
        servicebin: [
            {
                title: 'Giọng nam',
                voiceID: 'vi-VN'
            },
            {
                title: 'Giọng nữ',
                voiceID: 'vi-VN2'
            },
            {
                title: 'Giọng nam trầm',
                voiceID: 'vi-VN3'
            }
        ],
        servicegoo: [
            {
                title: 'Giọng nữ',
                voiceID: 'vi-VN-Standard-A'
            },
            {
                title: 'Giọng nam',
                voiceID: 'vi-VN-Standard-B'
            }
        ]
    }).current;

    const [isLoading, setIsLoading] = useState(false);

    const [text, setText] = useState('');

    const [fileName, setFileName] = useState('');

    const [voiceSpeed, setVoiceSpeed] = useState(0);

    const [voice, setVoice] = useState('vi-VN');

    const [voiceService, setVoiceService] = useState('servicebin');

    const handleBeforeOk = () => {
        setIsLoading(true);
        if (fileName === '') {
            Notify.error('Tên file không được để trống');
            setIsLoading(false);
            return;
        }

        if (text === '') {
            Notify.error('Nội dung không được để trống');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        onOk({
            title: fileName,
            duration: 60,
            parent: currentFolder.id,
            note: '',
            tts: {
                text,
                voiceService,
                voiceID: voice,
                voiceSpeed: voiceSpeed.toString()
            }
        }, setIsLoading);
    };

    const onChangeVoiceService = (value) => {
        setVoiceService(value);
        setVoice(_data[value][0].voiceID);
    };

    const onChangeVoice = (value) => {
        setVoice(value);
    };

    useEffect(() => {
        setFileName('');
        setText('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal
            title="Tạo file Audio từ Văn bản"
            visible={visible}
            onCancel={onCancel}
            onOk={handleBeforeOk}
            okText="Xác nhận"
            cancelText="Hủy bỏ"
            confirmLoading={isLoading}
        >
            <Row>
                <label className="text-bold-5">Tên file:</label>
                <Input
                    placeholder="Tên file"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    maxLength={255}
                />
            </Row>
            <Row className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center mt-2">
                    <div className="text-bold-5">Chọn dịch vụ:</div>
                    <Select
                        className="ml-2"
                        value={voiceService}
                        dropdownMatchSelectWidth={false}
                        onChange={onChangeVoiceService}
                        style={{minWidth: '110px'}}
                    >
                        {
                            _data.service.map(d => (
                                <Select.Option value={d} key={d}>
                                    {d}
                                </Select.Option>
                            ))
                        }
                    </Select>
                </div>
                <div className="d-flex align-items-center mt-2">
                    <div className="text-bold-5">Chọn giọng nói:</div>
                    <Select
                        className="ml-2"
                        value={voice}
                        dropdownMatchSelectWidth={false}
                        onChange={onChangeVoice}
                        style={{minWidth: '135px'}}
                    >
                        {
                            _data[voiceService].map(({voiceID, title}, i) => (
                                <Select.Option value={voiceID} key={i}>
                                    {title}
                                </Select.Option>
                            ))
                        }
                    </Select>
                </div>
            </Row>
            <Row>
                <label className="mt-2 text-bold-5">Nội dung:</label>
                <Input.TextArea
                    placeholder="Điền nội dung chuyển đổi"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{minHeight: 150}}
                    maxLength={500}
                />
            </Row>
            <label className="mt-2 text-bold-5">Tốc độ đọc:</label>
            <Slider
                min={-3}
                max={3}
                marks={marks}
                value={voiceSpeed}
                onChange={(value) => setVoiceSpeed(value)}
            />
        </Modal>
    );
};

export default ModalTTS;
