import React, {useRef} from "react";
import {Col, Row}      from "antd";
import {useHistory}    from "react-router-dom";
import {statusDevices} from "../../EquipmentManagement/Main";

const Statistics = React.memo(({data}) => {
    const history = useHistory();

    const listItem = useRef(Object.values(statusDevices).sortByKey('order')).current;

    const onPushToDeviceManagementPage = (status) => {
        history.push('/equipment-management', {status});
    };

    return (
        <Row className="dashboard_device_stream_connection">
            {
                listItem.map(({desc, status, icon}, i) => (
                    <Col
                        lg={4}
                        className="w-100 p-1 dashboard_device_stream_connection-box hover-pointer"
                        key={i}
                        onClick={onPushToDeviceManagementPage.bind(this, status)}
                    >
                        <Row className="dashboard_device_stream_connection-child border box-shadow_custom">
                            <div className="dashboard_device_stream_connection-icon border-right">
                                {icon}
                            </div>
                            <div className="dashboard_device_stream_connection-text">
                                <div style={{fontSize: '18px'}} className="text-bold-5">
                                    {data.devices.find(d => d.status === status)?.status_count ?? 0} / {data.totalDevice}
                                </div>
                                <div className="mt-2" style={{fontSize: '16px'}}>
                                    Thiết bị {desc}
                                </div>
                            </div>
                        </Row>
                    </Col>
                ))
            }
        </Row>
    );
});

export default Statistics;
