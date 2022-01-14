import React, {useEffect, useRef} from 'react';
import {useHistory}               from 'react-router-dom';

import {Col}                                    from "reactstrap";
import {Button}                                 from 'antd';
import {MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import L                                        from 'leaflet';
import 'react-leaflet-fullscreen-control';
import DeviceStatus             from "./DeviceStatus";
import Users                    from "./Users";
import { useState } from 'react';
import apiMap                   from "../../../../Api/Map/Map"
import apiUser                  from "../../../../Api/User/User"
import Notify from '../../../../Utils/Notify/Notify';
import { isBuffer } from 'lodash';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

const DoughnutAndMap = React.memo(({data}) => {
    const [location, setLocation] = useState({
        latitude: 21,
        longitude: 105.8090587
    });

    const history = useHistory();

    const zoom = useRef({
        default: 8,
    }).current;

    useEffect(() => {
        const ele = document.getElementsByClassName(
            'leaflet-bottom leaflet-right',
        );
        if (ele.length > 0) {
            ele[0].style.display = 'None';
        }
        apiMap.getMap((err, res) => {
            if (res) {
                setLocation(prev => {
                    if(res.data.length === 0){
                        return prev
                    } else {
                        return res.data[0]
                    }
                })
            }
            if (err) {
                return Notify.error(`${err}`)
            }
         })
    }, []);
    return (
        <>
            <Col lg={3} className="px-1" style={{minHeight: '100%'}}>
                <DeviceStatus data={data} />
            </Col>
            <Col lg={6} className="w-100 px-1 dashboard_map-height">
                <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={zoom.default}
                    style={{maxHeight: '100%', height: '100%'}}
                    fullscreenControl
                    className="box-shadow_map">
                    <ChangeView
                        center={[location.latitude, location.longitude]}
                        zoom={zoom.default}
                    />
                    <TileLayer url="https://g1.cloudgis.vn/services/rest/maps/roadmap/tile/{z}/{x}/{y}.png" />
                    <Marker position={[location.latitude, location.longitude]}>
                        <Popup>
                            <Button
                                onClick={() =>
                                    history.push('/equipment-management')
                                }
                                size="large">
                                Xem danh sách thiết bị
                            </Button>
                        </Popup>
                    </Marker>
                </MapContainer>
            </Col>
            <Col lg={3} className="w-100 px-1" style={{minHeight: '100%'}}>
                <Users />
            </Col>
        </>
    );
});

export default DoughnutAndMap;
