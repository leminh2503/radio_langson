import React, {useEffect, useState} from 'react';
import {Col, Input, Modal, Row}     from "antd";

import Notify      from "../../../Utils/Notify/Notify";
import apiCalendar from "../../../Api/Calendar/Calendar";
import moment      from "moment";

const ModalDefaultCalendar = (props) => {
    const {onOk, onCancel, visible} = props;

    const [isLoading, setIsLoading] = useState(false);

    const [inputValue, setInputValue] = useState('');

    const handleBeforeOk = () => {
        if (inputValue === '') {
            return Notify.error("Tên lịch không được để trống");
        }
        setIsLoading(true);
        apiCalendar.createCalendar({
            adTree: {
                title: inputValue ?? "Chưa điền tên lịch",
                province: null,
                districts: [],
                wards: [],
                selected: []
            },
            default_calendar: true,
            date_schedule: moment().format("YYYY-MM-DD")
        }, (err, res) => {
            if (res) {
                setIsLoading(false);
                onCancel();
                onOk();
            } else {
                setIsLoading(false);
            }
        });
    };

    const onChangeInput = (e) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        if (visible) {
            setIsLoading(false);
            setInputValue('');
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            title="Tạo lịch mặc định"
            okText="Xác nhận"
            cancelText="Hủy bỏ"
            onOk={handleBeforeOk}
            onCancel={onCancel}
            confirmLoading={isLoading}
            width={350}
        >
            <Row className="w-100 align-items-center">
                <Col span={5} className="text-bold-5">Tên lịch:</Col>
                <Col xs={{span: 18, offset: 1}} className="ml-1 mt-1">
                    <Input
                        value={inputValue}
                        onChange={onChangeInput}
                        placeholder="Tên lịch mặc định"
                    />
                </Col>
            </Row>
        </Modal>
    );
};

export default ModalDefaultCalendar;