import React, {useRef, useState, useEffect}                                     from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {Image, Input, Row, Select}                                           from "antd";
import moment                                                        from "moment";

import ImageSchedule      from "../../../Assets/icon/schedule.png";
import CustomCalendar     from "../../../Components/CustomTag/CustomCalendar";
import TreeAdministrative from "../Tree/TreeAdministrative";
import Notify             from "../../../Utils/Notify/Notify";
import apiCalendar        from "../../../Api/Calendar/Calendar";

const RepeatCalendar = React.memo((props) => {
    const {isOpen, onClose, selectedCalendar, reFetchData, inRadioProgram} = props;

    const adTree = useRef('');

    const dateArrays = useRef([]);

    const titleCalendar = useRef('');

    const [isLoading, setIsLoading] = useState(false);

    const handleBeforeOk = () => {
        const { province, districts, wards, selected } = adTree.current;
        if (!adTree.current || (!province && districts?.length === 0 && wards?.length === 0 && selected?.length === 0)) {
            Notify.error('Chưa chọn địa điểm để lặp lịch');
            return;
        }
        if (dateArrays.current.length === 0) {
            Notify.error('Chưa chọn ngày lặp chương trình');
            return;
        }
        setIsLoading(true);
        apiCalendar.repeatCalendar({
            id: selectedCalendar?.id,
            date_loop: dateArrays.current.map(d => moment(d).format("YYYY-MM-DD")),
            adTree: {
                ...adTree.current,
                title: titleCalendar.current ? titleCalendar.current : `Lịch lặp ngày ${moment(selectedCalendar?.dateSchedule).format("DD/MM/YYYY")}`
            }
        }, (err, res) => {
            if (res) {
                if (!inRadioProgram) {
                    reFetchData();
                    titleCalendar.current = '';
                    adTree.current = '';
                    dateArrays.current = [];
                }
                onClose();
            }
            setIsLoading(false);
        });
    };

    return (
        <Modal isOpen={isOpen} style={{maxWidth: '750px', overflow: 'auto'}}>
            <ModalHeader toggle={onClose}>
                Lặp lịch: " {selectedCalendar?.adTree?.title} "
                ngày {moment(selectedCalendar?.dateSchedule).format("DD/MM/YYYY")}
            </ModalHeader>
            <ModalBody>
                <Row className="">
                    <div className="border-right modal_tree-administrative">
                        <div className="text-bold-5">
                            <i>* Chọn địa điểm:</i>
                        </div>
                        <div className="mt-2">
                            <TreeAdministrative
                                adCode={adTree}
                            />
                        </div>
                    </div>
                    <div className="modal_right-content">
                        <Row className="justify-content-center pt-2">
                            <Image
                                className="mt-3 row-all-center"
                                preview={false}
                                width={120}
                                height={120}
                                src={ImageSchedule}
                            />
                            <div className="px-3 modal_right-content_input">
                                <Row className="my-3">
                                    <span className="text-bold-5">Tên lịch sẽ lặp:</span>
                                    <Input
                                        placeholder="Tên lịch"
                                        className="mt-1"
                                        onChange={(e) => titleCalendar.current = e.target.value}
                                    />
                                </Row>
                            </div>
                        </Row>

                        <Row className="px-3 py-1 modal_repeat-date-calendar">
                            <CustomCalendar
                                dateArrays={dateArrays}
                            />
                        </Row>
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
                    onClick={handleBeforeOk}
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

export default RepeatCalendar;