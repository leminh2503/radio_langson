import React, {useEffect, useState} from "react";
import {Row}                        from "antd";
import {Container}                  from "reactstrap";

import Statistics     from "./Statistics";
import DoughnutAndMap from "./DoughnutAndMap/DoughnutAndMap";
import Charts         from "./Charts/Charts";
import apiDashboard   from "../../../Api/Dashboard/Dashboard";

const Analytics = () => {
    const [dataDevices, setDataDevices] = useState({
        devices: [],
        totalDevice: 0
    });

    useEffect(() => {
        apiDashboard.getDataChart('device', null, (err, res) => {
            if (res?.length > 0) {
                setDataDevices({
                    devices: res,
                    totalDevice: res.map(x => x.status_count).reduce((x, y) => x + y)
                });
            }
        });
    }, []);

    return (
        <Container fluid className="p-0">
            <Row className="mx-0">
                <Statistics data={dataDevices}/>
            </Row>
            <Row className="" style={{padding: '5px 10px'}}>
                <DoughnutAndMap data={dataDevices}/>
            </Row>
            <Row className="" style={{padding: '5px 10px'}}>
                <Charts/>
            </Row>
        </Container>
    );
};

export default Analytics;
