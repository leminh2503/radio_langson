import React, {useRef, useState}                                                              from "react";
import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";

import Notify   from "../../../Utils/Notify/Notify";
import {Select} from "antd";

const CustomInput = React.memo(({title, field, value, type, onChange, placeholder, isLoading}) => {
    return (
        <FormGroup>
            <Label
                className="text-bold-5"
                for={field}
            >
                {title}
            </Label>
            {
                type === 'tags' &&
                <Select
                    disabled={isLoading}
                    value={value}
                    mode="tags"
                    open={false}
                    style={{width: '100%'}}
                    placeholder={placeholder}
                    onChange={(value) => onChange(value.filter(v => !!v))}
                    tokenSeparators={['#']}
                />
            }
            {
                type === 'file' ?
                    <Input
                        accept=".mp3, .mp4, .wav, .wmv, .flac, .aac"
                        disabled={isLoading}
                        type="file"
                        className={type === 'file' ? 'hidden-long-text' : ''}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.files[0])}
                    />
                    :
                    type !== 'tags' &&
                    <Input
                        disabled={isLoading}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
            }
        </FormGroup>
    );
});

const ModalFilesFolder = React.memo(({visible, handleClose, typeModal, typeItem, onOk, folderInfo}) => {
    if (typeItem === 'administrative') {
        typeItem = 'folder';
    }

    const listPlaceholder = {
        file: 'Tên file',
        folder: 'Tên thư mục',
        tags: 'Các thẻ tag'
    };

    const listField = useRef({
        new: {
            file: [
                {title: 'Chọn file', field: 'file', type: 'file', duration: 0},
                {title: 'Tên file', field: 'title', placeholder: listPlaceholder.file},
                {title: 'Các thẻ tag', field: 'tags', type: 'tags', placeholder: listPlaceholder.tags}
            ],
            folder: [
                {title: 'Tên thư mục', field: 'title', placeholder: listPlaceholder.folder}
            ]
        },
        edit: {
            file: [
                {title: 'Tên file', field: 'title', placeholder: listPlaceholder.file},
                {title: 'Các thẻ tag', field: 'tags', type: 'tags', placeholder: listPlaceholder.tags}
            ],
            folder: [
                {title: 'Tên thư mục', field: 'title', placeholder: listPlaceholder.folder}
            ]
        },
        delete: {
            file: {
                title: 'Xác nhận xóa tệp'
            },
            folder: {
                title: 'Xác nhận xóa thư mục'
            }
        }
    }).current;

    const initData = useRef({
        folder: {
            title: ''
        },
        file: {
            title: '',
            file: '',
            tag: ''
        }
    }).current;

    const [data, setData] = useState();

    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (visible) {
            if (typeModal === 'new') {
                if (typeItem === 'folder') {
                    setData(initData.folder);
                } else if (typeItem === 'file') {
                    setData(initData.file);
                }
            } else if (typeModal === 'edit') {
                const newData = {
                    id: folderInfo?.id,
                    title: folderInfo?.title
                };
                if (typeItem === 'file') {
                    if (folderInfo?.tags) {
                        newData.tags = folderInfo?.tags.split("#");
                    }
                }
                setData(newData);
            }
        } else {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    React.useEffect(() => {
        if (data?.file && typeModal === "new") {
            const audio = document.createElement('audio');
            const reader = new FileReader();
            reader.onload = (e) => {
                audio.src = e.target.result;
                audio.addEventListener('loadedmetadata', () => {
                    setData(prev => ({...prev, duration: audio.duration}));
                }, false);
            };
            reader.readAsDataURL(data.file);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.file, typeModal]);

    const handleOk = () => {
        if (data?.title === '') {
            Notify.error('Tên không được để trống');
            return;
        }
        if (typeItem === 'file' && typeModal === 'new') {
            if (data?.file === '' || data?.file === undefined) {
                Notify.error('Chưa chọn tệp tin nào');
                return;
            }
        }
        let tags = "";
        if (typeItem === 'file') {
            (data?.tags?.length > 0 ? data.tags : []).forEach((t, i) => {
                if (i === 0) {
                    tags = t;
                } else {
                    tags = `${tags}#${t}`;
                }
            });
        }
        setIsLoading(true);
        if (typeModal === 'new') {
            onOk(data, setIsLoading);
            return;
        }
        if (folderInfo?.type === 'file') {
            onOk({...data, tags}, setIsLoading, 'e-File');
        } else {
            onOk(data, setIsLoading, 'e-Folder');
        }
    };

    if (!typeModal || !typeItem) return null;

    return (
        <Modal isOpen={visible} toggle={handleClose}>
            <ModalHeader toggle={handleClose}>
                {
                    typeModal === 'edit' ?
                        `Đổi tên ${typeItem === 'folder' ? 'thư mục' : 'file'}`
                        :
                        `Tạo mới ${typeItem === 'folder' ? 'thư mục' : 'file'}`
                }
            </ModalHeader>
            <ModalBody>
                {
                    (listField[typeModal][typeItem] ?? []).map(({title, field, type, placeholder}, i) => (
                        <CustomInput
                            value={data !== undefined ? data[field] : null}
                            key={i}
                            title={title}
                            field={field}
                            type={type}
                            placeholder={placeholder}
                            isLoading={isLoading}
                            onChange={(value) => {
                                setData(prev => ({
                                    ...prev,
                                    [field]: value
                                }));
                            }}
                        />
                    ))
                }
            </ModalBody>
            <ModalFooter>
                <Button
                    className="mr-1"
                    color="danger"
                    size="md"
                    onClick={handleClose}
                >
                    Hủy
                </Button>
                <Button
                    color="primary"
                    size="md"
                    onClick={handleOk}
                >
                    Lưu
                    {
                        isLoading &&
                        <Spinner size="sm" className="ml-1"/>
                    }
                </Button>
            </ModalFooter>
        </Modal>
    );
});

export default ModalFilesFolder;
