import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    faExclamationTriangle,
    faInfoCircle,
    faPen,
    faPlus,
    faPowerOff,
    faSyncAlt,
    faFileExcel,
    faVolumeMute,
    faVolumeUp,
    faTrash
}                                                                 from '@fortawesome/free-solid-svg-icons';
import {faTimesCircle}                                            from '@fortawesome/free-regular-svg-icons';
import {Row, Select, Tooltip, Slider, Col}                        from 'antd';
import {useSelector}                                              from 'react-redux';
import moment                                                     from 'moment';
import {FontAwesomeIcon}                                          from '@fortawesome/react-fontawesome';
import {faPlayCircle, faStopCircle}                               from '@fortawesome/free-regular-svg-icons';
import ActionBar                                                  from '../../Components/CustomTag/ActionBar';
import CustomTable                                                from '../../Components/CustomTag/CustomTable';
import useModalManager                                            from '../../Components/ModalManger/useModalManager';
import Notify                                                     from '../../Utils/Notify/Notify';
import apiEquipment                                               from '../../Api/Equipment/Equipment';
import Alert                                                      from '../../Utils/Notify/Alert';
import ModalDetails                                               from './Modal/ModalDetails';
import ModalEquipment                                             from './Modal/ModalEquipment';
import Map                                                        from './Map';
import {defaultDivision}                                          from '../../Config/division';

export const statusDevices = {
    OFFLINE: {
        order: 5,
        desc: 'Tắt',
        status: -1,
        icon: <FontAwesomeIcon icon={faPowerOff} color="gray"/>
    },
    STOP: {
        order: 2,
        desc: 'Dừng phát',
        status: 0,
        icon: <FontAwesomeIcon icon={faStopCircle} color="#076990"/>
    },
    PLAYING: {
        order: 1,
        desc: 'Đang phát',
        status: 1,
        icon: <FontAwesomeIcon icon={faPlayCircle} color="green"/>
    },
    TRY_CONNECT: {
        order: 4,
        desc: 'Đang kết nối lại',
        status: 2,
        icon: <FontAwesomeIcon icon={faSyncAlt} color="#8D1EFF"/>
    },
    ERROR: {
        order: 3,
        desc: 'Lỗi',
        status: 3,
        icon: <FontAwesomeIcon icon={faExclamationTriangle} color="#FDE64B"/>
    },
    BAN: {
        order: 6,
        desc: 'Tạm khóa',
        status: 99,
        icon: <FontAwesomeIcon icon={faTimesCircle} color="#D0515B"/>
    }
};

const _sourceType = {
    FROM_FILE: 1,
    FORWARD: 3,
    LIVE_FROM_FILE: 5,
    LIVE_MIC: 6,
    EME_FROM_FILE: 7,
    EME_MIC: 8
};

const Main = React.memo(props => {
    const {
        listDataMain,
        isLoading,
        selectedFolder,
        handleOpenFolder,
        setListDataMain,
        statusDevice,
        onChangeStatusDevice,
        interval,
        selectedAd,
        fetchDevice,
        currentPagination
    } = props;

    const app = useSelector(state => state.app);

    const user = useSelector(state => state.user);

    const [
        visibleModalDetails,
        ,
        handleOpenModalDetails,
        handleCloseModalDetails
    ] = useModalManager();

    const [
        visibleModalNew,
        ,
        handleOpenModalNew,
        handleCloseModalNew
    ] = useModalManager();

    const [
        visibleModalEdit,
        ,
        handleOpenModalEdit,
        handleCloseModalEdit
    ] = useModalManager();

    const [selectedRow, setSelectedRow] = React.useState(null);

    const [isChangedPage, setIsChangedPage] = React.useState(false);

    const [isShowMap, setIsShowMap] = React.useState(false);

    const convertProgram = useCallback(device => {
        const sourceStream = device?.sourceStream ?? '';
        const sourceType = sourceStream?.sourceType ?? '';
        const {
            EME_FROM_FILE,
            EME_MIC,
            LIVE_FROM_FILE,
            FORWARD,
            FROM_FILE,
            LIVE_MIC
        } = _sourceType;
        if (device?.status === 1) {
            switch (sourceType) {
                case FROM_FILE:
                    return sourceStream.file?.title;
                case FORWARD:
                    return 'Tiếp sóng ' + sourceStream?.channel?.title;
                case LIVE_FROM_FILE:
                    return `Phát trực tiếp ${sourceStream.file.title}`;
                case LIVE_MIC:
                    return 'Trực tiếp Mic';
                case EME_FROM_FILE:
                    return `Phát khẩn cấp ${sourceStream.file.title}`;
                case EME_MIC:
                    return 'Khẩn cấp Mic';
                default:
                    const string = 'Tiếp sóng';
                    const {province, district, wards} = defaultDivision;
                    switch (sourceStream.division) {
                        case province:
                            return string + ' Tỉnh';
                        case district:
                            return string + ' Quận/Huyện';
                        case wards:
                            return string + ' Phường/Xã/Thị trấn';
                        default:
                            return '';
                    }
            }
        }
        return '';
    }, []);

    const onRow = useCallback(
        record => {
            return {
                onClick: () => {
                    if (record?.id !== selectedRow) {
                        setSelectedRow(record?.id);
                        return;
                    }
                    setSelectedRow(null);
                },
                onDoubleClick: () => {
                    if (selectedRow === null) {
                        Notify.error('Vui lòng chọn 1 thiết bị');
                        return;
                    }
                    setSelectedRow(record?.id);
                    handleOpenModalDetails();
                }
            };
        },
        [selectedRow, handleOpenModalDetails]
    );

    const handleCreateEquipment = useCallback(
        (dataModal, setIsLoading) => {
            apiEquipment.createEquipment(
                {
                    administrativeCode: selectedFolder?.code ?? '',
                    ...dataModal
                },
                (err, res) => {
                    if (res) {
                        handleCloseModalNew();
                        setIsLoading(false);
                        handleOpenFolder(selectedFolder);
                    } else {
                        setIsLoading(false);
                    }
                }
            );
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [selectedFolder, selectedRow]
    );

    const handleEditEquipment = useCallback(
        (dataModal, setIsLoading) => {
            apiEquipment.editEquipment(
                {
                    id: device?.id ?? '',
                    ...dataModal
                },
                (err, res) => {
                    if (res) {
                        handleCloseModalEdit();
                        setIsLoading(false);
                        setListDataMain(prev => {
                            const copyPrev = JSON.parse(JSON.stringify(prev));
                            copyPrev.data[copyPrev.id] = (copyPrev?.data[
                                copyPrev.id
                                ]).map(d => {
                                if (d.id === res?.id) {
                                    return res;
                                }
                                return d;
                            });
                            return copyPrev;
                        });
                        continueFetchDevice();
                    } else {
                        setIsLoading(false);
                    }
                }
            );
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [selectedRow]
    );

    const handleDeleteEquipment = useCallback(() => {
        Alert.confirm(`Xác nhận xóa thiết bị ${device?.mac} ?`, check => {
            if (check) {
                apiEquipment.deleteEquipment(
                    {
                        id: device?.id ?? ''
                    },
                    err => {
                        if (!err) {
                            setSelectedRow(null);
                            handleOpenFolder(selectedFolder);
                        }
                    }
                );
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRow]);

    useEffect(() => {
        currentPagination.current.page = 1;
        setIsChangedPage(true);
        setSelectedRow(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFolder,handleOpenModalDetails]);

    useEffect(() => {
        if (listDataMain?.id) {
            handleOpenFolder(selectedFolder, currentPagination.current.page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChangedPage,handleOpenModalDetails]);

    const handleExportEquipment = () => {
        apiEquipment.exportEquipment({}, (err, res) => {
            if (res) {
                const nameOutput = 'Ds_Thiet_Bi';
                const url = window.URL.createObjectURL(new Blob([res]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${nameOutput}.xlsx`);
                document.body.appendChild(link);
                link.click();
            }
        });
    };

    const listItem = useMemo(() => {
        return [
            {
                title: 'Chi tiết',
                icon: faInfoCircle,
                color: 'blue',
                visible: true,
                onClick: () => {
                    if (selectedRow === null) {
                        Notify.error('Vui lòng chọn 1 thiết bị');
                        return;
                    }
                    handleOpenModalDetails();
                }
            },
            {
                title: 'Thêm',
                icon: faPlus,
                color: 'green',
                visible: true,
                onClick: () => handleOpenModalNew()
            },
            {
                title: 'Sửa',
                icon: faPen,
                color: 'purple',
                visible: true,
                onClick: () => {
                    if (selectedRow === null) {
                        Notify.error('Vui lòng chọn 1 thiết bị');
                        return;
                    }
                    handleOpenModalEdit();
                    if (interval.current) {
                        clearInterval(interval.current);
                        setTimeout(() => {
                            setInterval(interval.current);
                        }, 5000);
                    }
                }
            },
            {
                title: 'Xóa',
                icon: faTrash,
                color: 'red',
                visible: true,
                onClick: () => {
                    if (selectedRow === null) {
                        Notify.error('Vui lòng chọn 1 thiết bị');
                        return;
                    }
                    handleDeleteEquipment();
                }
            },
            {
                title: 'Xuất Excel',
                icon: faFileExcel,
                color: 'green',
                visible: true,
                onClick: () => {
                    handleExportEquipment();
                }
            }
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedRow,
        handleDeleteEquipment,
        handleOpenModalDetails,
        handleOpenModalEdit,
        handleOpenModalNew,
        handleExportEquipment
    ]);

    const device = useMemo(() => {
        return selectedRow === null
            ? {}
            : listDataMain.data[listDataMain.id].filter(
                d => d.id === selectedRow
            )[0];
    }, [selectedRow, listDataMain.data, listDataMain.id]);

    const handleChangeVol = (value, data) => {
        apiEquipment.controlEquipment(
            {
                mac: data?.mac ?? '',
                message: `VOL=${value}`
            },
            err => {
                return;
            }
        );
    };

    const handleChangeVolIcon = data => {
        if (data?.volume > 0) {
            handleChangeVol(0, data);
        } else {
            handleChangeVol(20, data);
        }
    };

    const columns = useMemo(() => {
        return [
            {
                title: 'STT',
                width: currentPagination.current.page >= 200 ? 100 : 60,
                align: 'center',
                render: (_, __, i) =>
                    i +
                    1 +
                    (currentPagination.current.page - 1) *
                    currentPagination.current.pageSize
            },
            {
                title: 'Mã thiết bị',
                dataIndex: 'mac',
                width: 150
            },
            {
                title: 'Khu vực',
                dataIndex: ['administrativeCode', 'nameWithType'],
            },
            {
                title: 'Thông tin chi tiết',
                dataIndex: 'description'
            },
            {
                title: 'Trạng thái',
                align: 'center',
                width: 80,
                render: (_, data) => {
                    const item = Object.values(statusDevices).find(
                        d => d.status === data?.status
                    );
                    return item ? (
                        <Tooltip title={item.desc}>{item.icon}</Tooltip>
                    ) : (
                        <Tooltip title={statusDevices.OFFLINE.desc}>
                            {statusDevices.OFFLINE.icon}
                        </Tooltip>
                    );
                }
            },
            {
                title: 'Âm lượng',
                dataIndex: 'volume',
                render: (_, data, index) => {
                    return (
                        <div className="d-flex align-items-center w-100 px-1">
                            <FontAwesomeIcon
                                onClick={() => handleChangeVolIcon(data)}
                                icon={
                                    data?.volume === 0
                                        ? faVolumeMute
                                        : faVolumeUp
                                }
                                color="#185C98"
                            />
                            <div className="w-100 px-1">
                                <Slider
                                    value={
                                        data?.volume > 100 || data?.volume < 0
                                            ? 20
                                            : data?.volume
                                    }
                                    key={index}
                                    onChange={value =>
                                        setListDataMain(prev => {
                                            const copyPrev = JSON.parse(JSON.stringify(prev));
                                            copyPrev.data[copyPrev.id][index].volume = value
                                            return copyPrev;
                                        })
                                    }
                                    onAfterChange={value =>
                                        handleChangeVol(value, data)
                                    }
                                />
                            </div>
                        </div>
                    );
                }
            },
            {
                title: 'Chương trình hiện tại',
                render: (_, data) => {
                    if (data?.status === 0) {
                        return null;
                    }
                    return convertProgram(data);
                }
            },
            {
                title: 'Thông số môi trường',
                dataIndex: ['info']
            },
            {
                title: 'Ngày tạo',
                width: 150,
                render: (_, data) =>
                    moment(data?.created).format('DD/MM/YYYY HH:mm:ss')
            }
        ];
    }, [convertProgram,visibleModalDetails]);

    const rowSelection = useMemo(() => {
        return {
            selectedRowKeys: [selectedRow],
            type: 'radio',
            onChange: selectedRowKeys => {
                setSelectedRow(...selectedRowKeys);
            }
        };
    }, [selectedRow]);

    const continueFetchDevice = useCallback(() => {
        interval.current = setInterval(() => {
            fetchDevice(selectedAd, 1, true);
        }, 5 * 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchDevice, visibleModalDetails]);
    return (
        <div
            className={`equipment-management_size-content${
                user.role.id !== 1 ? ' w-100' : ''
            }`}>
            <Row
                className={`align-items-center justify-content-between${
                    !app.isOpenSidebar ? ' row-horizontal-center' : ''
                }`}>
                <ActionBar listItem={listItem}/>
                <div className="d-flex display-options-right">
                    <div className="row-vertical-center control-view mr-2">
                        <span className="mr-2 text-bold-5 display-title">
                            Hiển thị:
                        </span>
                        <Select
                            defaultValue={0}
                            onChange={() => setIsShowMap(!isShowMap)}>
                            <Select.Option value={0}>Danh sách</Select.Option>
                            <Select.Option value={1}>Bản đồ</Select.Option>
                        </Select>
                    </div>
                    <div className="row-vertical-center control-view">
                        <span
                            className="mr-2 text-bold-5"
                            style={{minWidth: '63px'}}>
                            Trạng thái:
                        </span>
                        <Select
                            defaultValue={statusDevice.current}
                            onChange={value => {
                                statusDevice.current = value;
                                onChangeStatusDevice(statusDevice.current);
                            }}>
                            <Select.Option value="all">Tất cả</Select.Option>
                            {Object.keys(statusDevices).map((key, i) => (
                                <Select.Option
                                    key={i}
                                    value={statusDevices[key].status}>
                                    {statusDevices[key].icon}
                                    <span className="ml-1">
                                        {statusDevices[key].desc}
                                    </span>
                                </Select.Option>
                            ))}
                        </Select>
                        {/*<Input.Search*/}
                        {/*    placeholder="Tìm kiếm..."*/}
                        {/*    onSearch={onSearch}*/}
                        {/*    style={{minWidth: 'calc(100% - 150px)'}}*/}
                        {/*/>*/}
                    </div>
                </div>
            </Row>
            <div
                className={`${
                    !app.isOpenSidebar ? 'row-horizontal-center' : ''
                }`}>
                {!isShowMap ? (
                    <CustomTable
                        isLoading={isLoading}
                        data={listDataMain.data[listDataMain.id]}
                        columns={columns}
                        scrollY="calc(100vh - 190px)"
                        rowSelection={rowSelection}
                        pagination={{
                            current: currentPagination.current.page,
                            pageSize: currentPagination.current.pageSize,
                            total:
                                listDataMain.totalPage *
                                currentPagination.current.pageSize,
                            onChange: page => {
                                currentPagination.current.page = page;
                                setIsChangedPage(!isChangedPage);
                            }
                        }}
                        // pagination={currentPagination.current.pageSize}
                        onRow={onRow}
                    />
                ) : (
                    <Map
                        data={listDataMain.data[listDataMain.id]}
                        setSelectedDevice={setSelectedRow}
                    />
                )}
            </div>
            <ModalEquipment
                onChange={handleCreateEquipment}
                onClose={handleCloseModalNew}
                isOpen={visibleModalNew}
            />
            <ModalEquipment
                dataEdit={device}
                typeModal="edit"
                onChange={handleEditEquipment}
                onClose={handleCloseModalEdit}
                isOpen={visibleModalEdit}
                continueFetchDevice={continueFetchDevice}
            />
            <ModalDetails
                isOpen={visibleModalDetails}
                onClose={handleCloseModalDetails}
                device={device}
                convertProgram={convertProgram}
                fetchDevice={fetchDevice}
            />
        </div>
    );
});

export default Main;
