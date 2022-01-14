import React, {useEffect, useRef, useState}           from "react";
import {Pie}                                          from "react-chartjs-2";
import {Card, CardBody, CardHeader, CardTitle, Table} from "reactstrap";
import {FontAwesomeIcon}                              from "@fortawesome/react-fontawesome";
import {faSquare}                                     from "@fortawesome/free-solid-svg-icons";
import {UserOutlined}                                 from "@ant-design/icons";

import apiDashboard from "../../../../Api/Dashboard/Dashboard";

const Users = React.memo(() => {
    const datasets = useRef({
        borderWidth: 1,
        backgroundColor: [
            "rgba(30,195,30,0.85)",
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

    const [data, setData] = useState({});

    useEffect(() => {
        apiDashboard.getDataChart('user', null, (err, res) => {
            if (res) {
                setData({
                    org: res,
                    labels: ["Hoạt động", "Không hoạt động"],
                    datasets: [
                        {
                            ...datasets,
                            data: [res?.userToday, (res?.userTotal - res?.userToday)]
                        }
                    ]
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Card className="flex-fill w-100 box-shadow_custom" style={{height: '100%'}}>
            <CardHeader style={{backgroundColor: 'rgb(160 183 200 / 21%)'}}>
                <CardTitle className="mb-0 text-center text-bold-5 row-all-center" style={{fontSize: '15px'}}>
                    <UserOutlined className="mr-1"/>
                    <span>Users hoạt động trong ngày</span>
                </CardTitle>
            </CardHeader>
            <CardBody className="d-flex">
                <div className="w-100">
                    <div className="py-3">
                        <div className="chart chart-xs">
                            <Pie data={data} options={options}/>
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
                        <tr>
                            <td>
                                <FontAwesomeIcon icon={faSquare} color={datasets.backgroundColor[0]}/>
                                <span className="ml-2">Hoạt động</span>
                            </td>
                            <td className="text-right text-success">
                                {((data.org?.userToday / data.org?.userTotal) * 100).toFixed(2)}%
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <FontAwesomeIcon icon={faSquare} color={datasets.backgroundColor[1]}/>
                                <span className="ml-2">Không Hoạt động</span>
                            </td>
                            <td className="text-right text-success">
                                {(((data.org?.userTotal - data.org?.userToday) / data.org?.userTotal) * 100).toFixed(2)}%
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                </div>
            </CardBody>
        </Card>
    );
});

export default Users;
