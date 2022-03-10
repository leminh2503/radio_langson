import React, {useEffect, useRef, useState}                          from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {Badge, Modal as ModalAntd, Row, Tabs}                        from "antd";
import {FontAwesomeIcon}                                             from "@fortawesome/react-fontawesome";
import {faFileAudio, faMapMarkerAlt, faMicrophone}                   from "@fortawesome/free-solid-svg-icons";
import moment                                                        from 'moment';

import TreeAdministrative from "../Tree/TreeAdministrative";
import RecordComponent    from "../RecordComponent/RecordComponent";
import TreeFolder         from "../Tree/TreeFolder";
import apiProgram         from "../../../Api/Program/Program";
import ModalRightContent  from "./ModalRightContent";
import Notify             from "../../../Utils/Notify/Notify";

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

const Emergency = React.memo((props) => {
    const {isOpen, onClose, selectedCalendar} = props;

    const adCode = useRef('');

    const [data, setData] = useState([]);

    const hasWorker = useRef(false);

    const initState = useRef({
        disabledTree: false,
        typeEmergency: "1",
        fileOrLocation: "1",
        file: null,
        isCreatingEmergency: false
    }).current;

    const content = useRef('');

    let time = useRef(null);

    const [state, setState] = useState(initState);

    const onDisableTreeAdministrative = (value) => {
        setState(prev => ({
            ...prev,
            disabledTree: value
        }));
    };

    const onChangeFileOrLocation = (value) => {
        setState(prev => ({
            ...prev,
            fileOrLocation: value
        }));
    };

    const onChangeTypeEmergency = (value) => {
        if (state.fileOrLocation === "2") {
            setState(prev => ({
                ...prev,
                fileOrLocation: "1",
                typeEmergency: value
            }));
            return;
        }
        setState(prev => ({
            ...prev,
            typeEmergency: value
        }));
    };

    const formatTimeCurrent = (second = null) => {
        if (!second) {
            const date = new Date();
            second = date.getSeconds();
        }
        return 15 - (second % 15);
    };

    const handleCreateLiveWithFile = () => {
        const {province, districts, wards, selected} = adCode.current;
        if (!adCode.current || (!province && districts.length === 0 && wards.length === 0 && selected.length === 0)) {
            return Notify.error(`Chưa chọn địa điểm phát`);
        }
        if (!state.file) return Notify.error('Chưa file nào được chọn');
        const formatTime = "HH:mm:ss";
        ModalAntd.confirm({
            title: 'Nhắc nhở',
            content: 'Xác nhận tạo chương trình khẩn cấp ?',
            okText: "Xác nhận",
            zIndex: 10000,
            onOk: () => {
                const currentTime = moment().add(formatTimeCurrent(), 'second');
                if (time.current) {
                    const getSecondTime = time.current.format(formatTime).split(":")[2];
                    time.current = time.current.clone().add(formatTimeCurrent(getSecondTime), 'second');
                }
                const data = {
                    title: content.current ? content.current : `Chương trình khẩn cấp từ file ${state?.file.title}`,
                    adTree: adCode.current,
                    timeStart: time.current ? time.current.format(formatTime) : currentTime.format(formatTime),
                    timeEnd: time.current ? time.current.clone().add(state.file.duration, 'seconds').format(formatTime) : currentTime.clone().add(state.file.duration, 'seconds').format(formatTime),
                    sourceStream: {
                        sourceType: 7,
                        file: state.file.id
                    }
                };
                setState(prev => ({...prev, isCreatingEmergency: true}));
                apiProgram.createEmergency(data, (err, res) => {
                    if (res) {
                        setState(prev => ({...prev, isCreatingEmergency: false}));
                        onClose();
                        Notify.success("Tạo chương trình phát khẩn cấp từ file thành công");
                    } else {
                        setState(prev => ({...prev, isCreatingEmergency: false}));
                    }
                });
            }
        });
    };

    const onSelectFile = (node) => {
        if (node?.type !== 'file') return;
        setState(prev => ({
            ...prev,
            file: node?.id === state?.file?.id ? null : node
        }));
    };
    useEffect(() => {
        setState(initState);
        if (!hasWorker.current && isOpen) {
            hasWorker.current = true;
            const script = document.createElement('script');
            script.src = '/broadcast-calendar.js';
            document.head.appendChild(script);
        }
        setData(adCode)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} style={{maxWidth: '750px', overflow: 'auto'}}>
            <ModalHeader toggle={onClose}>
                Phát khẩn cấp
            </ModalHeader>
            <ModalBody className="pt-0">
                <Row>
                    <div className="modal_tree-administrative">
                        <Tabs
                            defaultActiveKey="1"
                            activeKey={state.fileOrLocation}
                            onChange={onChangeFileOrLocation}
                        >
                            <Tabs.TabPane
                                disabled={state.disabledTree}
                                key="1"
                                tab={<TabPaneLabel icon={faMapMarkerAlt} label="Chọn địa điểm"/>}
                            >
                                <TreeAdministrative
                                    disabled={state.disabledTree}
                                    adCode={adCode}
                                    setData={setData}
                                />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                                disabled={state.typeEmergency === "1" || state.disabledTree}
                                key="2"
                                tab={
                                    <TabPaneLabel
                                        icon={faFileAudio}
                                        label="Chọn File"
                                        hasBadge={state.file !== null}
                                    />
                                }
                            >
                                <TreeFolder onSelectFile={onSelectFile}/>
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                    <div className="modal_right-content">
                        <Tabs defaultActiveKey="1"
                              onChange={onChangeTypeEmergency}
                              onTabClick={() => {
                                  setState((prev) => ({
                                      ...prev,
                                      fileOrLocation: prev.typeEmergency === '1' ? '2' : '1'
                                  }))
                        }}>
                            <Tabs.TabPane
                                disabled={state.disabledTree}
                                key="1"
                                tab={<TabPaneLabel icon={faMicrophone} label="Từ mic"/>}
                            >
                                <RecordComponent
                                    adCode={adCode}
                                    mustSelectAdministrative={true}
                                    onDisableTreeAdministrative={onDisableTreeAdministrative}
                                    type="emergency"
                                    selectedCalendar={selectedCalendar}
                                />
                            </Tabs.TabPane>
                            <Tabs.TabPane
                                disabled={!data[0]}
                                key="2"
                                tab={<TabPaneLabel icon={faFileAudio} label="Từ File"/>}
                            >
                                <ModalRightContent
                                    state={state}
                                    content={content}
                                    time={time}
                                />
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                </Row>
            </ModalBody>
            {
                state.typeEmergency === '2' &&
                <ModalFooter>
                    <Button
                        disabled={state.isCreatingEmergency}
                        className="mr-1"
                        color="danger"
                        size="md"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>
                    <Button
                        disabled={state.isCreatingEmergency}
                        color="primary"
                        size="md"
                        onClick={handleCreateLiveWithFile}
                    >
                        Xác nhận
                        {
                            state.isCreatingEmergency &&
                            <Spinner size="sm" className="ml-1"/>
                        }
                    </Button>
                </ModalFooter>
            }
        </Modal>
    );
});

export default Emergency;