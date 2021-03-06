import React, {useRef, useState, useEffect}                                                   from "react";
import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";

import Notify          from "../../../Utils/Notify/Notify";
import {Select}        from "antd";
import SelectComponent from "../../../Pages/ContentManagement/Modal/Select";

const CustomInput = React.memo(({
                                    title,
                                    field,
                                    value,
                                    type,
                                    onChange,
                                    placeholder,
                                    isLoading
                                }) => {
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
                    type !== 'tags' && type !== 'select' &&
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

    const [parentThread, setParentThread] = useState();

    const [childThread, setChildThread] = useState();

    const listPlaceholder = {
        file: 'T??n file',
        folder: 'T??n th?? m???c',
        tags: 'C??c th??? tag'
    };

    const listField = useRef({
        new: {
            file: [
                {title: 'Ch???n file', field: 'file', type: 'file', duration: 0},
                {title: 'T??n file', field: 'title', placeholder: listPlaceholder.file},
                {title: 'C??c th??? tag', field: 'tags', type: 'tags', placeholder: listPlaceholder.tags},
                {title: 'Danh m???c', field: 'select', type: 'select'}

            ],
            folder: [
                {title: 'T??n th?? m???c', field: 'title', placeholder: listPlaceholder.folder}
            ]
        },
        edit: {
            file: [
                {title: 'T??n file', field: 'title', placeholder: listPlaceholder.file},
                {title: 'C??c th??? tag', field: 'tags', type: 'tags', placeholder: listPlaceholder.tags},
                {title: 'Danh m???c', field: 'select', type: 'select'}
            ],
            folder: [
                {title: 'T??n th?? m???c', field: 'title', placeholder: listPlaceholder.folder}
            ]
        },
        delete: {
            file: {
                title: 'X??c nh???n x??a t???p'
            },
            folder: {
                title: 'X??c nh???n x??a th?? m???c'
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
            tag: '',
            thread1: {},
            thread2: {}
        }
    }).current;

    const [data, setData] = useState();

    const [isLoading, setIsLoading] = useState(false);

    const initCurrentAdCode = useRef({
        parentThread: null,
        childThread: null
    });

    React.useEffect(() => {
        if (visible) {
            if (typeModal === 'new') {
                if (typeItem === 'folder') {
                    setData(initData.folder);
                } else if (typeItem === 'file') {
                    setData(initData.file);
                    setChildThread(null);
                    setParentThread(null);
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
                    setData(prev => {
                        return {
                            ...prev,
                            duration: audio.duration
                        };
                    });
                }, false);
            };
            reader.readAsDataURL(data.file);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.file, typeModal]);

    const handleOk = () => {
        if (typeItem === 'folder') {
            if (data?.title === '') {
                Notify.error('T??n kh??ng ???????c ????? tr???ng');
                return;
            }
        }

        if (typeItem === 'file' && typeModal === 'new') {
            if (data?.file === '' || data?.file === undefined) {
                Notify.error('Ch??a ch???n t???p tin n??o');
                return;
            }
        }
        let tags = "";
        let newFileName = data?.file?.name;
        if (typeItem === 'file') {
            (data?.tags?.length > 0 ? data.tags : []).forEach((t, i) => {
                if (i === 0) {
                    tags = t;
                } else {
                    tags = `${tags}#${t}`;
                }
            });
            if (data?.title === '') {
                setData(prev => ({
                    ...prev,
                    title: newFileName
                }));
            }
        }
        setIsLoading(true);
        if (typeModal === 'new') {
            onOk(data, setIsLoading, parentThread?.id, childThread?.id, newFileName);
            return;
        }
        if (folderInfo?.type === 'file') {
            onOk({...data, tags, thread1: parentThread?.id, thread2: childThread?.id}, setIsLoading, 'e-File');
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
                        `?????i t??n ${typeItem === 'folder' ? 'th?? m???c' : 'file'}`
                        :
                        `T???o m???i ${typeItem === 'folder' ? 'th?? m???c' : 'file'}`
                }
            </ModalHeader>
            <ModalBody>
                {
                    (listField[typeModal][typeItem] ?? []).map(({title, field, type, placeholder}, i) => (

                        <CustomInput
                            typeModal={typeModal}
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
                {
                    typeItem === 'file' &&
                    <div className="d-flex">
                        <SelectComponent
                            visible={visible}
                            initCurrentAdCode={initCurrentAdCode}
                            setParentThread={setParentThread}
                            setChildThread={setChildThread}
                            typeModal={typeModal}
                            thread1={parentThread}
                            thread2={childThread}
                            folderInfo={folderInfo}
                        />
                    </div>
                }
            </ModalBody>
            <ModalFooter>
                <Button
                    className="mr-1"
                    color="danger"
                    size="md"
                    onClick={handleClose}
                >
                    H???y
                </Button>
                <Button
                    color="primary"
                    size="md"
                    onClick={handleOk}
                >
                    L??u
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
