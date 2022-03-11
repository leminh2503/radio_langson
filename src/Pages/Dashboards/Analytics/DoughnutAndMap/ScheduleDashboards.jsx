import React, {useEffect, useRef, useState}         from "react";
import {Card, CardBody, CardHeader, CardTitle, Nav} from "reactstrap";
import {useDispatch, useSelector}                   from "react-redux";
import {Empty}                                      from "antd";
import moment                                       from "moment";
import AudioPlayer                                  from 'react-h5-audio-player';
import {ScheduleOutlined}                           from "@ant-design/icons";
import apiCalendar                                  from "../../../../Api/Calendar/Calendar";
import apiProgram                                   from "../../../../Api/Program/Program";
import initDay                                      from "./index";

const ScheduleDashboard = () => {
    const user = useSelector(state => state.user);
    const administrativeCode = user?.administrativeCode;
    const momentDay = moment().format('dddd');
    const [codeDay, setCodeDay] = useState(0);
    const [data, setData] = useState({
        dateSchedule: null,
        schedule: [],
        code: 0
    });
    const prevCodeDay = useRef('')
    const checkCodeDay = (name) => {
        switch (name) {
            case 'thứ hai':
                return 2;
            case 'thứ ba':
                return 3;
            case 'thứ tư':
                return 4;
            case 'thứ năm':
                return 5;
            case 'thứ sáu':
                return 6;
            case 'thứ bảy':
                return 7;
            case 'chủ nhật':
                return 8;
        }
    };

    const codeCurrentDay = checkCodeDay(momentDay);
    useEffect(() => {
        if (codeDay === 0) {
            return;
        }
        const dateCheck = codeCurrentDay >= codeDay ? moment().subtract(codeCurrentDay - codeDay, 'days') : moment().add(codeDay - codeCurrentDay, 'days');
        apiCalendar.listCalendar({
            administrative_code: administrativeCode?.code,
            date_schedule__gte: dateCheck.format('YYYY-MM-DD'),
            date_schedule__lt: dateCheck.add(1, 'days').format('YYYY-MM-DD')
        }, (err, res) => {
            if (res) {
                if(res.length > 1){
                    apiProgram.listProgram({
                        broadcast_calendar: res[1]?.id
                    }, (err1, res1) => {
                        if (res1) {
                            setData(prev => ({
                                ...prev,
                                dateSchedule: res[1]?.dateSchedule,
                                schedule: res1
                            }));
                        } else {
                            setCodeDay(prevCodeDay.current)
                        }
                    });
                    return
                }
                else {
                    apiProgram.listProgram({
                        broadcast_calendar: res[0]?.id
                    }, (err1, res1) => {
                        if (res1) {
                            setData(prev => ({
                                ...prev,
                                dateSchedule: res[0]?.dateSchedule,
                                schedule: res1
                            }));
                        } else {
                            setCodeDay(prevCodeDay.current)
                        }
                    });
                }
            }
        });

    }, [codeDay]);

    useEffect(() => {
        const currentDay = moment().format('YYYY-MM-DD');
        const nextDay = moment().add(1, 'days').format('YYYY-MM-DD');
        apiCalendar.listCalendar({
            administrative_code: administrativeCode?.code,
            date_schedule__gte: currentDay,
            date_schedule__lt: nextDay
        }, (err, res) => {
            if (res) {
                if(res.length > 1){
                    apiProgram.listProgram({
                        broadcast_calendar: res[1]?.id
                    }, (err1, res1) => {
                        if (res1) {
                            setData(prev => ({
                                ...prev,
                                dateSchedule: res[1]?.dateSchedule,
                                schedule: res1
                            }));
                        } else {
                            setCodeDay(prevCodeDay.current)
                        }
                    });
                    return
                }
                else {
                    apiProgram.listProgram({
                        broadcast_calendar: res[0]?.id
                    }, (err1, res1) => {
                        if (res1) {
                            setData(prev => ({
                                ...prev,
                                dateSchedule: res[0]?.dateSchedule,
                                schedule: res1
                            }));
                        } else {
                            setCodeDay(prevCodeDay.current)
                        }
                    });
                }
            }
        });
        setCodeDay(codeCurrentDay);
    }, []);

    return (
        <Card className="flex-fill w-100 box-shadow_custom" style={{'height': '550px'}}>
            <CardHeader style={{backgroundColor: 'rgb(160 183 200 / 21%)'}}>
                <CardTitle className="mb-0 text-center text-bold-5 row-all-center" style={{fontSize: '15px'}}>
                    <ScheduleOutlined className="mr-1"/>
                    <span>Lịch phát sóng ngày {data?.dateSchedule}</span>
                </CardTitle>
            </CardHeader>
            <AudioPlayer showSkipControls={true} showJumpControls={false}/>
            <div className="d-flex">
                {initDay.map((d, i) => {
                    return (
                        <div className="schedule_day" key={i} onClick={() => {
                            prevCodeDay.current = codeDay
                            setCodeDay(d?.code)
                        }}
                             style={codeDay === d?.code ? {backgroundColor: '#bfddf3'} : null}>{d?.title}</div>
                    );
                })}
            </div>
            <div style={{overflowY: 'scroll', height: '500px'}} className={codeDay < codeCurrentDay ? 'background' : null}>
                {data?.schedule.length > 0 ? data?.schedule.map((d, i) => {
                    return (
                        <div key={i} className="d-flex">
                            <div className="w-100">
                                <div className="dashboard_schedule">
                                    <div className="time col-4">{d.timeStart}</div>
                                    <div className="name">
                                        <strong>{d.title}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="Chưa có lịch phát sóng nào"/>}
            </div>
        </Card>
    );
};

export default ScheduleDashboard;