import React, {useRef, useState}                                 from 'react';
import {Breadcrumb, Button, Dropdown, Menu, Modal, Row, Tooltip} from "antd";
import {useHistory}                                              from "react-router-dom";
import {MenuOutlined, SettingOutlined, UnorderedListOutlined}    from "@ant-design/icons";
import {useDispatch, useSelector}                                from "react-redux";

import Timeline        from "./Timeline";
import RepeatCalendar  from "../BroadcastCalendar/Modal/RepeatCalendar";
import useModalManager from "../../Components/ModalManger/useModalManager";
import apiCalendar     from "../../Api/Calendar/Calendar";
import Notify          from "../../Utils/Notify/Notify";
import Live            from "../BroadcastCalendar/Modal/Live";
import {openSidebar}   from "../../Redux/Actions/appActions";
import {
    _statusCalendar,
    listActionsButtonActions as _listActions,
    ownerDataProgram as _ownerData,
    showWarningCalendar as showWarning
}                      from "./Etc/Etc";

const Schedule = React.memo((props) => {
    // Variables
    const {
        stateRef,
        dataProgram,
        historyState,
        backHome,
        scheduleObj,
        disabledSchedule,
        isEmeCalendar,
        selectedCalendar,
        fetchProgramContinuously
    } = props;

    const {WAIT_FOR_CONFIRM_LEVEL_1, WAIT_FOR_CONFIRM_LEVEL_2, CONFIRMED_1, CONFIRMED_2, CANCEL} = _statusCalendar;

    const user = useSelector(state => state.user);

    const role = user?.role?.id ?? "";

    const division = user?.administrativeCode?.division ?? "";

    const history = useHistory();

    const dispatch = useDispatch();

    const isDefaultCalendar = selectedCalendar?.defaultCalendar;

    const ownerData = useRef(_ownerData(division)).current;


    // State
    const [state, setState] = useState({isChangedStatusCalendar: 0});

    const [visibleModalRepeatSchedule, , openModalRepeatSchedule, closeModalRepeatSchedule] = useModalManager();

    const [visibleModalForward, , openModalForward, closeModalForward] = useModalManager();

    const [visibleModalLive, , openModalLive, closeModalLive] = useModalManager();

    // Function
    const showNotify = (nextStatus) => {
        const statusCalendar = selectedCalendar?.status;
        switch (statusCalendar) {
            case 2 :
                if (nextStatus !== WAIT_FOR_CONFIRM_LEVEL_1 && statusCalendar !== 5) {
                    Notify.error("L???ch ch??a y??u c???u duy???t");
                    return true;
                }
                break;
            case 3:
                if (nextStatus !== CONFIRMED_1 && nextStatus !== WAIT_FOR_CONFIRM_LEVEL_2 && nextStatus !== CANCEL) {
                    Notify.error("L???ch ??ang ch??? ph?? BBT duy???t");
                    return true;
                }
                break;
            case 4:
                if (nextStatus !== CONFIRMED_2 && nextStatus !== CANCEL) {
                    Notify.error("L???ch ??ang ch??? tr?????ng BBT duy???t");
                    return true;
                }
                break;
            case 5:
                if (nextStatus !== WAIT_FOR_CONFIRM_LEVEL_1) {
                    Notify.error("L???ch ??ang kh??ng ???????c duy???t");
                    return true;
                }
                return false;
            case 7:
                Notify.error("L???ch ???? ???????c ph?? BBT duy???t");
                return true;
            case 8:
                Notify.error("L???ch ???? ???????c tr?????ng BBT duy???t");
                return true;
            default:
                return false;
        }
    };

    const changeStatusCalendar = (status) => {
        selectedCalendar.status = status;
        setState(prev => ({...prev, isChangedStatusCalendar: state.isChangedStatusCalendar + 1}));
    };

    const handleRequestConfirmCalendar = () => {
        if (showNotify(WAIT_FOR_CONFIRM_LEVEL_1)) return;
        Modal.confirm({
            title: 'Nh???c nh???',
            content: 'X??c nh???n y??u c???u duy???t l???ch ?',
            okText: 'X??c nh???n',
            cancelText: 'H???y b???',
            onOk: () => {
                apiCalendar.requestDeputy(selectedCalendar?.id ?? "", (err, res) => {
                    if (res) {
                        changeStatusCalendar(WAIT_FOR_CONFIRM_LEVEL_1);
                        Notify.success("Y??u c???u duy???t l???ch th??nh c??ng");
                    }
                });
            }
        });
    };

    const handleChangeStatusCalendar = (nextStatus) => {
        if (showNotify(nextStatus)) return;
        Modal.confirm({
            title: 'Nh???c nh???',
            content: `X??c nh???n ${nextStatus === CONFIRMED_1 || nextStatus === CONFIRMED_2 ? '' : 'kh??ng'} duy???t l???ch ?`,
            okText: 'X??c nh???n',
            cancelText: 'H???y b???',
            onOk: () => {
                apiCalendar.changeStatusCalendar({
                    id: selectedCalendar?.id ?? "",
                    status: nextStatus
                }, (err, res) => {
                    if (res) {
                        changeStatusCalendar(nextStatus);
                        Notify.success("Thao t??c th??nh c??ng");
                    }
                });
            }
        });
    };

    const handleForwardToEditor = (nextStatus) => {
        if (showNotify(nextStatus)) return;
        Modal.confirm({
            title: 'Nh???c nh???',
            content: 'X??c nh???n chuy???n ph?? duy???t cho Tr?????ng BBT ?',
            okText: 'X??c nh???n',
            cancelText: 'H???y b???',
            onOk: () => {
                apiCalendar.requestEditor(selectedCalendar?.id ?? "", (err, res) => {
                    if (res) {
                        changeStatusCalendar(nextStatus);
                        Notify.success("Thao t??c th??nh c??ng");
                    }
                });
            }
        });
    };

    // Render
    const listActions = _listActions({
        role,
        isDefaultCalendar,
        disabledSchedule,
        openModalLive,
        openModalRepeatSchedule,
        openModalForward,
        division,
        handleRequestConfirmCalendar,
        handleChangeStatusCalendar,
        handleForwardToEditor
    });

    const renderMenuDescription = (
        <Menu className="my-2 info-radio border p-2">
            {
                ownerData.map(({ownerText, ownerColor, visible}, index) => (
                    visible &&
                    <Menu.Item className="d-flex my-1 mr-2" key={index}>
                        <div style={{width: "70px", backgroundColor: ownerColor}} className="mr-2">&nbsp;</div>
                        <span className="text-bold-5">{ownerText}</span>
                    </Menu.Item>
                ))
            }
        </Menu>
    );

    const renderMenuActions = (
        <Menu>
            {
                listActions.map(({label, icon, visible, onClick}, i) => (
                    visible &&
                    <Menu.Item
                        key={i}
                        icon={icon}
                        onClick={onClick}
                    >
                        {label}
                    </Menu.Item>
                ))
            }
        </Menu>
    );

    return (
        <div className="schedule">
            <Row className="justify-content-between border-bottom mb-2 pb-2">
                <div className="row-all-center mt-1">
                    <Tooltip title="Menu">
                        <MenuOutlined
                            className="icon-menu mr-2"
                            onClick={() => {
                                dispatch(openSidebar());
                            }}
                        />
                    </Tooltip>
                    <Breadcrumb className="font-size-1rem">
                        <Breadcrumb.Item
                            className="text-bold-5"
                            onClick={() => history.push("/broadcast-calendar", {...historyState})}
                        >
                            <a>Qu???n l?? l???ch ph??t</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item className="text-bold-5">
                            {selectedCalendar?.adTree?.title ?? 'Kh??ng t??n'}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <Row>
                    <Dropdown
                        trigger="click"
                        overlay={renderMenuDescription}
                        className="row-all-center mr-2 mt-1"
                    >
                        <Button icon={<UnorderedListOutlined/>}>
                            Ch?? th??ch
                        </Button>
                    </Dropdown>
                    {
                        !isEmeCalendar &&
                        <Dropdown
                            trigger="click"
                            overlay={renderMenuActions}
                            className="row-all-center mt-1"
                        >
                            <Button icon={<SettingOutlined/>}>
                                H??nh ?????ng
                            </Button>
                        </Dropdown>
                    }
                </Row>
            </Row>
            <Timeline
                fetchProgramContinuously={fetchProgramContinuously}
                scheduleObj={scheduleObj}
                ownerData={ownerData}
                stateRef={stateRef}
                dataProgram={dataProgram}
                backHome={backHome}
                modalNewForward={{visible: visibleModalForward, close: closeModalForward}}
                showWarning={showWarning}
                disabledSchedule={disabledSchedule}
                isDefaultCalendar={isDefaultCalendar}
                isChangedStatusCalendar={state.isChangedStatusCalendar}
                isEmeCalendar={isEmeCalendar}
                selectedCalendar={selectedCalendar}
            />
            {
                !isEmeCalendar &&
                <>
                    <RepeatCalendar
                        isOpen={visibleModalRepeatSchedule}
                        onClose={closeModalRepeatSchedule}
                        inRadioProgram
                        selectedCalendar={selectedCalendar}
                    />
                    <Live
                        isOpen={visibleModalLive}
                        onClose={closeModalLive}
                        selectedCalendar={selectedCalendar ?? []}
                    />
                </>
            }
        </div>
    );
});

export default Schedule;
