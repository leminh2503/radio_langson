import React, {useEffect, useRef, useState}                          from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {Badge, Modal as ModalAntd, Row, Tabs}                        from "antd";
import {faFileAudio, faMicrophone}                                   from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon}                                             from "@fortawesome/react-fontawesome";
import moment                                                        from 'moment';

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

    const formatTimeCurrent = (second = null) => {
        if (!second) {
            const date = new Date();
            second = date.getSeconds();
        }
        return 15 - (second % 15);
    };

    const handleCreateLiveWithFile = () => {
        if (!state.file) return Notify.error('Ch??a file n??o ???????c ch???n');
        const formatTime = "HH:mm:ss";
        ModalAntd.confirm({
            title: 'Nh???c nh???',
            content: 'X??c nh???n t???o ch????ng tr??nh tr???c ti???p ?',
            okText: "X??c nh???n",
            zIndex: 10000,
            onOk: () => {
                const currentTime = moment().add(formatTimeCurrent(), 'second');
                if (time.current) {
                    const getSecondTime = time.current.format(formatTime).split(":")[2];
                    time.current = time.current.clone().add(formatTimeCurrent(getSecondTime), 'second');
                }
                setState(prev => ({...prev, isCreatingLive: true}));
                apiProgram.createLive({
                    title: content.current ? content.current : `Ch????ng tr??nh tr???c ti???p t??? file ${state?.file.title}`,
                    broadcastCalendar: selectedCalendar?.id,
                    timeStart: time.current ? time.current.format(formatTime) : currentTime.format(formatTime),
                    timeEnd: time.current ? time.current.clone().add(state.file.duration, 'seconds').format(formatTime) : currentTime.clone().add(state.file.duration, 'seconds').format(formatTime),
                    sourceStream: {
                        sourceType: 5,
                        file: state.file.id
                    }
                }, (err, res) => {
                    if (res) {
                        onClose();
                        Notify.success("T???o ch????ng tr??nh ph??t tr???c ti???p t??? file th??nh c??ng");
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
                Ph??t tr???c ti???p
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
                        tab={<TabPaneLabel icon={faMicrophone} label="T??? Mic"/>}
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
                        tab={<TabPaneLabel icon={faFileAudio} label="T??? File" hasBadge={state.file !== null}/>}
                    >
                        <Row>
                            <div className="modal_tree-administrative">
                                <div className="text-bold-5">
                                    <i>* L???a ch???n File:</i>
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
                        H???y
                    </Button>
                    <Button
                        disabled={state.isCreatingLive}
                        color="primary"
                        size="md"
                        onClick={handleCreateLiveWithFile}
                    >
                        X??c nh???n
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