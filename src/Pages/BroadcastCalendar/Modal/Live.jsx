import React, {useEffect, useRef, useState}                          from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {Badge, Modal as ModalAntd, Row, Tabs}                        from "antd";
import {faFileAudio, faMicrophone}                                   from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon}                                             from "@fortawesome/react-fontawesome";

import TreeFolder        from "../Tree/TreeFolder";
import RecordComponent   from "../RecordComponent/RecordComponent";
import apiProgram        from "../../../Api/Program/Program";
import ModalRightContent from "./ModalRightContent";
import Notify            from "../../../Utils/Notify/Notify";

const TabPaneLabel = ({icon, label, hasBadge}) => {
    return (
        <div className="row-all-center">
            <FontAwesomeIcon icon={icon}/>
            <div className="ml-2 row-vertical-center">
                <span>{label}</span>
                {hasBadge && <Badge count={1} size="small" className="ml-2"/>}
            </div>
        </div>
    );
};

const Live = React.memo((props) => {
    const {isOpen, onClose, selectedCalendar} = props;

    const adCode = useRef('');

    const initState = useRef({
        disabledTree: false,
        file: null,
        typeLive: "1",
        isCreatingLive: false
    }).current;

    const hasWorker = useRef(false);

    const content = useRef('');

    const time = useRef(null);

    const [state, setState] = useState(initState);

    const onSelectFile = (node) => {
        if (node?.type !== 'file' || node?.id === state?.file?.id) return;
        setState(prev => ({
            ...prev,
            file: node
        }));
    };

    const onDisableTreeAdministrative = (value) => {
        setState(prev => ({
            ...prev,
            disabledTree: value
        }));
    };

    const onChangeTypeEmergency = (value) => {
        setState(prev => ({
            ...prev,
            typeLive: value
        }));
    };

    const handleCreateLiveWithFile = () => {
        if (!state.file) return Notify.error('Chưa file nào được chọn');
        if (!content.current) return Notify.error('Chưa điền nội dung phát trực tiếp');
        const formatTime = "HH:mm:ss";
        ModalAntd.confirm({
            title: 'Nhắc nhở',
            content: 'Xác nhận tạo chương trình trực tiếp ?',
            okText: "Xác nhận",
            zIndex: 10000,
            onOk: () => {
                setState(prev => ({...prev, isCreatingLive: true}));
                apiProgram.createLive({
                    title: content.current,
                    broadcastCalendar: selectedCalendar?.id,
                    timeStart: time.current ? time.current.format(formatTime) : null,
                    timeEnd: time.current ? time.current.clone().add(state.file.duration, 'seconds').format(formatTime) : null,
                    sourceStream: {
                        sourceType: 5,
                        file: state.file.id
                    }
                }, (err, res) => {
                    if (res) {
                        onClose();
                        Notify.success("Tạo chương trình phát trực tiếp từ file thành công");
                    }
                    setState(prev => ({...prev, isCreatingLive: false}));
                });
            }
        });
    };

    useEffect(() => {
        setState(initState);
        if (!hasWorker.current && isOpen) {
            hasWorker.current = true;
            const script = document.createElement('script');
            script.src = '/broadcast-calendar.js';
            document.head.appendChild(script);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} style={{maxWidth: '750px', overflow: 'auto'}}>
            <ModalHeader toggle={onClose}>
                Phát trực tiếp
            </ModalHeader>
            <ModalBody className="pt-0">
                <Tabs
                    defaultActiveKey="1"
                    activeKey={state.fileOrLocation}
                    onChange={onChangeTypeEmergency}
                >
                    <Tabs.TabPane
                        disabled={state.disabledTree}
                        key="1"
                        tab={<TabPaneLabel icon={faMicrophone} label="Từ Mic"/>}
                    >
                        <RecordComponent
                            adCode={adCode}
                            onDisableTreeAdministrative={onDisableTreeAdministrative}
                            type="live"
                            selectedCalendar={selectedCalendar}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        disabled={state.disabledTree}
                        key="2"
                        tab={<TabPaneLabel icon={faFileAudio} label="Từ File" hasBadge={state.file !== null}/>}
                    >
                        <Row>
                            <div className="modal_tree-administrative">
                                <div className="text-bold-5">
                                    <i>* Lựa chọn File:</i>
                                </div>
                                <div className="mt-2">
                                    <TreeFolder onSelectFile={onSelectFile}/>
                                </div>
                            </div>
                            <div className="modal_right-content">
                                <ModalRightContent
                                    state={state}
                                    content={content}
                                    time={time}
                                />
                            </div>
                        </Row>
                    </Tabs.TabPane>
                </Tabs>
            </ModalBody>
            {
                state.typeLive === "2" &&
                <ModalFooter>
                    <Button
                        disabled={state.isCreatingLive}
                        color="danger"
                        size="md"
                        onClick={onClose}
                        className="mr-1"
                    >
                        Hủy
                    </Button>
                    <Button
                        disabled={state.isCreatingLive}
                        color="primary"
                        size="md"
                        onClick={handleCreateLiveWithFile}
                    >
                        Xác nhận
                        {
                            state.isCreatingLive &&
                            <Spinner size="sm" className="ml-1"/>
                        }
                    </Button>
                </ModalFooter>
            }
        </Modal>
    );
});

export default Live;