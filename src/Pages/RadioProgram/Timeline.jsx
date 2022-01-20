import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    Day,
    DragAndDrop,
    Inject,
    Month,
    Resize,
    ResourceDirective,
    ResourcesDirective,
    ScheduleComponent,
    TimelineViews,
    ViewDirective,
    ViewsDirective,
    Week
}                                                    from "@syncfusion/ej2-react-schedule";
import {L10n, loadCldr}                              from "@syncfusion/ej2-base";
import moment                                        from "moment";
import {Modal, Row, Spin, Tooltip}                   from "antd";
import {SettingOutlined}                             from "@ant-design/icons";
import {FontAwesomeIcon}                             from "@fortawesome/react-fontawesome";

import useModalManager      from "../../Components/ModalManger/useModalManager";
import Alert                from "../../Utils/Notify/Alert";
import {isEmpty}            from "../../Utils";
import ModalFile            from "./Modal/ModalFile";
import Notify               from "../../Utils/Notify/Notify";
import ModalForward         from "./Modal/ModalForward";
import apiProgram           from "../../Api/Program/Program";
import apiCalendar          from "../../Api/Calendar/Calendar";
import {
    _emeStatus,
    _fieldsMapEj2Schedule,
    _listStatusCalendar as listIcons,
    _liveStatus,
    convertOwnerIdProgram as convertOwnerId,
    convertTimeProgram as convertTime,
    listButtonsHeaderQuickPopupProgram,
    listButtonsHeaderQuickPopupProgramEmeLiveCalendar,
    onActionBeginProgram as onActionBegin,
    onPopupOpenProgram as onPopupOpen
}                           from "./Etc/Etc";
import ModalSizeTimeline    from "./Modal/ModalSizeTimeline";
import ModalConfirmOverride from "./Modal/ModalConfirmOverride";

loadCldr(
    require('cldr-data/supplemental/numberingSystems.json'),
    require('cldr-data/main/vi/ca-gregorian.json'),
    require('cldr-data/main/vi/numbers.json'),
    require('cldr-data/main/vi/timeZoneNames.json')
);

L10n.load({
    'vi': {
        'schedule': {
            'save': 'Tạo mới',
            'saveButton': 'Xác nhận',
            'cancelButton': 'Đóng',
            'deleteButton': 'Xóa',
            'newEvent': 'Thêm chương trình',
            'moreDetails': 'Nâng cao',
            'repeat': 'Lặp lại',
            'editEvent': 'Sửa thông tin chương trình',
            'addTitle': "Thêm nội dung",
            'allDay': "Cả ngày",
            'delete': "Xóa",
            "cancel": "Hủy",
            "Sun": "Chủ nhật",
            'close': "Đóng",
            "edit": "Sửa"
        }
    }
});

function Timeline(props) {
    const {
        scheduleObj,
        stateRef,
        ownerData,
        dataProgram,
        modalNewForward,
        showWarning,
        disabledSchedule,
        isDefaultCalendar,
        isChangedStatusCalendar,
        isEmeCalendar,
        selectedCalendar
    } = props;

    const dateSchedule = selectedCalendar?.date_schedule ?? "";

    const selectedProgram = useRef({});

    const dateDroppedItem = useRef('');

    const isLive = useRef(false);

    const isDragging = useRef(false);

    const firstWarning = useRef(false);

    const editedOverride = useRef({editMode: false, programId: null});

    const allEventListener = useRef([]);

    const [visibleModalEditForward, , openModalEditForward, closeModalEditForward] = useModalManager();

    const [visibleModalCreate, , openModalCreate, closeModalCreate] = useModalManager();

    const [visibleModalCreateOverride, , openModalCreateOverride, closeModalCreateOverride] = useModalManager();

    const [visibleModalSizeTimeline, , openModalSizeTimeline, closeModalSizeTimeline] = useModalManager();

    const [visibleModalEdit, , openModalEdit, closeModalEdit] = useModalManager();

    const [visibleModalOverride, , openModalOverride, closeModalOverride] = useModalManager();

    const [isChangedLockStatus, setIsChangedLockStatus] = useState(0);

    const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

    const [configTimeline, setConfigTimeline] = useState(
        JSON.parse(localStorage.getItem("configTimeline")) ?? {size: 100, lines: 6}
    );

    const [dataOverride, setDataOverride] = useState({
        dataRequest: {},
        dataResponse: []
    });

    // Schedule function
    const closeDialogSchedule = () => {
        scheduleObj.current.closeQuickInfoPopup();
    };

    const onSelect = (item) => {
        if (item?.data?.Guid) {
            selectedProgram.current = item.data;
        } else {
            selectedProgram.current = {};
        }
    };

    console.log(selectedCalendar)

    const handleCreateProgram = (dataModal, setIsLoadingModal) => {
        const dataRequest = {
            ...dataModal,
            id: selectedCalendar?.id ?? ""
        };
        apiProgram.createProgram(dataRequest, (err, res) => {
            if (res) {
                scheduleObj.current.addEvent({
                    ...res,
                    OwnerId: convertOwnerId(res),
                    ...convertTime(res)
                });
                if (visibleModalCreate) {
                    closeModalCreate();
                } else if (visibleModalCreateOverride) {
                    closeModalCreateOverride();
                } else if (modalNewForward.visible) {
                    modalNewForward.close();
                }
                Notify.success('Thêm chương trình thành công');
            } else {
                if (err.response.data.data?.length > 0) {
                    setDataOverride({
                        dataRequest,
                        dataResponse: err.response.data.data
                    });
                    openModalOverride();
                }
            }
            setIsLoadingModal(false);
        });
    };

    const handleEditProgram = (dataModal, setIsLoadingModal) => {
        const dataRequest = {
            ...dataModal,
            idSchedule: selectedProgram.current?.id
        };
        if (isEmpty(dataModal)) {
            if (visibleModalEdit) {
                closeModalEdit();
            } else if (visibleModalEditForward) {
                closeModalEditForward();
            }
            return;
        }
        apiProgram.editProgram(dataRequest, (err, res) => {
            if (res) {
                scheduleObj.current.saveEvent({
                    ...res,
                    OwnerId: convertOwnerId(res),
                    ...convertTime(res)
                });
                if (visibleModalEdit) {
                    closeModalEdit();
                } else if (visibleModalEditForward) {
                    closeModalEditForward();
                }
                Notify.success('Sửa chương trình thành công');
            } else {
                editedOverride.current = {editMode: true, programId: selectedProgram.current?.id};
                if (err.response.data.data?.length > 0) {
                    setDataOverride({
                        dataRequest,
                        dataResponse: err.response.data.data
                    });
                    openModalOverride();
                }
            }
            setIsLoadingModal(false);
        });
    };

    const handleDeleteProgram = () => {
        if (selectedProgram.current === null) return;
        closeDialogSchedule();
        Alert.confirm(`Xác nhận xóa chương trình: ${selectedProgram.current?.title} ?`, (check) => {
            if (check) {
                apiProgram.deleteProgram({
                    id: selectedProgram.current?.id
                }, (err) => {
                    if (!err) {
                        scheduleObj.current.deleteEvent(selectedProgram.current?.id);
                        selectedProgram.current = {};
                        Notify.success('Xóa chương trình thành công');
                        setTimeout(() => {
                            addEventDropNewProgram();
                            addEventDropOverrideProgram();
                        }, 800);
                    }
                });
            }
        });
    };

    const handleOpenModalEditProgram = () => {
        closeDialogSchedule();
        if (selectedProgram.current?.source_stream?.file) {
            openModalEdit();
        } else {
            openModalEditForward();
        }
    };

    const handleLockCalendar = (currentStatus) => {
        if (isEmeCalendar) {
            showWarning('live-eme');
            return;
        }
        if (disabledSchedule && !isDefaultCalendar) {
            showWarning();
            return;
        }
        const nextLockStatus = currentStatus === 2 ? 1 : 2;
        const text = nextLockStatus === 1 ? 'Khóa' : 'Mở khóa';
        Modal.confirm({
            title: 'Nhắc nhở',
            content: `Xác nhận ${text} lịch ?`,
            okText: "Xác nhận",
            onOk: () => {
                setIsLoadingCalendar(true);
                apiCalendar.lockCalendar({
                    id: selectedCalendar?.id,
                    lock_status: nextLockStatus
                }, (err) => {
                    if (!err) {
                        selectedCalendar.lock_status = nextLockStatus;
                        setIsChangedLockStatus(isChangedLockStatus + 1);
                        Notify.success(`${text} chương trình thành công`);
                    }
                    setIsLoadingCalendar(false);
                });
            }
        });
    };

    const handleChangeConfig = (value) => {
        setConfigTimeline(value);
    };

    const handleLockProgram = () => {
        closeDialogSchedule();
        Modal.confirm({
            title: 'Nhắc nhở',
            content: `Xác nhận ${selectedProgram?.current.lock_status === 1 ? 'mở' : 'khóa'} chương trình ${selectedProgram?.current.title}?`,
            okText: 'Xác nhận',
            onOk: () => {
                setIsLoadingCalendar(true);
                apiProgram.lockProgram({
                    id: selectedProgram.current?.id ?? "",
                    lock_status: selectedProgram?.current.lock_status === 1 ? 2 : 1
                }, (err, res) => {
                    if (res) {
                        scheduleObj.current.saveEvent({
                            ...res,
                            OwnerId: convertOwnerId(res),
                            ...convertTime(res)
                        });
                        Notify.success("Thao tác thành công");
                    }
                    setIsLoadingCalendar(false);
                });
            }
        });
    };

    const clearClassElementsGuid = () => {
        const elementsGuid = document.querySelectorAll("div[data-guid]");
        if (elementsGuid) elementsGuid.forEach(x => x.classList.remove("droppable-zone"));
    };

    // Event
    const addEventDropNewProgram = () => {
        // if (user?.role?.id === allRole.system) return;
        const elements = document.querySelectorAll("td[role='gridcell']");
        if (elements) {
            allEventListener.current.push({nodeList: elements});
            elements.forEach(ele => {
                ele.addEventListener('drop', (e) => {
                    dateDroppedItem.current = e.target.getAttribute("data-date");
                    if (e.target.classList.contains("droppable-zone")) {
                        e.target.classList.remove("droppable-zone");
                    }
                    if (stateRef.current?.draggingFile?.type === 'file') {
                        openModalCreate();
                    }
                });
                ele.addEventListener('dragenter', (e) => {
                    clearClassElementsGuid();
                    e.target.classList.add("droppable-zone");
                });
                ele.addEventListener('dragleave', (e) => {
                    if (e.target.classList.contains("droppable-zone")) {
                        e.target.classList.remove("droppable-zone");
                        clearClassElementsGuid();
                    }
                });
            });
        }
    };

    const addEventDropOverrideProgram = () => {
        const elements = document.querySelectorAll("div[data-guid]");
        const elementsHasClassETimeSlot = document.querySelectorAll(".e-time-slots");
        if (elementsHasClassETimeSlot) {
            allEventListener.current.push({nodeList: elementsHasClassETimeSlot});
            elementsHasClassETimeSlot.forEach(e =>
                e.addEventListener("dragenter", () => clearClassElementsGuid())
            );
        }
        if (elements) {
            allEventListener.current.push({nodeList: elements});
            elements.forEach(ele => {
                ele.addEventListener('drop', (e) => {
                    if (e.currentTarget.classList.contains("droppable-zone")) {
                        isDragging.current = true;
                        ele.click();
                        e.currentTarget.classList.remove("droppable-zone");
                        openModalCreateOverride();
                    }
                });
                ele.addEventListener('dragenter', (e) => {
                    if (!e.currentTarget.classList.contains("droppable-zone")) {
                        clearClassElementsGuid();
                        e.currentTarget.classList.add("droppable-zone");
                    }
                });
                ele.addEventListener('dragleave', (e) => {
                    const classList = e.target.classList;
                    if (
                        classList.contains("e-event-resize") ||
                        classList.contains("e-bottom-handler") ||
                        classList.contains("e-time") ||
                        classList.contains("e-subject")
                    ) {
                        return;
                    }
                    clearClassElementsGuid();
                    e.currentTarget.classList.remove("droppable-zone");
                });
            });
        }
    };

    const handleStopProgramLiveEme = () => {
        closeDialogSchedule();
        Modal.confirm({
            title: 'Nhắc nhở',
            content: `Xác nhận dừng chương trình ?`,
            okText: 'Xác nhận',
            onOk: () => {
                setIsLoadingCalendar(true);
                const func = _liveStatus.includes(selectedProgram.current?.source_stream ?? "") ? "endLive" : "endEme";
                apiProgram[func]({
                    id: selectedProgram.current?.id ?? ""
                }, (err, res) => {
                    if (res) {
                        Notify.success("Dừng chương trình thành công");
                    }
                    setIsLoadingCalendar(false);
                });
            }
        });
    };

    // Get data
    useEffect(() => {
        if (
            !visibleModalCreate ||
            !visibleModalEdit ||
            !visibleModalEditForward ||
            !visibleModalCreateOverride ||
            !modalNewForward.visible
        ) {
            if (disabledSchedule && !isDefaultCalendar && !firstWarning.current && !isEmeCalendar) {
                firstWarning.current = true;
                showWarning();
                return;
            }
            if (isEmeCalendar) {
                firstWarning.current = true;
                showWarning('live-eme');
                return;
            }
            setTimeout(() => {
                allEventListener.current = [];
                addEventDropNewProgram();
                addEventDropOverrideProgram();
            }, 800);
        }
        return () => {
            allEventListener.current.forEach(({nodeList}) => {
                nodeList.forEach(node => {
                    node.removeEventListener("dragenter", null);
                    node.removeEventListener("drop", null);
                    node.removeEventListener("dragleave", null);
                });
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        dataProgram,
        disabledSchedule,
        isDefaultCalendar,
        visibleModalCreate,
        visibleModalEdit,
        visibleModalEditForward,
        visibleModalCreateOverride,
        modalNewForward.visible,
        configTimeline.size,
        configTimeline.lines,
        isChangedLockStatus,
        isChangedStatusCalendar
    ]);

    // Schedule custom render
    const dataHeaderTemplate = () => {
        const datetime = moment(dateSchedule);

        const calendarLockStatus = selectedCalendar?.lock_status;

        const calendarStatus = selectedCalendar?.status;

        const indexLockStatus = listIcons.findIndex(i => i?.lock_status === calendarLockStatus);

        const indexStatus = listIcons.findIndex(i => i?.status === calendarStatus);

        const renderStatus = () => {
            switch (listIcons[indexStatus]?.status) {
                case 6:
                    return true;
                case 7:
                    return true;
                case 8:
                    return true;
                default:
                    return false;
            }
        };

        return (
            <Row className="header-day-date">
                {
                    isDefaultCalendar ?
                        <div className="header-day-date_left">
                            <Row className="date justify-content-center">
                                Ngày tạo: {datetime.format('DD/MM/YYYY')}
                            </Row>
                        </div>
                        :
                        <div className="header-day-date_left">
                            <div className="day">
                                {datetime.format('ddd')}
                            </div>
                            <div className="date">
                                Ngày {datetime.format('DD/MM/YYYY')}
                            </div>
                        </div>
                }
                <Row>
                    <Tooltip title="Tùy chỉnh hiển thị">
                        <div
                            className="mr-3 row-vertical-center header_day_date-right"
                            onClick={() => openModalSizeTimeline()}
                        >
                            <div>
                                <SettingOutlined/>
                            </div>
                        </div>
                    </Tooltip>
                    {
                        !selectedCalendar?.defaultCalendar && !selectedCalendar?.liveEmeCalendar &&
                        <Tooltip title={listIcons[indexLockStatus]?.title}>
                            <div
                                className="mr-3 row-vertical-center header_day_date-right"
                                onClick={() => handleLockCalendar(listIcons[indexLockStatus]?.lockStatus)}
                            >
                                <div className="lock-status">
                                    {
                                        indexLockStatus > -1 ? listIcons[indexLockStatus]?.icon : ""
                                    }
                                </div>
                            </div>
                        </Tooltip>
                    }
                    <Tooltip title={listIcons[indexStatus]?.title}>
                        <div className="mr-3 row-vertical-center header_day_date-right">
                            <div className="status" style={renderStatus() ? {color: "#9acd33"} : {}}>
                                {
                                    indexStatus > -1 ? listIcons[indexStatus]?.icon : ""
                                }
                            </div>
                        </div>
                    </Tooltip>
                </Row>
            </Row>
        );
    };

    const newData = useMemo(() => {
        if (!dataProgram) return [];
        return dataProgram.map(d => {
            const OwnerId = convertOwnerId(d);
            const datetime = convertTime(d);
            return {
                ...d,
                OwnerId,
                ...datetime
            };
        });
    }, [dataProgram]);

    const majorMinorSlotTemplate = (props) => moment(props.date).format("HH:mm");

    const customHeaderQuickPopups = (props) => {
        const visibleButton = !isEmeCalendar && !isDefaultCalendar;
        const listButtonsHeaderQuickPopup =
            isEmeCalendar || [..._emeStatus, ..._liveStatus].includes(props.source_stream?.sourceType) ?
                listButtonsHeaderQuickPopupProgramEmeLiveCalendar({
                    closeDialogSchedule,
                    handleStopProgram: handleStopProgramLiveEme
                })
                :
                listButtonsHeaderQuickPopupProgram({
                    props,
                    visibleButton,
                    handleLockProgram,
                    handleOpenModalEditProgram,
                    handleDeleteProgram,
                    closeDialogSchedule
                });

        return (
            <>
                <div className="e-header-icon-wrapper">
                    {
                        listButtonsHeaderQuickPopup.map(({visible, title, onClick, icon, className}, i) => (
                            visible &&
                            <button
                                key={i}
                                className="e-icons e-btn e-lib e-flat e-round e-small e-icon-btn"
                                title={title}
                                onClick={onClick}
                            >
                                <span className={`e-btn-icon e-icons ${className}`}>
                                    {icon ? <FontAwesomeIcon icon={icon}/> : ''}
                                </span>
                            </button>
                        ))
                    }
                </div>
                <div className="e-subject-wrap">
                    <div className="e-subject e-text-ellipsis">
                        {props.title}
                    </div>
                </div>
            </>
        );
    };

    const ScheduleWithProgram = useMemo(() => {
        return (
            <div
                className="timeline"
                onDragOver={(e) => e.preventDefault()}
            >
                <ScheduleComponent
                    cssClass="schedule-cell-dimension"
                    locale="vi"
                    firstDayOfWeek={1}
                    ref={t => scheduleObj.current = t}
                    dragStart={(args) => args.cancel = true}
                    resizeStart={(args) => args.cancel = true}
                    eventSettings={{dataSource: newData, fields: _fieldsMapEj2Schedule}}
                    dateHeaderTemplate={dataHeaderTemplate}
                    select={onSelect}
                    popupOpen={(args) => onPopupOpen(args, isDragging, selectedProgram)}
                    actionBegin={onActionBegin}
                    selectedDate={moment(dateSchedule)}
                    quickInfoTemplates={{header: customHeaderQuickPopups}}
                    timeScale={{
                        enable: true,
                        interval: 60,
                        slotCount: configTimeline?.lines,
                        minorSlotTemplate: majorMinorSlotTemplate,
                        majorSlotTemplate: majorMinorSlotTemplate
                    }}
                >
                    <ViewsDirective>
                        <ViewDirective
                            isSelected
                            startHour="4:00"
                            option="Day"
                            dateFormat="dd/MM/yyyy"
                        />
                    </ViewsDirective>
                    <ResourcesDirective>
                        <ResourceDirective
                            field="OwnerId"             // field of data
                            title="Nguồn phát"
                            name="Owners"
                            dataSource={ownerData}
                            textField="ownerText"
                            idField="id"                // id of array colors
                            colorField="ownerColor"     // field show color of array colors
                        />
                    </ResourcesDirective>
                    <Inject services={[Week, Day, Month, TimelineViews, DragAndDrop, Resize]}/>
                </ScheduleComponent>
            </div>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newData, isChangedStatusCalendar, isChangedLockStatus, configTimeline.lines, configTimeline.size]);

    return (
        <Spin spinning={isLoadingCalendar} tip="Đợi trong giây lát...">
            {ScheduleWithProgram}
            <ModalFile
                isOpen={visibleModalCreate}
                onClose={closeModalCreate}
                onChange={handleCreateProgram}
                isLive={isLive}
                dataEdit={stateRef.current.draggingFile}
                dateDroppedItem={dateDroppedItem}
            />
            <ModalFile
                isOpen={visibleModalEdit}
                onClose={closeModalEdit}
                onChange={handleEditProgram}
                typeModal="edit"
                dataEdit={selectedProgram.current}
                editedOverride={editedOverride}
            />
            <ModalFile
                isOpen={visibleModalCreateOverride}
                onClose={closeModalCreateOverride}
                onChange={handleCreateProgram}
                dataEdit={stateRef.current.draggingFile}
                dataProgram={selectedProgram.current}
            />
            <ModalForward
                isOpen={modalNewForward.visible}
                onChange={handleCreateProgram}
                onClose={modalNewForward.close}
            />
            <ModalForward
                isOpen={visibleModalEditForward}
                onChange={handleEditProgram}
                onClose={closeModalEditForward}
                typeModal="edit"
                dataEdit={selectedProgram}
            />
            <ModalSizeTimeline
                visible={visibleModalSizeTimeline}
                onOk={handleChangeConfig}
                closeModal={closeModalSizeTimeline}
                value={configTimeline}
            />
            <ModalConfirmOverride
                scheduleObj={scheduleObj}
                visible={visibleModalOverride}
                data={dataOverride}
                onCancel={closeModalOverride}
                closeModalCreate={closeModalCreate}
                closeModalEdit={closeModalEdit}
                editedOverride={editedOverride}
            />
        </Spin>
    );
}

function areEqual(prevProps, nextProps, a) {

}

export default React.memo(Timeline, areEqual);
