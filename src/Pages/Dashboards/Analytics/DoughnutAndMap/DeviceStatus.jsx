import React, {useMemo, useRef}                       from "react";
import {Pie}                                          from "react-chartjs-2";
import {Card, CardBody, CardHeader, CardTitle, Table} from "reactstrap";
import {FontAwesomeIcon}                              from "@fortawesome/react-fontawesome";
import {faSquare}                                     from "@fortawesome/free-solid-svg-icons";

import {statusDevices} from "../../../EquipmentManagement/Main";
import RadioImage      from "../../../../Assets/icon/radio.svg";
import {Empty}         from "antd";

const DeviceStatus = React.memo(({data}) => {
    const datasets = useRef({
        borderWidth: 1,
        backgroundColor: [
            "green",
            "red",
            "#FDE64B",
            "#8D1EFF",
            "#c3baba"
        ],
        borderColor: "transparent"
    }).current;

    const options = useRef({
        maintainAspectRatio: false,
        legend: {
            display: false
        }
    }).current;

    const newData = useMemo(() => {
        const newData = [];
        const devices = data.devices ?? [];
        const arrayStatusDevicesSorted = Object.values(statusDevices).sortByKey("order");
        arrayStatusDevicesSorted.forEach(({status, desc}) => {
            const index = devices.findIndex(d => d.status === status);
            if (index > -1) {
                newData.push({...devices[index], desc});
            } else {
                newData.push({status, status_count: 0, desc});
            }
        });
        if (data?.devices?.length < 0) return {
            org: [],
            dataChart: {
                labels: [],
                datasets: [{
                    ...datasets,
                    data: []
                }]
            }
        };
        return {
            org: newData,
            dataChart: {
                labels: arrayStatusDevicesSorted.map(x => x.desc),
                datasets: [{
                    ...datasets,
                    data: newData.map(x => x.status_count)
                }]
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return (
        <Card className="flex-fill w-100 box-shadow_custom" style={{height: '100%'}}>
            <CardHeader style={{backgroundColor: 'rgb(160 183 200 / 21%)'}}>
                <CardTitle className="mb-0 text-center text-bold-5 row-all-center" style={{fontSize: '15px'}}>
                    <img src={RadioImage} width="20px" height="20px" alt="" className="mr-2 mb-1"/>
                    <span>Trạng thái thiết bị {data.totalDevice > 0 ? `(${data.totalDevice})` : ''}</span>
                </CardTitle>
            </CardHeader>
            <CardBody className="d-flex">
                <div className="w-100">
                    <div className="py-3">
                        <div className="chart chart-xs">
                            {
                                data.totalDevice > 0 ?
                                    <Pie data={newData.dataChart} options={options}/>
                                    :
                                    <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="Chưa có thiết bị"/>
                            }
                        </div>
                    </div>
                    <Table className="mb-0 mt-2">
                        <thead>
                        <tr>
                            <th>Trạng thái</th>
                            <th className="text-right">Tỉ lệ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            newData.org.map(({status_count, desc}, i) => (
                                <tr key={i}>
                                    <td>
                                        <FontAwesomeIcon icon={faSquare} color={datasets.backgroundColor[i]}/>
                                        <span className="ml-2">{desc}</span>
                                    </td>
                                    <td className="text-right text-success">
                                        {
                                            data.totalDevice > 0 ?
                                                ((status_count / data.totalDevice) * 100).toFixed(2)
                                                :
                                                status_count.toFixed(2)
                                        }
                                        %
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </Table>
                </div>
            </CardBody>
        </Card>
    );
});

export default DeviceStatus;
