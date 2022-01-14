import React, {useRef, useState}                         from 'react';
import {Button, DatePicker, Modal, Row, Select, Tooltip} from "antd";
import {FilterOutlined, PlusCircleOutlined}              from "@ant-design/icons";
import {useHistory}                                      from "react-router-dom";
import {useSelector}                                     from "react-redux";
import moment                                            from "moment";

import FilterBar             from "../../../Components/CustomTag/FilterBar";
import useModalManager       from "../../../Components/ModalManger/useModalManager";
import CreateCalendar        from "../Modal/CreateCalendar";
import {_listStatusCalendar} from "../../RadioProgram/Etc/Etc";
import apiCalendar           from "../../../Api/Calendar/Calendar";

const ActionsBar = React.memo((props) => {
    const {
        state,
        page,
        admCode,
        setState,
        setIsGettingData,
        onSearchString,
        reFetchData,
        listArrayDivision,
        currentAdCode
    } = props;

    const dateFormat = "DD/MM/YYYY";

    const history = useHistory();

    const user = useSelector(state => state.user);

    const division = user?.administrativeCode?.division;

    const options = useRef([
        {title: 'Tất cả trạng thái', status: 'all'},
        ..._listStatusCalendar
    ]).current;

    const [isOpenModalCreateCalendar, , openModalCreateCalendar, closeModalCreateCalendar] = useModalManager();

    // const [isOpenModalRepeatCalendar, , openModalRepeatCalendar, closeModalRepeatCalendar] = useModalManager();

    const [showFilter, setShowFilter] = useState(false);

    // const handleDeleteCalendar = () => {
    //     if (!state?.selectedCalendar) return;
    //     Alert.confirm(`Xác nhận xóa lịch ${state?.selectedCalendar?.adTree?.title} ?`, (check) => {
    //         if (check) {
    //             apiCalendar.deleteCalendar(state.selectedCalendar?.id ?? "", (err) => {
    //                 if (!err) {
    //                     setState(prev => ({
    //                         ...prev,
    //                         selectedKeys: [],
    //                         selectedCalendar: null,
    //                         isLoading: true
    //                     }));
    //                     Notify.success('Xóa lịch thành công');
    //                 }
    //             });
    //         }
    //     });
    // };

    const onChangeDateTime = (date) => {
        if (date.length === 0) return;
        setState(prev => ({
            ...prev,
            from: date[0],
            to: date[1],
            isLoading: true
        }));
    };

    const onChangeStatusCalendar = (value) => {
        page.current.current = 1;
        setState(prev => ({
            ...prev,
            status: value,
            isLoading: true
        }));
    };

    const handleCreateDefaultCalendar = () => {
        Modal.confirm({
            title: "Tạo lịch mặc định",
            content: 'Xác nhận tạo lịch mặc định ?',
            okText: "Xác nhận",
            onOk: () => {
                apiCalendar.createCalendar({
                    adTree: {
                        province: null,
                        districts: [],
                        wards: [],
                        selected: []
                    },
                    default_calendar: true,
                    date_schedule: moment().format("YYYY-MM-DD")
                }, (err, res) => {
                    if (res) {
                        reFetchData();
                    }
                });
            }
        });
    };

    const onCreateNewCalendar = () => {
        if (division !== 1) return;
        state.tab === "1" ? openModalCreateCalendar() : handleCreateDefaultCalendar();
    };

    return (
        <div className="action-bar_broadcast-calendar">
            <Row className="grid-actions-bar">
                <Tooltip title={division !== 1 ? 'Chỉ cấp tỉnh mới có thể tạo lịch' : ''}>
                    <Button
                        disabled={division !== 1 || (state.isDefaultCalendar && state.data?.length > 0)}
                        icon={<PlusCircleOutlined/>}
                        className="row-all-center"
                        onClick={onCreateNewCalendar}
                    >
                        Tạo lịch {state.isDefaultCalendar ? 'mặc định' : 'mới'}
                    </Button>
                </Tooltip>
                <DatePicker.RangePicker
                    inputReadOnly
                    value={[state.from, state.to]}
                    allowClear={false}
                    format={dateFormat}
                    onChange={onChangeDateTime}
                />
                <Select
                    value={state.status}
                    dropdownMatchSelectWidth={false}
                    className="text-center"
                    onChange={onChangeStatusCalendar}
                >
                    {
                        options.map(({title, status, icon}, i) => (
                            status &&
                            <Select.Option
                                value={status}
                                key={i}
                            >
                                {title}
                            </Select.Option>
                        ))
                    }
                </Select>
                <Button
                    className="row-all-center"
                    icon={<FilterOutlined/>}
                    onClick={() => setShowFilter(!showFilter)}
                >
                    {!showFilter ? 'Hiển thị' : 'Ẩn'} Bộ lọc
                </Button>
            </Row>
            {
                showFilter &&
                <FilterBar
                    startFilter={setIsGettingData}
                    onSearchString={onSearchString}
                    setAdmCode={(value) => admCode.current = value}
                    searchString={history.location.state?.searchString}
                    listArrayDivisionBroadcast={listArrayDivision}
                    currentAdCodeBroadcast={currentAdCode}
                />
            }
            <CreateCalendar
                isOpen={isOpenModalCreateCalendar}
                onClose={closeModalCreateCalendar}
                setState={setState}
            />
            {/*<RepeatCalendar*/}
            {/*    isOpen={isOpenModalRepeatCalendar}*/}
            {/*    onClose={closeModalRepeatCalendar}*/}
            {/*    selectedCalendar={state?.selectedCalendar}*/}
            {/*    reFetchData={reFetchData}*/}
            {/*/>*/}
            {/*<ModalDefaultCalendar*/}
            {/*    visible={isOpenModalCreateDefaultCalendar}*/}
            {/*    onCancel={closeModalCreateDefaultCalendar}*/}
            {/*    reFetchData={reFetchData}*/}
            {/*/>*/}
        </div>
    );
});

export default ActionsBar;
