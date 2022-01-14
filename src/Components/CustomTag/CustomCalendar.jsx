import React, {useRef, useState} from 'react';
import {Calendar, Divider}       from "antd";
import moment                    from "moment";
import {cloneDeep}               from "lodash";
import {FormGroup}               from "reactstrap";

const CustomCalendar = React.memo(({dateArrays}) => {
    const isChangePanel = useRef(false);

    const currentDateTime = useRef(moment());

    const [state, setState] = useState({
        dateArray: [],
        isLoop: true,
        t_26: false,
        t_7cn: false,
        t_full: false
    });

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