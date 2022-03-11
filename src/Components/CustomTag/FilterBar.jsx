import React, {useEffect, useMemo, useRef, useState}       from 'react';
import {Button, DatePicker, Dropdown, Input, Menu, Select} from "antd";
import {BarsOutlined, CheckOutlined}                       from "@ant-design/icons";
import {useSelector}                                       from "react-redux";
import moment                                              from "moment";
import {useHistory}                                        from "react-router-dom";

import apiAdministrative from "../../Api/Administrative/Administrative";
import {defaultDivision} from "../../Config/division";

const arrayAdministrative = Object.keys(defaultDivision);

const initListArrayDivision = {
    province: [],
    district: [],
    wards: [],
    village: []
};

const initCurrentAdCode = {
    province: null,
    district: null,
    wards: null,
    village: null
};

const ListDivisionComponent = (props) => {
    const {
        listDivision,
        state,
        setState,
        startFilter,
        setAdmCode,
        listArrayDivisionBroadcast,
        currentAdCodeBroadcast
    } = props;

    const onSelect = (value, opData, keyValue) => {
        const {currentAdCode, listArrayDivision} = state;
        let division = opData.item?.division ?? "";
        const isDPT = opData?.item?.type.includes("_dpt");
        const nextKey = arrayAdministrative[defaultDivision[keyValue]] ?? "";
        let newCurrentAdCode;
        let newListArrayDivision;
        if (isDPT) division = division + 1;
        switch (division) {
            case defaultDivision.province:
                newCurrentAdCode = {district: null, wards: null, village: null};
                newCurrentAdCode.province = value;
                newListArrayDivision = {...listArrayDivision, district: [], wards: [], village: []};
                break;
            case defaultDivision.district:
                newCurrentAdCode = {...currentAdCode, wards: null, village: null};
                newCurrentAdCode.district = value;
                newListArrayDivision = {...listArrayDivision, wards: [], village: []};
                break;
            case defaultDivision.wards:
                newCurrentAdCode = {...currentAdCode, village: null};
                newCurrentAdCode.wards = value;
                newListArrayDivision = {...listArrayDivision, village: []};
                break;
            case defaultDivision.village:
                newCurrentAdCode = {...currentAdCode};
                newCurrentAdCode.village = value;
                newListArrayDivision = {...listArrayDivision};
                break;
            default:
                break;
        }
        if (listArrayDivisionBroadcast && currentAdCodeBroadcast) {
            listArrayDivisionBroadcast.current = newListArrayDivision;
            currentAdCodeBroadcast.current = newCurrentAdCode;
        }
        setState(prev => ({...prev, currentAdCode: newCurrentAdCode, listArrayDivision: newListArrayDivision}));
        setAdmCode({value, isDPT});
        startFilter();
        if (isDPT || division === defaultDivision.village) return;
        const func = opData?.item?.type.includes("_dpt") ? 'getAdministrativeByCode' : 'getAdministrativeWithSelf';
        apiAdministrative[func]({code: value}, (err, res) => {
            if (res) {
                setState(prev => ({
                    ...prev,
                    listArrayDivision: {
                        ...newListArrayDivision,
                        [nextKey]: res
                    }
                }));
            }
        });
    };

    return (
        listDivision.map(({title, keyValue, visible}, i) => (
            keyValue !== "time" &&
            state.checked[keyValue] &&
            visible &&
            <Select
                className="box-select"
                value={state.currentAdCode[keyValue]}
                key={i}
                dropdownMatchSelectWidth={false}
                onSelect={(value, opData) => onSelect(value, opData, keyValue)}
                placeholder={title}
            >
                {
                    state.listArrayDivision[keyValue].map(item => (
                        <Select.Option value={item?.code} key={item?.code} item={item}>
                            {item?.nameWithType ?? ""}
                        </Select.Option>
                    ))
                }
            </Select>
        ))
    );
};

const DateTimeFilter = (props) => {
    const {visible, openChangeDatePicker} = props;

    const datetimeRef = useRef({
        from: moment().startOf('month'),
        to: moment().endOf('month')
    });

    const isEditedDateTime = useRef(false);

    const onChangeDateTime = (dates) => {
        if (!dates) {
            datetimeRef.current = {
                from: null,
                to: null
            };
            return;
        }
        datetimeRef.current = {
            from: dates[0].startOf('day'),
            to: dates[1].endOf('day')
        };
        isEditedDateTime.current = true;
    };

    if (!visible) return null;

    return (
        <DatePicker.RangePicker
            allowClear={false}
            format="DD/MM/YYYY"
            onChange={onChangeDateTime}
            defaultValue={[datetimeRef.current.from, datetimeRef.current.to]}
            onOpenChange={(visible) => {
                if (isEditedDateTime.current) {
                    openChangeDatePicker(visible, {
                        from: datetimeRef.current.from,
                        to: datetimeRef.current.to
                    });
                    isEditedDateTime.current = false;
                }
            }}
        />
    );
};

const SearchBox = (props) => {
    const {visible, onSearchString, searchString, onChangeSearch} = props;

    if (!visible) return null;

    return (
        <Input
            defaultValue={searchString}
            placeholder="Tìm kiếm tài khoản..."
            onSearch={onSearchString}
            onChange={onChangeSearch}
        />
    );
};

const FilterBar = React.memo((props) => {
    const {
        startFilter,
        setAdmCode,
        searchBox,
        onSearchString,
        searchString,
        showDatetimeFilter,
        openChangeDatePicker,
        listArrayDivisionBroadcast,
        currentAdCodeBroadcast,
        onChangeSearch,
        showAdministrative = true
    } = props;

    const user = useSelector(state => state.user);

    const history = useHistory();

    const historyState = history.location.state?.admCode ?? "";

    const userDivision = user?.administrativeCode?.division ?? "";

    const administrative = user?.administrativeCode ?? "";

    const historyListArrayDivision = historyState?.listArrayDivision ?? initListArrayDivision;

    const historyCurrentAdCode = historyState?.currentAdCode ?? initCurrentAdCode;

    const [visibleDropdown, setVisibleDropdown] = useState(false);

    const [state, setState] = useState({
        checked: {
            province: historyState?.currentAdCode?.province ?? userDivision === defaultDivision.province,
            district: historyState?.currentAdCode?.district ?? true,
            wards: historyState?.currentAdCode?.wards ?? true,
            village: historyState?.currentAdCode?.village ?? true
        },
        listArrayDivision: historyListArrayDivision,
        currentAdCode: historyCurrentAdCode
    });

    const onVisibleChangeDropdown = (visible) => {
        setVisibleDropdown(visible);
    };

    const onClickItemDropdown = ({key}) => {
        const checkedState = state.checked[key];
        const parentKey = arrayAdministrative[defaultDivision[key] - 2] ?? "";
        const parentCode = state.currentAdCode[parentKey] ?? "";
        setState(prev => ({
            ...prev,
            checked: {
                ...prev.checked,
                [key]: !checkedState
            }
        }));
        if (checkedState && parentCode) {
            setAdmCode({
                isDPT: false,
                value: state.currentAdCode[parentKey]
            });
            const newCurrentAdCode = {
                ...state.currentAdCode,
                [key]: null
            };
            if (listArrayDivisionBroadcast && currentAdCodeBroadcast) {
                currentAdCodeBroadcast.current = newCurrentAdCode;
            }
            setState(prev => ({...prev, currentAdCode: newCurrentAdCode}));
            startFilter();
        }
    };

    useEffect(() => {
        const keyUserDivision = arrayAdministrative[userDivision - 1] ?? "";
        const keyChildrenUserDivision = arrayAdministrative[userDivision] ?? "";
        const code = administrative?.code ?? "";
        apiAdministrative.getAdministrativeWithSelf({code}, (err, res) => {
            if (res) {
                setState(prev => ({
                    ...prev,
                    listArrayDivision: {
                        ...state.listArrayDivision,
                        [keyUserDivision]: [administrative],
                        [keyChildrenUserDivision]: res
                    },
                    currentAdCode: {
                        ...state.currentAdCode,
                        [keyUserDivision]: code
                    }
                }));
                setAdmCode({isDPT: false, value: code});
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const listDivision = useMemo(() => {
        return [
            {
                title: 'Tỉnh/Thành phố',
                keyValue: 'province',
                icon: <CheckOutlined/>,
                type: 'select',
                visible: userDivision <= defaultDivision.province && showAdministrative,
                disabled: true
            },
            {
                title: 'Quận/Huyện',
                keyValue: 'district',
                icon: <CheckOutlined/>,
                type: 'select',
                visible: userDivision <= defaultDivision.district && showAdministrative,
                disabled: !state.checked.province || state.checked.wards
            },
            {
                title: 'Phường/Xã/Thị trấn',
                keyValue: 'wards',
                icon: <CheckOutlined/>,
                type: 'select',
                visible: userDivision <= defaultDivision.wards && showAdministrative,
                disabled: !state.checked.district || state.checked.village
            },
            {
                title: 'Làng/Xóm/Khu dân cư/Tổ',
                keyValue: 'village',
                icon: <CheckOutlined/>,
                type: 'select',
                visible: userDivision <= defaultDivision.village && showAdministrative,
                disabled: !state.checked.wards
            }
        ];
    }, [userDivision, state.checked, showAdministrative]);

    const renderOverlay = () => {
        return (
            <Menu>
                {
                    listDivision.map(({title, icon, keyValue, visible, disabled}, i) => (
                        visible &&
                        <Menu.Item
                            key={keyValue}
                            disabled={disabled}
                            onClick={onClickItemDropdown}
                            icon={state.checked[keyValue] ? icon : null}
                        >
                            {title}
                        </Menu.Item>
                    ))
                }
            </Menu>
        );
    };

    return (
        <div className={`grid-filter-bar ${showAdministrative ? 'broadcast-calendar' : 'history-work'}`}>
            {
                showAdministrative &&
                <Dropdown
                    className="row-all-center"
                    trigger="click"
                    visible={visibleDropdown}
                    overlay={renderOverlay}
                    onVisibleChange={onVisibleChangeDropdown}
                >
                    <Button icon={<BarsOutlined/>}>
                        Chọn địa phương
                    </Button>
                </Dropdown>
            }
            <ListDivisionComponent
                listDivision={listDivision}
                state={state}
                setState={setState}
                startFilter={startFilter}
                setAdmCode={setAdmCode}
                listArrayDivisionBroadcast={listArrayDivisionBroadcast}
                currentAdCodeBroadcast={currentAdCodeBroadcast}
            />
            <DateTimeFilter
                visible={showDatetimeFilter}
                openChangeDatePicker={openChangeDatePicker}
            />
            <SearchBox
                visible={searchBox}
                searchString={searchString}
                onSearchString={onSearchString}
                onChangeSearch={onChangeSearch}
            />
        </div>
    );
});

export default FilterBar;
