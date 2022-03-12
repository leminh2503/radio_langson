import React, {useRef, useState, useEffect} from 'react';
import {Calendar, Divider, Select} from "antd";
import moment                    from "moment";
import {cloneDeep, dropRight}               from "lodash";
import {FormGroup}               from "reactstrap";

const CustomCalendar = React.memo(({dateArrays}) => {

    const { Option } = Select;

    const isChangePanel = useRef(false);

    const currentDateTime = useRef(moment());

    const [data, setData] = useState({
        value: 0,
        preValue: 0
    })

    const [state, setState] = useState({
        dateArray: [],
        isLoop: true,
        t_26: false,
        t_7cn: false,
        t_full: false
    });

    useEffect(() => {

        if(data?.value < data?.preValue) {
            const dateArray = cloneDeep(state?.dateArray);
            const count = data?.preValue - data?.value;
            const dateArrayNew = dropRight(dateArray, count)
            setState(prev => ({
                ...prev,
                dateArray: dateArrayNew
            }));
            dateArrays.current = dateArrayNew;
            return;
        }
        if(data?.value > 0) {
            const dateArray = []
            for(let i = 1; i <= data?.value; i++) {
                const now = moment();
                let nextDay = now.add(i, 'days');
                dateArray.push(nextDay)
                setState(prev => ({...prev, dateArray}));
                dateArrays.current = dateArray;
            }
        }
     }, [data])

    // const onClickLoopDate = () => {
    //     if (state.isLoop) {
    //         setState(prev => ({
    //             ...prev,
    //             dateArray: [],
    //             isLoop: !state.isLoop
    //         }));
    //         return;
    //     }
    //     setState(prev => ({...prev, isLoop: !state.isLoop}));
    // };

    const handleChangeDate = (date) => {

        if (isChangePanel.current) {
            isChangePanel.current = false;
            return;
        }
        const dateArray = cloneDeep(state.dateArray);
        for (let i = 0; i < dateArray.length; i++) {
            if (dateArray[i].isSame(date, "day")) {
                dateArray.splice(i, 1);
                setState(prev => ({...prev, dateArray}));
                dateArrays.current = dateArray;
                return;
            }
        }
        dateArray.push(date);
        setState(prev => ({...prev, dateArray}));
        dateArrays.current = dateArray;
    };

    const isDateSelected = (date) => {
        return state.dateArray.some(item => item.isSame(date, "day"));
    };

    const disabledDate = (current) => {
        if (!state.isLoop) return true;
        const month = current.month();
        const year = current.year();
        let minMonth = currentDateTime.current.clone().startOf('month');
        let maxMonth = currentDateTime.current.clone().endOf('month');
        if (month === moment().month() && year === moment().year()) {
            minMonth = moment();
            maxMonth = moment().endOf('month');
        }
        return (current > maxMonth || current < minMonth);
    };

    const onPanelChange = (date) => {
        isChangePanel.current = true;
        currentDateTime.current = date;
    };

    return (
        <FormGroup>
            {/*<div className="text-label-with-checkbox">*/}
            {/*    <Checkbox*/}
            {/*        checked={state.isLoop}*/}
            {/*        onClick={onClickLoopDate}*/}
            {/*    />*/}
            {/*    <span className="ml-2 text-bold-5">*/}
            {/*        Lặp lịch*/}
            {/*    </span>*/}
            {/*</div>*/}
            {
                state.isLoop &&
                <>
                    <Divider>
                        Chọn ngày lặp
                    </Divider>
                    <div className="d-flex justify-content-center">
                        <Select
                            defaultValue={0}
                            className="my-3"
                            style={{ width: '90%' }}
                            onChange={(value) => {
                            setData(prev => ({
                                value,
                                visible: true,
                                preValue:  prev.value
                            }))
                        }}>
                            <Option value={0} >Chưa Chọn</Option>
                            <Option value={7} >Lặp 7 ngày tiếp theo</Option>
                            <Option value={15} >Lặp 15 ngày tiếp theo</Option>
                        </Select>
                    </div>
                    <Calendar
                        className="custom-calendar"
                        fullscreen={false}
                        onPanelChange={onPanelChange}
                        disabledDate={disabledDate}
                        onSelect={handleChangeDate}
                        dateFullCellRender={(value) => (
                            <div
                                className={`ant-picker-cell-inner ant-picker-calendar-date ${isDateSelected(value) ? "ant-picker-calendar-date-selected" : null}`}
                            >
                                <div className="ant-picker-calendar-date-value">{value.format("DD")}</div>
                            </div>
                        )}
                    />
                </>
            }
        </FormGroup>
    );
});


export default CustomCalendar;