import React, {useEffect, useRef, useState}             from 'react';
import {Col}                                            from "reactstrap";
import {MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import L                                                from 'leaflet';
import apiMap                                           from '../../Api/Map/Map';
import 'react-leaflet-fullscreen-control';

delete L.Icon.Default.prototype._getIconUrl;

const ChangeView = ({center, zoom}) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const Map = React.memo(({data: dataDevices, setSelectedDevice}) => {
    const [location, setLocation] = useState({
        latitude: 21.0115037,
        longitude: 105.8090587
    });
    const position = [location.latitude, location.longitude];
    useEffect(() => {
        apiMap.getMap((err, res) => {
            if (res) {
                setLocation(
                    res.data[0]
                );
            }
        });
    }, []);

    const selectDeviceOnMap = () => {
        const allMarkers = document.querySelectorAll("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive");
        allMarkers.forEach((d, i) => {
            d.setAttribute("device-id", dataDevices[i]?.mac);
            d.addEventListener('click', () => {
                const deviceId = d.getAttribute("device-id");
                const index = dataDevices.findIndex(d => d?.mac === deviceId);
                if (index > -1) {
                    setSelectedDevice(dataDevices[index]?.id);
                }
            });
        });
    };

    const clearSelectedDevice = (e) => {
        if (e.target.tagName !== "IMG") {
            setSelectedDevice(null);
        }
    };

    useEffect(() => {
        const ele = document.getElementsByClassName("leaflet-bottom leaflet-right");
        setTimeout(selectDeviceOnMap, 500);
        if (ele.length > 0) {
            ele[0].style.display = 'None';
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const LeafIcon = L.Icon.extend({
        options: {}
    });

    const renderColor = (color) => {
        return new LeafIcon({
            iconUrl:
                `https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color}&chf=a,s,ee00FFFF`
        });
    };

    const renderIcon = (statusColor) => {
        switch (statusColor) {
            case -1:
                return "c3baba";
            case 0:
                return "286a90";
            case 1:
                return "4b8102";
            case 2:
                return "fde64b";
            case 3:
                return "9b7bff";
            case 99:
                return "d0515b";
            default:
                return null;
        }
    };

    return (
        <>
            <Col lg={12} className="w-100 px-1 pt-3">
                <div
                    className="border" style={{minHeight: '100%'}}
                    onClick={clearSelectedDevice}
                >
                    <MapContainer
                        className="map_container"
                        center={position}
                        zoom={zoom.default}
                        fullscreenControl
                    >
                        <ChangeView
                            center={[location.latitude, location.longitude]}
                            zoom={zoom.default}
                        />
                        <TileLayer url="https://g1.cloudgis.vn/services/rest/maps/roadmap/tile/{z}/{x}/{y}.png"/>
                        {(dataDevices || []).map(device =>
                            device?.latitude && device?.longitude &&
                            <Marker
                                position={[device.latitude, device.longitude]}
                                key={device.id}
                                icon={renderColor(renderIcon(device?.status))}
                            >
                                <Popup>
                                    <div className="d-flex justify-content-between">
                                        <div className="font-weight-bold mr-1">
                                            <div>Mã thiết bị:</div>
                                            <div>Vĩ độ (Latitude):</div>
                                            <div>Kinh độ (Longitude):</div>
                                        </div>
                                        <div>
                                            <div>{device.mac}</div>
                                            <div>{device.latitude}</div>
                                            <div>{device.longitude}</div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            </Col>
        </>
    );
});

export default Map;