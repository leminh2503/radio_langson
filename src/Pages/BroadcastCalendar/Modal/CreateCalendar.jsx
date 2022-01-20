import React, {useRef, useState}                                     from 'react';
import {DatePicker, Divider, Image, Input, Row}                      from "antd";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import moment                                                        from "moment";

import ImageSchedule      from "../../../Assets/icon/schedule.png";
import TreeAdministrative from "../Tree/TreeAdministrative";
import apiCalendar        from "../../../Api/Calendar/Calendar";
import Notify             from "../../../Utils/Notify/Notify";

const CreateCalendar = React.memo((props) => {
    const {isOpen, onClose, setState} = props;

    const adCode = useRef('');

    const data = useRef({
        date: moment(),
        title: null
    });

    const [isLoading, setIsLoading] = useState(false);

    const onChangeDate = date => {
        data.current.date = date;
    };

    const onChangeTitle = e => {
        data.current.title = e.target.value;
    };

    const handleCreateCalendar = () => {
        if (!data.current.date) {
            Notify.error('Ngày không được để trống');
            return;
        }
        if (!data.current.title) {
            Notify.error('Tên lịch không được để trống');
            return;
        }
        setIsLoading(true);
        apiCalendar.createCalendar({
            date_schedule: data.current.date.format("YYYY-MM-DD"),
            ad_tree: {
                ...adCode.current,
                title: data.current.title
            }
        }, (err, res) => {
            if (res) {
                onClose();
                setTimeout(() => {
                    setState(prev => ({
                        ...prev,
                        isLoading: true,
                        isCreated: true
                    }));
                }, 100);
            }
            setIsLoading(false);
        });
    };

    return (
        <Modal isOpen={isOpen}>
            <ModalHeader toggle={onClose}>
                Tạo lịch phát sóng
            </ModalHeader>
            <ModalBody>
                <Row className="">
                    <Row className="w-100 row-all-center">
                        <Image
                            preview={false}
                            width={120}
                            height={120}
                            src={ImageSchedule}
                        />
                        <div className="p-3">
                            <div className="mb-3">
                                <div className="text-bold-5 mb-2">Ngày</div>
                                <DatePicker
                                    className="w-100"
                                    defaultValue={data.current.date}
                                    format="DD/MM/YYYY"
                                    onChange={onChangeDate}
                                />
                            </div>
                            <Row className="my-3">
                                <span className="text-bold-5">Tên lịch</span>
                                <Input
                                    className="mt-1"
                                    placeholder='Tên của lịch'
                                    onChange={onChangeTitle}
                                />
                            </Row>
                        </div>
                    </Row>
                    <div className="text-bold-5">
                        <i>* Chọn địa điểm:</i>
                    </div>
                    <Divider className="mt-2 mb-0"/>
                    <div
                        className="w-100 my-3 "
                        style={{height: '300px', overflow: 'auto'}}
                    >
                        <TreeAdministrative
                            adCode={adCode}
                        />
                    </div>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={isLoading}
                    className="mr-1"
                    color="danger"
                    size="md"
                    onClick={onClose}
                >
                    Hủy
                </Button>
                <Button
                    disabled={isLoading}
                    color="primary"
                    size="md"
                    onClick={handleCreateCalendar}
                >
                    Xác nhận
                    {
                        isLoading &&
                        <Spinner size="sm" className="ml-1"/>
                    }
                </Button>
            </ModalFooter>
        </Modal>
    );
});

export default CreateCalendar;