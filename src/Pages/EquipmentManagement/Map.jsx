import React, {useEffect, useRef, useState}               from 'react';
import {Col}                                    from "reactstrap";
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import L                                        from 'leaflet';
import 'react-leaflet-fullscreen-control';
import apiUser                  from "../../Api/User/User"
delete L.Icon.Default.prototype._getIconUrl;

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
    const position = [location.latitude, location.longitude]
    useEffect(() => {
        apiUser.getMe( (err, res) => {
            if (res) {
                setLocation(res.administrativeCode)
            }
         })
    },[])
    const zoom = useRef({
        default: 9
    }).current;

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

    const redIcon = new LeafIcon({
        iconUrl:
            "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000&chf=a,s,ee00FFFF"
    });
    const goldIcon = new LeafIcon({
        iconUrl:
            "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFDE00&chf=a,s,ee00FFFF"
    });

    const greenIcon = new LeafIcon({
        iconUrl:
            "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|2BFF00&chf=a,s,ee00FFFF"
    });
    const violetIcon = new LeafIcon({
        iconUrl:
            "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|AF00FF&chf=a,s,ee00FFFF"
    });

    const blackIcon = new LeafIcon({
        iconUrl:
            "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|BDBDBD&chf=a,s,ee00FFFF"
    });

    const renderIcon = (statusColor) => {
        switch (statusColor) {
            case 0:
                return greenIcon;
            case 1:
                return goldIcon;
            case 2:
                return redIcon;
            case 3:
                return violetIcon;
            case 4:
                return blackIcon;
            default: return null;
        }
    };

    const random = Math.floor(Math.random() * 4) + 1;

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
                        <TileLayer url="https://g1.cloudgis.vn/services/rest/maps/roadmap/tile/{z}/{x}/{y}.png"/>
                        {(dataDevices || []).map(device =>
                            device?.latitude && device?.longitude &&
                            <Marker
                                position={[device.latitude, device.longitude]}
                                key={device.id}
                                icon={renderIcon(random)}
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