import React             from "react";
import {Modal}           from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarMinus} from "@fortawesome/free-regular-svg-icons";
import {
    AudioOutlined,
    CarryOutOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DiffOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
    SendOutlined,
    UnlockOutlined,
    WifiOutlined
}                        from "@ant-design/icons";

import {allRole}                 from "../../../Config/role";
import {isEmpty}                 from "../../../Utils";
import {faBan, faLock, faUnlock} from "@fortawesome/free-solid-svg-icons";
import moment                    from "moment";

const _statusCalendar = {
    DEFAULT_CONFIG: 0,
    CREATING: 2,
    WAIT_FOR_CONFIRM_LEVEL_1: 3,
    WAIT_FOR_CONFIRM_LEVEL_2: 4,
    CANCEL: 5,
    CONFIRMED_AUTO: 6,
    CONFIRMED_1: 7,
    CONFIRMED_2: 8,
    LOCK: 1,
    UNLOCK: 2
};

const _configTimeline = {
    minutesAndLines: [
        {minutes: 30, lines: 2},
        {minutes: 20, lines: 3},
        {minutes: 15, lines: 4},
        {minutes: 10, lines: 6},
        {minutes: 5, lines: 12}
    ],
    sizePerLines: [
        {value: 25},
        {value: 50},
        {value: 75},
        {value: 100},
        {value: 200}
    ]
};

const _liveStatus = [5, 6]; // 6: file, 6: mic

const _emeStatus = [7, 8]; // 7: file, 8: mic

const _fieldsMapEj2Schedule = {
    id: 'id',
    subject: {name: 'title', title: 'Tên chương trình', disabled: true},
    startTime: {name: 'datetimeStart', title: 'Bắt đầu'},
    endTime: {name: 'datetimeEnd', title: 'Kết thúc'}
};

const _listStatusCalendar = [
    {
        title: 'Chưa yêu cầu duyệt',
        icon: <ExclamationCircleOutlined/>,
        status: _statusCalendar.CREATING
    },
    {
        title: 'Chờ phó BBT duyệt',
        icon: <ClockCircleOutlined/>,
        status: _statusCalendar.WAIT_FOR_CONFIRM_LEVEL_1
    },
    {
        title: 'Chờ trưởng BBT duyệt',
        icon: <ClockCircleOutlined/>,
        status: _statusCalendar.WAIT_FOR_CONFIRM_LEVEL_2
    },
    {
        title: 'Không được duyệt',
        icon: <CloseCircleOutlined/>,
        status: _statusCalendar.CANCEL
    },
    {
        title: 'Lịch tự động duyệt',
        icon: <CheckCircleOutlined/>,
        status: _statusCalendar.CONFIRMED_AUTO
    },
    {
        title: 'Phó BBT đã duyệt',
        icon: <CheckCircleOutlined/>,
        status: _statusCalendar.CONFIRMED_1
    },
    {
        title: 'Trưởng BBT đã duyệt',
        icon: <CheckCircleOutlined/>,
        status: _statusCalendar.CONFIRMED_2
    },
    {
        title: 'Lịch đang bị khóa',
        icon: <LockOutlined/>,
        lockStatus: _statusCalendar.LOCK
    },
    {
        title: 'Lịch có thể phát',
        icon: <UnlockOutlined/>,
        lockStatus: _statusCalendar.UNLOCK
    }
];

const ownerDataProgram = (division) => [
    {ownerText: 'Chương trình từ File', id: 'ss1', ownerColor: '#ffaa00', visible: true},
    {ownerText: 'Tiếp sóng VOV', id: 'ss3', ownerColor: '#7499e1', visible: true},
    // {
    //     ownerText: 'Tiếp sóng Tỉnh/Thành',
    //     id: 'ss41',
    //     ownerColor: '#F37121',
    //     visible: division === 2 || division === 3
    // },
    // {ownerText: 'Tiếp sóng Quận/Huyện', id: 'ss42', ownerColor: '#C70039', visible: division === 3},
    {ownerText: 'Trực tiếp/Khẩn cấp', id: 'ss56', ownerColor: '#EC5858', visible: true},
    {ownerText: 'Tạm dừng', id: 'lock', ownerColor: '#58ceec', visible: true}
];

const showWarningCalendar = (type) => {
    let msg;
    switch (type) {
        case 'live-eme':
            msg = 'Lịch chương trình khẩn cấp/trực tiếp chỉ được thao tác dừng chương trình đang phát';
            break;
        default:
            msg = 'Lịch của ngày cũ chỉ có thể xem, không thể thao tác';
            break;
    }
    return Modal.warning({
        title: 'Nhắc nhở',
        content: msg,
        okText: "Xác nhận"
    });
};

const listActionsButtonActions = ({
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
                                  }) => {
    return [
        {
            label: 'Phát trực tiếp',
            icon: <AudioOutlined/>,
            visible: division !== 1, // PROVINCE CODE: 1
            onClick: () => {
                openModalLive();
            }
        },
        {
            label: 'Lặp lịch hiện tại',
            icon: <DiffOutlined/>,
            visible: division === 1 && !isDefaultCalendar,
            onClick: () => {
                openModalRepeatSchedule();
            }
        },
        {
            label: 'Tiếp sóng',
            icon: <WifiOutlined/>,
            visible: true,
            onClick: () => {
                if (disabledSchedule && !isDefaultCalendar) {
                    return showWarningCalendar();
                }
                openModalForward();
            }
        },
        {
            label: 'Yêu cầu duyệt lịch',
            icon: <SendOutlined/>,
            visible: role === allRole.employee && division === 1,
            onClick: () => {
                if (disabledSchedule && !isDefaultCalendar) {
                    return showWarningCalendar();
                }
                handleRequestConfirmCalendar();
            }
        },
        {
            label: 'Duyệt lịch',
            icon: <CarryOutOutlined/>,
            visible: (role === allRole.chief || role === allRole.deputy) && division === 1,
            onClick: () => {
                if (disabledSchedule && !isDefaultCalendar) {
                    return showWarningCalendar();
                }
                handleChangeStatusCalendar(
                    role === allRole.chief ?
                        _statusCalendar.CONFIRMED_2
                        :
                        _statusCalendar.CONFIRMED_1
                );
            }
        },
        {
            label: 'Không duyệt lịch',
            icon: <FontAwesomeIcon icon={faCalendarMinus} className="mr-2"/>,
            visible: (role === allRole.chief || role === allRole.deputy) && division === 1,
            onClick: () => {
                if (disabledSchedule && !isDefaultCalendar) {
                    return showWarningCalendar();
                }
                handleChangeStatusCalendar(_statusCalendar.CANCEL);
            }
        },
        {
            label: 'Chuyển cho Trưởng BBT',
            icon: <SendOutlined/>,
            visible: role === allRole.deputy && division === 1,
            onClick: () => {
                if (disabledSchedule && !isDefaultCalendar) {
                    return showWarningCalendar();
                }
                handleForwardToEditor(_statusCalendar.WAIT_FOR_CONFIRM_LEVEL_2);
            }
        }
    ];
};

const convertOwnerIdProgram = (d) => {
    const ss = d?.sourceStream ?? "";
    if (d?.lockStatus === 1) {
        return "lock";
    }
    if (ss?.sourceType) {
        if (ss?.division) {
            return 'ss' + ss.sourceType + ss.division;
        } else if (ss?.channel?.id) {
            return 'ss3';
        } else if (ss.sourceType === 5 || ss.sourceType === 6 || ss.sourceType === 7 || ss.sourceType === 8) {
            return 'ss56';
        } else {
            return 'ss' + ss.sourceType;
        }
    }
};

const convertTimeProgram = (d) => {
    const dateSchedule = d?.broadcastCalendar?.dateSchedule ?? "";
    const timeEnd = d?.timeEnd ?? moment().format("HH:mm:ss");
    const timeStart = d?.timeStart ?? "";
    if (timeEnd && timeStart) {
        return {
            datetimeStart: `${dateSchedule}T${timeStart}`,
            datetimeEnd: `${dateSchedule}T${timeEnd}`
        };
    }
};

const onActionBeginProgram = (args) => {
    if (args.requestType === 'toolbarItemRendering') {
        args.items.forEach(item => {
            if (item.cssClass === "e-add") {
                item.cssClass += ' hidden-icon';
                // item.remove();
            } else if (item.cssClass === "e-today") {
                item.text = "Hôm nay";
            } else if (item.cssClass === "e-views e-timeline-day") {
                item.text = "Thời gian trong ngày";
            } else if (item.cssClass === "e-views e-day") {
                item.text = "Ngày";
            } else if (item.cssClass === "e-views e-week") {
                item.text = "Tuần";
            } else if (item.cssClass === "e-views e-month") {
                item.text = "Tháng";
            }
        });
    }
};

const onPopupOpenProgram = (args, isDragging, selectedProgram) => {
    if (isDragging.current) {
        args.cancel = true;
        isDragging.current = false;
    }
    if (args?.target?.classList?.contains("e-header-cells")) {
        args.cancel = true;
        return;
    }
    if (args.type === 'DeleteAlert' || args.type === 'Editor') {
        args.cancel = true;
    }
    if (isEmpty(selectedProgram.current)) {
        args.cancel = true;
    }
    const element = document.querySelector(".e-date-time-details.e-text-ellipsis") ?? "";
    if (element) {
        const {timeStart, timeEnd} = selectedProgram.current;
        if (timeStart && timeEnd) {
            const timeFromTo = element.innerHTML;
            const temp = timeFromTo.slice(0, timeFromTo.lastIndexOf("("));
            element.innerHTML = `${temp} (${timeStart} - ${timeEnd})`;
        }
    }
};

const listButtonsHeaderQuickPopupProgram = ({
                                                props,
                                                visible,
                                                handleLockProgram,
                                                handleOpenModalEditProgram,
                                                handleDeleteProgram,
                                                closeDialogSchedule
                                            }) => [
    {
        title: 'Khóa/ Mở chương trình',
        icon: props?.lockStatus === 1 ? faLock : faUnlock,
        className: 'e-lock-program',
        onClick: handleLockProgram,
        visible: !visible ?? false
    },
    {
        title: 'Sửa',
        className: 'e-edit-icon',
        onClick: handleOpenModalEditProgram,
        visible: !visible ?? false
    },
    {
        title: 'Xóa',
        className: 'e-delete-icon',
        onClick: handleDeleteProgram,
        visible: !visible ?? false
    },
    {
        title: 'Đóng',
        className: 'e-close-icon',
        onClick: closeDialogSchedule,
        visible: true
    }
];

const listButtonsHeaderQuickPopupProgramEmeLiveCalendar = ({handleStopProgram, closeDialogSchedule}) => [
    {
        title: 'Dừng chương trình',
        icon: faBan,
        className: 'e-ban-program',
        onClick: handleStopProgram,
        visible: true
    },
    {
        title: 'Đóng',
        className: 'e-close-icon',
        onClick: closeDialogSchedule,
        visible: true
    }
];

export {
    _statusCalendar,
    _configTimeline,
    _fieldsMapEj2Schedule,
    _listStatusCalendar,
    _liveStatus,
    _emeStatus,
    ownerDataProgram,
    showWarningCalendar,
    listActionsButtonActions,
    convertOwnerIdProgram,
    convertTimeProgram,
    onActionBeginProgram,
    onPopupOpenProgram,
    listButtonsHeaderQuickPopupProgram,
    listButtonsHeaderQuickPopupProgramEmeLiveCalendar
};
