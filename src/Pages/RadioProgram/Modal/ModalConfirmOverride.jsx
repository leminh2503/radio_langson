import {Checkbox, Col, Modal, Row}  from "antd";
import React, {useEffect, useState} from "react";

import apiProgram                                                                   from "../../../Api/Program/Program";
import {convertOwnerIdProgram as convertOwnerId, convertTimeProgram as convertTime} from "../Etc/Etc";
import Notify                                                                       from "../../../Utils/Notify/Notify";

const ModalConfirmOverride = React.memo(({
                                             visible,
                                             onCancel,
                                             data,
                                             scheduleObj,
                                             closeModalCreate,
                                             closeModalEdit,
                                             editedOverride
                                         }) => {
    const [checked, setChecked] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const handleChecked = () => {
        setChecked(!checked);
    };

    const handleCreateProgram = () => {
        if (!checked) {
            return Notify.error("Chưa xác nhận ghi đè");
        }
        setIsLoading(true);
        apiProgram[editedOverride.current.editMode ? 'editProgram' : 'createProgram']({
            ...data.dataRequest,
            overridden: true,
            idSchedule: editedOverride.current.programId ?? undefined
        }, (err, res) => {
            if (res) {
                scheduleObj.current[editedOverride.current.editMode ? 'saveEvent' : 'addEvent']({
                    ...res,
                    OwnerId: convertOwnerId(res),
                    ...convertTime(res)
                });
                onCancel();
                if (editedOverride.current.editMode) {
                    closeModalEdit();
                } else {
                    closeModalCreate();
                }
                Notify.success(`${editedOverride.current.editMode ? 'Sửa' : 'Thêm'} chương trình thành công`);
            }
            setIsLoading(false);
        });
    };

    useEffect(() => {
        if (!visible) {
            editedOverride.current = {
                editMode: false,
                programId: null
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal
            title="Danh sách chương trình sẽ bị ghi đè"
            visible={visible}
            onCancel={onCancel}
            onOk={handleCreateProgram}
            okText="Đồng ý"
            zIndex={9999}
            okButtonProps={{disabled: !checked}}
            confirmLoading={isLoading}
        >
            <Row className="justify-content-between">
                <Col span={3} className="text-bold-5">STT</Col>
                <Col span={7} className="text-bold-5">Khung giờ</Col>
                <Col span={7} className="text-bold-5">Tên chương trình</Col>
                <Col span={7} className="text-bold-5">Sở hữu</Col>
            </Row>
            {
                data.dataResponse.map((item, i) => (
                    <Row className="justify-content-between mt-1" key={i}>
                        <Col span={3} className="pr-1">{i + 1}</Col>
                        <Col span={7} className="pr-1">{item.timeStart} - {item.timeEnd}</Col>
                        <Col span={7} className="pr-1">{item.title}</Col>
                        <Col span={7}
                             className="pr-1">{item.broadcastCalendar.adTree.administrativeCode.nameWithType}</Col>
                    </Row>
                ))
            }
            <div className="mt-3">
                <Checkbox
                    checked={checked}
                    onClick={handleChecked}
                />
                <span className="text-bold-5 ml-2">Xác nhận ghi đè</span>
            </div>
        </Modal>
    );
});

export default ModalConfirmOverride;