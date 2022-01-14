import React, {useEffect, useRef, useState}    from 'react';
import {Bar, Line}                             from "react-chartjs-2";
import {Card, CardBody, CardHeader, CardTitle} from "reactstrap";
import {Select}                                from "antd";
import moment                                  from "moment";

import apiDashboard from "../../../../Api/Dashboard/Dashboard";

const formatDateTime = "YYYY-MM-DD HH:mm:ss";

const FilesAndSchedules = React.memo(({type}) => {
    const [timeUnit, setTimeUnit] = useState('7_days');

    const initTime = useRef({
        "7_days": {
            from: moment().subtract(7, 'days').startOf('day').format(formatDateTime),
            to: moment().endOf('day').format(formatDateTime)
        },
        "15_days": {
            from: moment().subtract(15, 'days').format(formatDateTime),
            to: moment().endOf('day').format(formatDateTime)
        }
    }).current;

    const [data, setData] = useState({
        labels: [],
        datasets: [{
            label: type === 'file' ? 'Số file' : 'Số chương trình',
            data: [],
            backgroundColor: type === 'file' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(54, 162, 235, 0.2)',
            borderColor: type === 'file' ? 'rgb(75, 192, 192)' : 'rgb(54, 162, 235)',
            borderWidth: 1
        }]
    });

    const options = {
        file: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                yAxes: [
                    {
                        gridLines: {
                            color: "rgba(0,0,0,0.05)"
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            stepSize: 20
                        }
                    }
                ],
                xAxes: [
                    {
                        barPercentage: 0.75,
                        categoryPercentage: 0.5,
                        stacked: false
                    }
                ]
            }
        },
        schedule: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                intersect: false
            },
            hover: {
                intersect: true
            },
            plugins: {
                filler: {
                    propagate: false
                }
            },
            scales: {
                xAxes: [
                    {
                        gridLines: {
                            color: "rgba(0,0,0,0.05)"
                        }
                    }
                ],
                yAxes: [
                    {
                        gridLines: {
                            color: "rgba(0,0,0,0)",
                            fontColor: "#fff"
                        },
                        ticks: {
                            beginAtZero: true,
                            stepSize: 20
                        }
                    }
                ]
            }
        }
    };

    const onChangeTimeUnit = (value) => {
        setTimeUnit(value);
    };

    const getDatesOfWeekOrMonth = (days, dateFormat: string) => {
        const array = [];
        for (let i = days - 1; i >= 0; i--) {
            array.push(moment().subtract(i, 'days').format(dateFormat));
        }
        return array;
    };

    useEffect(() => {
        apiDashboard.getDataChart(type, {
            created__gte: initTime[timeUnit].from,
            created__lte: initTime[timeUnit].to
        }, (err, res) => {
            if (res) {
                const datesLabels = getDatesOfWeekOrMonth(timeUnit === '7_days' ? 7 : 15, "YYYY-MM-DD");
                const newArrayData = [];
                datesLabels.forEach(x => {
                    const index = res.findIndex(y => y.created__date === x);
                    if (index === -1) {
                        newArrayData.push(0);
                    } else if (index > -1) {
                        newArrayData.push(res[index].count);
                    }
                });
                const newData = {
                    labels: getDatesOfWeekOrMonth(timeUnit === '7_days' ? 7 : 15, "DD/MM/YYYY"),
                    datasets: [{
                        ...data.datasets[0],
                        data: newArrayData
                    }]
                };
                setData(newData);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeUnit]);

    return (
        <Card className="flex-fill w-100 box-shadow_custom">
            <CardHeader
                className="row-vertical-center justify-content-between"
                style={{backgroundColor: 'rgba(24,92,152,0.05)'}}
            >
                <CardTitle tag="h5" className="mb-0" style={{fontSize: '17.5px'}}>
                    Số
                    lượng {type === 'file' ? 'file upload' : 'chương trình'} trong {timeUnit === '7_days' ? '7 ngày gần nhất' : '15 ngày gần nhất'}
                </CardTitle>
                <div className="card-actions">
                    <Select onChange={onChangeTimeUnit} value={timeUnit}>
                        <Select.Option value="7_days">7 ngày gần nhất</Select.Option>
                        <Select.Option value="15_days">15 ngày gần nhất</Select.Option>
                    </Select>
                </div>
            </CardHeader>
            <CardBody className="d-flex">
                <div className="align-self-center w-100">
                    <div className="chart" style={{minHeight: '350px'}}>
                        {
                            type === 'file' ?
                                <Bar
                                    data={data}
                                    options={options[type]}
                                />
                                :
                                <Line
                                    data={data}
                                    options={options[type]}
                                />
                        }
                    </div>
                </div>
            </CardBody>
        </Card>
    );
});

export default FilesAndSchedules;
