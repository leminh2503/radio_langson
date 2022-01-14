import React                     from 'react';
import {Card, DatePicker, Input} from "antd";
import {FontAwesomeIcon}         from "@fortawesome/react-fontawesome";
import {faFileAudio}             from "@fortawesome/free-solid-svg-icons";
import {FormGroup}               from "reactstrap";
import {formatSecToTime}         from "../../../Utils/DateTime/DateTime";
import moment                    from "moment";

const ModalRightContent = ({state, content, time}) => {
    return (
        <div className={`modal_right-content_live-component mt-0 ${state.file === null ? 'row-all-center' : ''}`}>
            {
                state.file === null ?
                    <div className="row-all-center">
                        <Card>
                            <FontAwesomeIcon icon={faFileAudio}/>
                            <span className="ml-2 text-bold-5">
                                Chưa chọn File nào
                            </span>
                        </Card>
                    </div>
                    :
                    <>
                        <div className="mt-2">
                            <div className="row-all-center">
                                <FontAwesomeIcon
                                    icon={faFileAudio}
                                    className="border"
                                    style={{height: '100px', width: '100px', padding: '10px'}}
                                />
                            </div>
                            <FormGroup>
                                <div className="mt-2">
                                    <div className="mt-2 text-bold-5">Tên File:</div>
                                    <Input.TextArea
                                        readOnly
                                        className="mt-1"
                                        value={state.file.title}
                                        autoSize
                                    />
                                </div>
                                <div className="mt-2">
                                    <div className="mt-2 text-bold-5">Thời lượng:</div>
                                    <Input
                                        readOnly
                                        className="mt-1"
                                        value={formatSecToTime(state.file?.duration)}
                                    />
                                </div>
                                <div className="mt-2">
                                    <div className="mt-2 text-bold-5">Ngày Upload File:</div>
                                    <Input
                                        readOnly
                                        className="mt-1"
                                        value={moment(state.file.created).format("DD/MM/YYYY HH:mm")}
                                    />
                                </div>
                                <div className="mt-2">
                                    <div className="text-bold-5 mb-1">
                                        * <u>Nội dung phát:</u>
                                    </div>
                                    <Input
                                        placeholder={`Điền nội dung`}
                                        onChange={(e) => content.current = e.target.value}
                                    />
                                </div>
                                <div className="mt-2">
                                    <div className="mt-2 text-bold-5">Thời gian bắt đầu:</div>
                                    <DatePicker.TimePicker
                                        showNow={false}
                                        showTime
                                        className="mt-1 w-100"
                                        onChange={(value) => time.current = value}
                                    />
                                </div>
                                <div className="mt-2">
                                    <i style={{color: 'red'}}>
                                        * Không chọn thời gian bắt đầu sẽ tự động lấy giờ hiện tại
                                    </i>
                                </div>
                            </FormGroup>
                        </div>
                    </>
            }
        </div>
    );
};

export default ModalRightContent;