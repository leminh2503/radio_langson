import React, {useRef, useState}        from 'react';
import {AudioOutlined, LoadingOutlined} from "@ant-design/icons";
import ss                               from "socket.io-stream";
import io                               from "socket.io-client";
import {Card, Input, Row}               from "antd";
import mqtt                             from "mqtt";
import moment                           from 'moment';

import apiProgram from "../../../Api/Program/Program";
import Notify     from "../../../Utils/Notify/Notify";
import Alert      from "../../../Utils/Notify/Alert";
import AlertValid from "../../../Components/CustomTag/AlertValid";


const typeVerifyOTP = {
    VERIFY_LIVE: 1,
    VERIFY_EME: 2
};

const RecordComponent = React.memo((props) => {
    const {
        adCode,
        mustSelectAdministrative,
        onDisableTreeAdministrative,
        type,
        style,
        classNames,
        selectedCalendar
    } = props;

    const typeLive = type === 'live' ? 'trực tiếp' : 'khẩn cấp';

    const socket = useRef();

    const clientMqtt = useRef(undefined);

    const liveStream = useRef(null);

    const content = useRef('');

    const [isRecording, setIsRecording] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [recorder, setRecorder] = useState({
        mediaRecorder: null,
        streamRecord: null
    });

    const [showInvalidContent, setShowInvalidContent] = useState(false);

    const connectWebSocket = (mount, otp, stream) => {
        const queryType = type === 'live' ? typeVerifyOTP.VERIFY_LIVE : typeVerifyOTP.VERIFY_EME;
        const connectSocket = io.connect(`${process.env.REACT_APP_SOCKET_IO}`, {
            query: `mount=${mount}&otp=${otp}&type=${queryType}`,
            path: process.env.REACT_APP_PATH_SOCKET_IO
        });
        socket.current = connectSocket;
        connectSocket.on('auth', (res) => {
            if (res?.status === 'connected') {
                startRecording(stream);
            }
        });
        connectSocket.on("error", (e) => {
            stopRecording('crash');
            console.log("Error", e);
        });
        connectSocket.on("disconnect", () => {
            stopRecording('crash');
            Notify.success("Ngắt kết nối trực tiếp");
        });
    };

    const requestOtp = () => {
        const formatTime = "HH:mm:ss";
        const currentTime = moment().format(formatTime);
        if (navigator?.mediaDevices) {
            navigator.mediaDevices.getUserMedia({audio: true})
                .then((stream) => {
                    apiProgram[type === 'live' ? 'createLive' : 'createEmergency']({
                        title: content.current ? content.current : `Chương trình ${type === 'live' ? 'trực tiếp' : 'khẩn cấp'} từ mic lúc ${currentTime}`,
                        broadcastCalendar: selectedCalendar?.id,
                        adTree: adCode.current,
                        sourceStream: {sourceType: type === 'live' ? 6 : 8},
                        timeStart: null,
                        timeEnd: null
                    }, (err, res) => {
                        if (res) {
                            liveStream.current = res;
                            connectWebSocket(res?.mount, res?.otp, stream);
                        } else {
                            stopRecording();
                            stream.getTracks().forEach(track => track.stop());
                        }
                    });
                }).catch(() => {
                setIsLoading(false);
                Notify.error('Thiết bị thu âm không được cho phép');
            });
        } else {
            setIsLoading(false);
            Notify.error('Không tìm thấy thiết bị thu âm');
        }
    };

    const startRecording = (stream) => {
        console.log('a');
        onDisableTreeAdministrative(true);
        setIsRecording(true);
        setIsLoading(false);
        const streamRecord = ss.createStream();
        ss(socket.current).emit('stream_audio', streamRecord);
        /* global eftaqzlbbbajzxiqofkmlmsomwxdffzo*/
        const mediaRecorder = new eftaqzlbbbajzxiqofkmlmsomwxdffzo(stream, {audioBitsPerSecond: 32000});
        mediaRecorder._encoder.ondata = (buffers) => {
            streamRecord.write(ss.Buffer(buffers));
        };
        mediaRecorder.start();
        setRecorder({mediaRecorder, streamRecord, stream});
    };

    const stopRecording = (type) => {
        const {mediaRecorder, streamRecord, stream} = recorder;
        onDisableTreeAdministrative(false);
        setIsLoading(false);
        setIsRecording(false);
        if (socket.current) {
            socket.current.disconnect();
        }
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        if (streamRecord) {
            streamRecord.end();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (type === 'crash') return;
        setTimeout(() => {
            setRecorder({
                mediaRecorder: null,
                streamRecord: null
            });
        }, 100);
    };

    const handleRecord = () => {
        if (isLoading) return;
        if (!isRecording) {
            setIsLoading(true);
            setTimeout(() => {
                requestOtp();
            }, 1000);
        } else {
            setIsLoading(true);
            setTimeout(() => {
                stopRecording();
            }, 1000);
        }
    };

    const handleCheckBeforeRecord = () => {
        if (isRecording) {
            Alert.confirm('Xác nhận dừng thu âm ?', (check) => {
                if (check) {
                    handleRecord();
                }
            });
            return;
        }
        if (mustSelectAdministrative) {
            const {province, districts, wards, selected} = adCode.current;
            if (!adCode.current || (!province && districts.length === 0 && wards.length === 0 && selected.length === 0)) {
                return Notify.error(`Chưa chọn địa điểm phát`);
            }
        }

        Alert.confirm(`Xác nhận phát ${typeLive} từ Mic ?`, (check) => {
            if (check) {
                handleRecord();
            }
        });
    };

    const onChangeContent = (e) => {
        if (e.target.value === '') setShowInvalidContent(true);
        else if (showInvalidContent) setShowInvalidContent(false);
        content.current = e.target.value;
    };

    const renderIcon = () => {
        if (isLoading) {
            return (
                <LoadingOutlined className="loading-icon"/>
            );
        }
        return (
            <AudioOutlined className="micro-icon"/>
        );
    };

    React.useEffect(() => {
        const client = mqtt.connect(process.env.REACT_APP_MQTT_WSS, {
            reconnectPeriod: 10000
        });

        client.on('connect', function () {
            client.subscribe('off_live_eme', function (err) {
                if (!err) {
                    clientMqtt.current = client;
                }
            });
        });

        client.on('message', function (topic) {
            if (topic === 'off_live_eme') {
                apiProgram.endEme({
                    id: liveStream.current?.id ?? ""
                }, (err, res) => {
                    if (res) {
                        stopRecording('crash');
                        Notify.error("Dừng phát khẩn cấp do cấp trên phát", {autoClose: 30 * 1000});
                    }
                });
            }
        });

        return () => {
            setRecorder({
                mediaRecorder: null,
                streamRecord: null
            });
            stopRecording('crash');
            if (client) {
                client.end();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="modal_right-content_live-component">
            <Row className="mb-1">
                <div className="text-bold-5 mb-1">
                    <u>Nội dung phát {typeLive}:</u>
                </div>
                <Input
                    placeholder={`Điền nội dung`}
                    onChange={onChangeContent}
                />
                <div className="mt-2">
                    <i style={{color: 'red'}}>
                        * Không điền nội dung sẽ lấy tên nội dung là giờ phát
                    </i>
                </div>
            </Row>
            <Card
                className={`modal_right-content_live-component_card border row-all-center ${classNames}`}
                style={style}
            >
                <div
                    className={`hover-pointer ${isRecording ? 'lds-ripple' : 'row-all-center'}`}
                    onClick={handleCheckBeforeRecord}
                >
                    <div className="lds-ripple_children"/>
                    <div className="lds-ripple_children"/>
                    <div className="icon-micro-modal text-center">
                        {renderIcon()}
                    </div>
                    {
                        <div className="text-bold-5" style={{color: 'cadetblue', fontSize: '16px', marginTop: '215px'}}>
                            <i>
                                {
                                    isRecording ?
                                        'Đang thu âm...'
                                        :
                                        isLoading ?
                                            'Đang xử lý...'
                                            :
                                            'Nhấn để thu âm...'
                                }
                            </i>
                        </div>
                    }
                </div>
            </Card>
        </div>
    );
});

export default RecordComponent;
