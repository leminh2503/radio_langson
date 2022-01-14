import React, {useEffect, useRef, useState} from 'react';
import moment                               from "moment";
import {MenuOutlined}                       from "@ant-design/icons";
import {useDispatch, useSelector}           from "react-redux";

import CustomTable   from "../../../Components/CustomTag/CustomTable";
import {openSidebar} from "../../../Redux/Actions/appActions";
import apiHistory    from "../../../Api/History/History";
import FilterBar     from "../../../Components/CustomTag/FilterBar";

const HistoryWork = () => {
    const dateFormat = useRef("YYYY-MM-DDTHH:mm:ss").current;

    const dispatch = useDispatch();

    const user = useSelector(state => state.user);

    const admCodeOfUser = user?.administrativeCode?.code ?? "";

    const mountedComponent = useRef(false);

    const pageAndSize = useRef({
        currentPage: 1,
        size: 100,
        total: 0
    });

    const isFirstTime = useRef(true);

    const datetime = useRef({
        from: moment().startOf('month'),
        to: moment().endOf('month')
    });

    const searchString = useRef('');

    const columns = [
        {
            title: 'STT',
            align: 'center',
            width: (pageAndSize.current.currentPage - 1) * pageAndSize.current.size > 1000000 ? 150 : 100,
            render: (_, __, i) => i + 1 + ((pageAndSize.current.currentPage - 1) * pageAndSize.current.size)
        },
        {
            title: 'Họ tên',
            align: 'center',
            width: 200,
            dataIndex: ['user', 'fullName'],
            shouldCellUpdate: () => false
        },
        {
            title: 'Hoạt động',
            align: 'center',
            dataIndex: ['action'],
            width: 320,
            shouldCellUpdate: () => false
        },
        {
            title: 'Thời gian',
            align: 'center',
            width: 150,
            shouldCellUpdate: () => false,
            render: (_, data) => moment(data?.created).format("DD/MM/YYYY HH:mm:ss")
        },
        {
            title: 'Đơn vị',
            align: 'center',
            width: 200,
            shouldCellUpdate: () => false,
            render: (_, data) => data?.administrativeCode?.nameWithType ?? ""
        }
    ];

    const admCode = useRef({
        isDPT: false,
        value: ''
    });

    const timeoutSearch = useRef(null);

    const [state, setState] = useState({
        data: [],
        isLoading: true
    });

    const [startFilter, setStartFilter] = useState(false);

    const getHistory = () => {
        setState(prev => ({...prev, isLoading: true}));
        apiHistory.getHistory({
            page: pageAndSize.current.currentPage,
            page_size: pageAndSize.current.size,
            administrative_code: admCode.current.value !== '' ? admCode.current.value : admCodeOfUser,
            created__gte: datetime.current.from ? datetime.current.from.format(dateFormat) : undefined,
            created__lte: datetime.current.to ? datetime.current.to.format(dateFormat) : undefined,
            search: searchString.current ? searchString.current : undefined
        }, (err, res, totalPage) => {
            if (res && mountedComponent.current) {
                if (isFirstTime.current) {
                    isFirstTime.current = false;
                }
                pageAndSize.current.total = totalPage;
                setState(prev => ({
                    ...prev,
                    data: res,
                    isLoading: false
                }));
            } else if (mountedComponent.current) {
                setState(prev => ({
                    ...prev,
                    isLoading: false
                }));
            }
        });
    };

    const openChangeDatePicker = (visible, {from, to}) => {
        if (!visible) {
            datetime.current = {from, to};
            setTimeout(() => {
                setStartFilter(!startFilter);
            }, from === null || to === null ? 0 : 350);
        }
    };

    const onSearch = (value) => {
        searchString.current = value;
        setStartFilter(!startFilter);
    };

    const onChangeSearch = (e) => {
        const value = e.target.value;
        if (timeoutSearch.current) {
            clearTimeout(timeoutSearch.current);
        }
        timeoutSearch.current = setTimeout(() => {
            onSearch(value);
        }, 700);
    };

    useEffect(() => {
        mountedComponent.current = true;
        getHistory();
        return () => {
            mountedComponent.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isFirstTime.current) return;
        pageAndSize.current.currentPage = 1;
        setState(prev => ({
            ...prev,
            isLoading: true
        }));
        getHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startFilter]);

    return (
        <div className="history-work">
            <div className="d-flex align-items-center border-bottom pb-1 custom-button-menu">
                <MenuOutlined
                    className="icon-menu"
                    onClick={() => {
                        dispatch(openSidebar());
                    }}
                />
                <span className="font-weight-bold ml-2">
                    Lịch sử hoạt động
                </span>
            </div>
            <div className="mt-2">
                <FilterBar
                    searchBox
                    showDatetimeFilter
                    searchString={searchString.current}
                    setAdmCode={(value) => admCode.current = value}
                    startFilter={() => setStartFilter(!startFilter)}
                    onSearchString={onSearch}
                    openChangeDatePicker={openChangeDatePicker}
                    onChangeSearch={onChangeSearch}
                    showAdministrative={user?.role?.id === 1} // Admin
                />
            </div>
            <CustomTable
                isLoading={state.isLoading}
                columns={columns}
                data={state.data}
                scrollY="calc(100vh - 255px)"
                pagination={{
                    total: pageAndSize.current.total * pageAndSize.current.size,
                    current: pageAndSize.current.currentPage,
                    pageSize: pageAndSize.current.size,
                    onChange: (page) => {
                        pageAndSize.current.currentPage = page;
                        setState(prev => ({...prev, isLoading: true}));
                        getHistory();
                    }
                }}
            />
        </div>
    );
};

export default HistoryWork;
