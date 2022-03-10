import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Button, Row, Tabs, Tooltip, Modal}                        from 'antd';
import {useHistory}                                               from 'react-router-dom';
import moment                                                     from 'moment';
import {useSelector}                                              from 'react-redux';
import _                                                          from 'lodash';
import {
    DeleteOutlined,
    DiffOutlined,
    EditOutlined,
    InfoCircleOutlined,
    LockOutlined,
    UnlockOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined
}                                                                 from '@ant-design/icons';

import useModalManager                    from '../../Components/ModalManger/useModalManager';
import Live                               from './Modal/Live';
import Emergency                          from './Modal/Emergency';
import LiveAndEmergency                   from './ActionsBar/LiveAndEmergency';
import ActionsBar                         from './ActionsBar/ActionsBar';
import CustomTable                        from '../../Components/CustomTag/CustomTable';
import apiCalendar                        from '../../Api/Calendar/Calendar';
import Notify                             from '../../Utils/Notify/Notify';
import Alert                              from '../../Utils/Notify/Alert';
import DetailAdministrative               from './Modal/DetailAdministrative';
import {_listStatusCalendar, _liveStatus} from '../RadioProgram/Etc/Etc';
import RepeatCalendar                     from './Modal/RepeatCalendar';
import {defaultDivision}                  from '../../Config/division';

const BroadcastCalendar = React.memo(() => {
    const history = useHistory();

    const historyState = history.location.state;

    const user = useSelector(state => state.user);

    const division = user?.administrativeCode?.division;

    const dateFormat = useRef('YYYY-MM-DD').current;

    const page = useRef(historyState?.page ?? {total: 1, current: 1, size: 50});

    const admCode = useRef(
        historyState?.admCode ?? {isDPT: false, value: null}
    );

    const listArrayDivision = useRef([]);

    const currentAdCode = useRef([]);

    const searchString = useRef(historyState?.searchString ?? '');

    const currentAdTree = useRef(null);

    const [
        isOpenModalEmergency,
        ,
        handleOpenModalEmergency,
        handleCloseModalEmergency,
    ] = useModalManager();

    const [
        isOpenModalLive,
        ,
        handleOpenModalLive,
        handleCloseModalLive,
    ] = useModalManager();

    const [
        visibleModalAdTree,
        ,
        openModalAdTree,
        closeModalAdTree,
    ] = useModalManager();

    const [
        isOpenModalRepeatCalendar,
        ,
        openModalRepeatCalendar,
        closeModalRepeatCalendar,
    ] = useModalManager();

    const [state, setState] = useState({
        data: [],
        selectedRowKeys: historyState?.selectedCalendar?.id
            ? [historyState?.selectedCalendar?.id]
            : [],
        selectedCalendar: historyState?.selectedCalendar ?? null,
        isLoading: true,
        from: historyState?.from
            ? moment(historyState?.from)
            : moment().startOf('month'),
        to: historyState?.to
            ? moment(historyState?.to)
            : moment().endOf('month'),
        status: historyState?.status ?? 'all',
        tab: historyState?.isDefaultCalendar ? '2' : '1',
        isDefaultCalendar: historyState?.isDefaultCalendar ?? false,
        user: user
    });

    const rowSelection = {
        type: 'radio',
        selectedRowKeys: state.selectedRowKeys,
        onChange: (keys, data) => {
            setState(prev => ({
                ...prev,
                selectedRowKeys: keys,
                selectedCalendar: data[0],
            }));
        },
    };

    const pagination = {
        current: page.current.current,
        total: page.current.total * page.current.size,
        pageSize: page.current.size,
        onChange: currentPage => {
            page.current.current = currentPage;
            setState(prev => ({
                ...prev,
                isLoading: true,
                selectedRowKeys: [],
                selectedCalendar: null,
            }));
        },
    };

    const onRow = record => {
        return {
            onClick: e => {
                if (e.target.tagName !== 'DIV' && e.target.tagName !== 'TD')
                    return;
                setState(prev => ({
                    ...prev,
                    selectedRowKeys:
                        state.selectedRowKeys[0] === record.id
                            ? []
                            : [record.id],
                    selectedCalendar:
                        state.selectedRowKeys[0] === record.id ? null : record,
                }));
            },
            onDoubleClick: e => {
                if (e.target.tagName !== 'DIV' && e.target.tagName !== 'TD')
                    return;
                onPushPage(record);
            },
        };
    };

    const onSearchString = value => {
        searchString.current = value;
        if (state.isLoading) return;
        setState(prev => ({...prev, isLoading: true}));
    };

    const onPushPage = row => {
        const from = _.cloneDeep(state.from).format(dateFormat) ?? '';
        const to = _.cloneDeep(state.to).format(dateFormat) ?? '';
        history.push(
            `/radio-program/${state.selectedCalendar?.id ?? row?.id}`,
            {
                from,
                to,
                listArrayDivision: listArrayDivision.current,
                currentAdCode: currentAdCode.current,
                page: page.current,
                searchString: searchString.current,
                admCode: admCode.current,
                isDefaultCalendar: state.isDefaultCalendar,
                status: state.status,
            },
        );
    };

    const showNotify = () => {
        const options = {autoClose: 1500};
        if (state.isCreated) {
            Notify.success('Tạo lịch thành công', options);
        } else if (state.isDeleted) {
            Notify.success('Xóa lịch thành công', options);
        }
    };

    const changeCalendarStatus = (id, status) => {
        Alert.confirm(
            `Xác nhận ${status === 2 ? 'mở khóa lich' : 'khóa lịch'} ?`,
            check => {
                if (check) {
                    apiCalendar.lockCalendar(
                        {
                            id,
                            lockStatus: status,
                        },
                        (err, res) => {
                            if (res) {
                                setState(prev => ({
                                    ...prev,
                                    isLoading: true,
                                }));
                            }
                        },
                    );
                }
            },
        );
    };

    const reFetchData = useCallback(() => {
        setState(p => ({
            ...p,
            isLoading: true,
        }));
    }, []);

    const setIsGettingData = () => {
        page.current.current = 1;
        setState(prev => ({
            ...prev,
            selectedCalendar: null,
            selectedRowKeys: [],
            isLoading: true,
        }));
    };

    const onchangeTab = tab => {
        if (state.tab === tab) return;
        setTimeout(() => {
            page.current.current = 1;
            setState(prev => ({
                ...prev,
                tab,
                isDefaultCalendar: !state.isDefaultCalendar,
                isLoading: true,
                selectedCalendar: null,
                selectedRowKeys: [],
            }));
        }, 260);
    };

    const handleDeleteCalendar = calendar => {
        if (!calendar) return;
        Alert.confirm(
            `Xác nhận xóa lịch: ${calendar.adTree?.title} ?`,
            check => {
                if (check) {
                    apiCalendar.deleteCalendar(calendar?.id ?? '', err => {
                        if (!err) {
                            setState(prev => ({
                                ...prev,
                                selectedKeys: [],
                                selectedCalendar: null,
                                isLoading: true,
                            }));
                            Notify.success('Xóa lịch thành công');
                        }
                    });
                }
            },
        );
    };

    const handleUseActionCalendar = row => {
        setState(prev => ({
            ...prev,
            selectedRowKeys: [row.id],
            selectedCalendar: row,
        }));
    };

    const handleGetCalendar = () => {
        apiCalendar.listCalendar(
            {
                page: page.current.current,
                page_size: page.current.size,
                administrative_code:
                    admCode.current.value ?? user?.administrativeCode?.code,
                date_schedule__gte: state?.isDefaultCalendar
                    ? undefined
                    : state.from.format(dateFormat),
                date_schedule__lte: state?.isDefaultCalendar
                    ? undefined
                    : state.to.format(dateFormat),
                search: searchString.current,
                status: state.status === 'all' ? undefined : state.status,
                default_calendar: state?.isDefaultCalendar,
            },
            (err, res, totalPage) => {
                if (res) {
                    page.current.total = totalPage;
                    setState(p => ({
                        ...p,
                        data: res,
                        isLoading: false,
                        isCreated: false,
                        isDeleted: false,
                    }));
                    showNotify();
                } else {
                    setState(p => ({
                        ...p,
                        isLoading: false,
                    }));
                }
            },
        );
    };
    useEffect(() => {
        if (state.isLoading) {
            if (historyState) {
                history.replace();
            }
            handleGetCalendar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isLoading]);

    const handleChangeStatusCalendar = (id, user) => {
        Modal.confirm({
            title: 'Nhắc Nhớ',
            content: 'Xác nhận duyệt lịch',
            okText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onOk: () => {
                apiCalendar.changeStatusCalendar({
                    id,
                    status: user === 2 ? 8 : 7
                }, (err, res) => {
                    if (res) {
                        setState(prev => ({
                            ...prev,
                            data: [
                                ...prev.data,
                                prev.data[id] = res
                            ],
                            isLoading: true
                        }));
                        Notify.success("Duyệt lịch thành công");
                    }
                });
            }
        });
    };

    const handleRequestConfirmCalendar = (id) => {
        Modal.confirm({
            title: 'Nhắc Nhở',
            content: 'Xác nhận yêu cầu duyệt',
            okText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onOk: () => {
                apiCalendar.requestDeputy(id, (err, res) => {
                    if (res) {
                        setState(prev => ({
                            ...prev,
                            data: [
                                ...prev.data,
                                prev.data[id] = res
                            ],
                            isLoading: true
                        }));
                        Notify.success("Yêu cầu duyệt lịch thành công");
                    }
                });
            }
        });
    };

    const columns = useMemo(() => {
        return [
            {
                title: 'Tên lịch',
                dataIndex: ['adTree', 'title'],
                shouldCellUpdate: () => false,
            },
            {
                title: 'Trạng thái',
                render: (_, data) => {
                    const status = _listStatusCalendar.filter(
                        s => s.status === data?.status,
                    );
                    if (status?.length === 1) {
                        return (
                            <div className="row-vertical-center">
                                {status[0].icon}
                                <div className="ml-1">{status[0].title}</div>
                            </div>
                        );
                    }
                },
            },
            {
                title: state.tab === '1' ? 'Ngày phát lịch' : 'Ngày tạo lịch',
                align: 'center',
                shouldCellUpdate: () => false,
                render: (_, data) => {
                    return (
                        <label
                            className={
                                data?.dateSchedule ==
                                moment().format('YYYY-MM-DD')
                                    ? 'font-weight-bold'
                                    : ''
                            }>
                            {data?.dateSchedule
                                ? moment(data?.dateSchedule).format(
                                      'DD/MM/YYYY',
                                  )
                                : ''}
                        </label>
                    );
                },
            },
            {
                title: 'Khu vực',
                dataIndex: 'area',
                align: 'center',
                shouldCellUpdate: () => false,
                render: (_, data) => {
                    const {province, districts, wards, selected} = data?.adTree;
                    return (
                        <div className="row-horizontal-center">
                            <Button
                                disabled={
                                    !province &&
                                    districts.length === 0 &&
                                    wards.length === 0 &&
                                    selected.length === 0
                                }
                                className="row-all-center"
                                icon={
                                    <InfoCircleOutlined
                                        style={{svg: {width: '15px'}}}
                                    />
                                }
                                onClick={() => {
                                    currentAdTree.current = data?.adTree;
                                    openModalAdTree();
                                }}>
                                Xem chi tiết
                            </Button>
                        </div>
                    );
                },
            },
            {
                title: 'Thao tác',
                align: 'center',
                width: 250,
                fixed: 'right',
                render: (_, data) => {
                    const listButton = [
                        {
                            tooltip: `Nhấn để duyệt lịch`,
                            visible: (state?.user?.role?.id === 2 || state?.user?.role?.id === 3) && state?.user?.administrativeCode?.division === 1,
                            icon: <CheckCircleOutlined/>,
                            disabled: (state?.user?.role?.id === 2 && data?.status !== 4) || (state?.user?.role?.id === 3 && data?.status !== 3),
                            onClick: () => {
                                handleChangeStatusCalendar(data?.id, user?.role?.id);
                            }
                        },
                        {
                            tooltip: 'Nhấn để yêu cầu duyệt lịch',
                            visible: state?.user?.role?.id === 4 && state?.user?.administrativeCode?.division === 1,
                            disabled: data?.status !== 2,
                            icon: <SafetyCertificateOutlined/>,
                            onClick: () => {
                                handleRequestConfirmCalendar(data?.id);
                            }
                        },
                        {
                            tooltip: `Nhấn để ${
                                data?.lockStatus === 2
                                    ? 'khóa lịch'
                                    : 'mở khóa lịch'
                            }`,
                            disabled:
                                data?.adTree?.administrativeCode?.division !==
                                division,
                            icon:
                                data?.lockStatus === 2 ? (
                                    <UnlockOutlined />
                                ) : (
                                    <LockOutlined />
                                ),
                            visible: !state.isDefaultCalendar,
                            onClick: () =>
                                changeCalendarStatus(
                                    data?.id,
                                    data?.lockStatus === 2 ? 1 : 2,
                                ),
                        },
                        {
                            tooltip: data?.liveEmeCalendar
                                ? ''
                                : 'Nhấn để sửa lịch',
                            disabled: data?.liveEmeCalendar,
                            icon: <EditOutlined />,
                            visible: true,
                            onClick: () => onPushPage(data),
                        },
                        {
                            tooltip: data?.liveEmeCalendar
                                ? ''
                                : 'Nhấn để lặp lịch',
                            disabled: data?.liveEmeCalendar,
                            visible: !state.isDefaultCalendar,
                            icon: <DiffOutlined />,
                            onClick: () => openModalRepeatCalendar(),
                        },
                        {
                            tooltip: data?.liveEmeCalendar
                                ? ''
                                : 'Nhấn để xóa lịch',
                            disabled: data?.liveEmeCalendar,
                            visible: division === 1,
                            icon: <DeleteOutlined />,
                            onClick: () => handleDeleteCalendar(data),
                        },
                    ];
                    return (
                        // 2: open, 1: lock
                        <div className="row-all-center">
                            {listButton.map(
                                (
                                    {tooltip, disabled, onClick, icon, visible},
                                    i,
                                ) =>
                                    visible && (
                                        <Tooltip title={tooltip} key={i}>
                                            <Button
                                                className="mr-1"
                                                disabled={disabled}
                                                onClick={() => {
                                                    handleUseActionCalendar(
                                                        data,
                                                    );
                                                    onClick();
                                                }}
                                                icon={icon}
                                            />
                                        </Tooltip>
                                    ),
                            )}
                        </div>
                    );
                },
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.tab, state.from, state.to, state.status]);

    return (
        <div className="broadcast-calendar-base">
            <Row className="broadcast-calendar_toolbar justify-content-between border p-1 m-2">
                <ActionsBar
                    state={state}
                    page={page}
                    admCode={admCode}
                    setState={setState}
                    setIsGettingData={setIsGettingData}
                    onSearchString={onSearchString}
                    reFetchData={reFetchData}
                    listArrayDivision={listArrayDivision}
                    currentAdCode={currentAdCode}
                />
                <LiveAndEmergency
                    isDefaultCalendar={state.isDefaultCalendar}
                    setState={setState}
                    handleOpenModalEmergency={handleOpenModalEmergency}
                    handleOpenModalLive={handleOpenModalLive}
                />
            </Row>
            <Tabs
                className="m-2 border pb-1"
                centered
                defaultActiveKey={state.tab}
                style={{backgroundColor: 'white'}}
                onChange={onchangeTab}>
                <Tabs.TabPane key="1" tab="Lịch thường">
                    <Row className="broadcast-calendar_table border p-1 mx-1">
                        <CustomTable
                            isLoading={state.isLoading}
                            columns={columns}
                            data={state.data}
                            rowSelection={rowSelection}
                            pagination={pagination}
                            onRow={onRow}
                            scrollY="calc(100vh - 395px)"
                        />
                    </Row>
                </Tabs.TabPane>
                {division === defaultDivision.province && (
                    <Tabs.TabPane key="2" tab="Lịch mặc định">
                        <Row className="broadcast-calendar_table border p-1 mx-1">
                            <CustomTable
                                isLoading={state.isLoading}
                                columns={columns}
                                data={state.data}
                                pagination={pagination}
                                rowSelection={rowSelection}
                                onRow={onRow}
                                scrollY="calc(100vh - 395px)"
                            />
                        </Row>
                    </Tabs.TabPane>
                )}
            </Tabs>
            <Emergency
                isOpen={isOpenModalEmergency}
                onClose={handleCloseModalEmergency}
                selectedCalendar={state.selectedCalendar}
            />
            <Live
                isOpen={isOpenModalLive}
                onClose={handleCloseModalLive}
                selectedCalendar={state.selectedCalendar}
            />
            <DetailAdministrative
                visible={visibleModalAdTree}
                onClose={closeModalAdTree}
                currentAdTree={currentAdTree}
            />
            <RepeatCalendar
                isOpen={isOpenModalRepeatCalendar}
                onClose={closeModalRepeatCalendar}
                selectedCalendar={state?.selectedCalendar}
                reFetchData={reFetchData}
            />
        </div>
    );
});

export default BroadcastCalendar;
