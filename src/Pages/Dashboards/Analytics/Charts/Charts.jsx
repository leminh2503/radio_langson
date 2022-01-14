import React             from 'react';
import {Col}             from "reactstrap";
import FilesAndSchedules from "./FilesAndSchedules";

const Charts = React.memo(() => {
    return (
        <>
            <Col lg={6} className="p-1">
                <FilesAndSchedules type="file"/>
            </Col>
            <Col lg={6} className="p-1">
                <FilesAndSchedules type="schedule"/>
            </Col>
        </>
    );
});

export default Charts;
