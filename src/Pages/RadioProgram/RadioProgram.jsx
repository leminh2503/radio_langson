import React, {useEffect, useRef, useState} from 'react';
import {useHistory, useParams}              from "react-router-dom";
import {Button, Result, Row}                from "antd";
import {LoadingOutlined}                    from "@ant-design/icons";
import moment                               from "moment";

import Sidebar                                                                      from "./Sidebar/Sidebar";
import Schedule                                                                     from "./Schedule";
import SidebarBase
                                                                                    from "../../Components/Layouts/Sidebar/SidebarBase";
import apiProgram                                                                   from "../../Api/Program/Program";
import apiCalendar                                                                  from "../../Api/Calendar/Calendar";
import {convertOwnerIdProgram as convertOwnerId, convertTimeProgram as convertTime} from "./Etc/Etc";

const RadioProgram = React.memo(() => {
    const history = useHistory();

    const {id: idCalendar} = useParams();

    const [state, setState] = useState({
        dataProgram: [],
        done: false,
        isLoading: true,
        isEmeCalendar: false
    });

    const scheduleObj = useRef();

    const stateRef = useRef({
        stateHistory: {},
        draggingFile: null
    });

    const interval = useRef(null);

    const dateSchedule = moment(state?.selectedCalendar?.dateSchedule);

    const now = moment().startOf('day');

    const disabledSchedule = dateSchedule < now && !state.selectedCalendar?.defaultCalendar;

    const backHome = () => {
        history.push("/broadcast-calendar");
    };

    const fetchProgram = () => {
        apiProgram.listProgram({broadcast_calendar: idCalendar}, (err, res) => {
            if (res) {
                res.map(r => {
                    if (r.timeEnd === null) {
                        r.timeEnd = moment().format("HH:mm:ss");
                    }
                    return r;
                });
                setState(prev => ({
                    ...prev,
                    done: true,
                    isLoading: false,
                    dataProgram: res
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false
                }));
            }
        });
    };

    const fetchProgramContinuously = () => {
        apiProgram.listProgram({
            broadcast_calendar: idCalendar ?? ""
        }, (err, res) => {
            if (res) {
                res.forEach(r => {
                    scheduleObj.current.saveEvent({
                        ...r,
                        OwnerId: convertOwnerId(r),
                        ...convertTime(r)
                    });
                });
            }
        });
    };

    useEffect(() => {
        if (!idCalendar) {
            setState(prev => ({
                ...prev,
                isLoading: false
            }));
            return;
        }
        apiCalendar.getDetailCalendar({id: idCalendar}, (err, res) => {
            if (res) {
                // history.location.state.selectedCalendar = res;
                fetchProgram();
                if (res) {
                    setState(prev => ({...prev, selectedCalendar: res}));
                    if (res?.liveEmeCalendar) {
                        setState(prev => ({...prev, isEmeCalendar: true}));
                        if (moment().startOf('day') !== moment(res?.dateSchedule)) return;
                        interval.current = setInterval(() => {
                            fetchProgramContinuously();
                        }, 10 * 1000);
                    }
                }
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    done: false
                }));
            }
        });
        return () => {
            if (interval.current !== null) {
                clearInterval(interval.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history.location]);

    if (state.isLoading) {
        return (
            <Result
                style={{backgroundColor: 'white', height: 'calc(100vh - 70px)'}}
                icon={<LoadingOutlined size="small"/>}
                title="Đang tải"
                subTitle="Xin vui lòng đợi trong giây lát.."
            />
        );
    }

    if (!state.done) {
        return (
            <Result
                style={{backgroundColor: 'white', height: 'calc(100vh - 70px)'}}
                status="404"
                title="Không tìm thấy dữ liệu"
                subTitle="Lịch đang xem không tồn tại hoặc đã bị xóa bỏ"
                extra={
                    <Button
                        type="primary"
                        onClick={backHome}
                    >
                        Quay lại
                    </Button>
                }
            />
        );
    }

    return (
        <Row className="radio-program">
            <SidebarBase>
                <Sidebar
                    scheduleObj={scheduleObj}
                    stateRef={stateRef}
                    historyState={history.location.state}
                    disabledSchedule={disabledSchedule}
                    isDefaultCalendar={state?.defaultCalendar}
                />
            </SidebarBase>
            <Schedule
                scheduleObj={scheduleObj}
                stateRef={stateRef}
                historyState={history.location.state}
                selectedCalendar={state.selectedCalendar}
                dataProgram={state.dataProgram}
                backHome={backHome}
                disabledSchedule={disabledSchedule}
                isEmeCalendar={state?.isEmeCalendar}
            />
        </Row>
    );
});

export default RadioProgram;