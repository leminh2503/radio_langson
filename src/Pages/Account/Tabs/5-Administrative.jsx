import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    CloseCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    MenuOutlined,
    PlusCircleOutlined,
    SaveOutlined
}                                                                 from '@ant-design/icons';
import {
    Breadcrumb,
    Button,
    Col,
    Form,
    Input,
    Modal,
    Popconfirm,
    Row,
    Select,
    Tooltip
}                                                                 from 'antd';
import {useDispatch, useSelector}                                 from 'react-redux';
import _                                                          from 'lodash';

import apiAdministrative from '../../../Api/Administrative/Administrative';
import CustomTable       from '../../../Components/CustomTag/CustomTable';
import {userChange}      from '../../../Redux/Actions/userAction';
import {openSidebar}     from '../../../Redux/Actions/appActions';
import Notify            from '../../../Utils/Notify/Notify';
import {nameWithType}    from '../Etc/Etc';
import apiMap            from '../../../Api/Map/Map';

const ModalCreateAd = ({
                           currentAd,
                           visible,
                           onOk,
                           onCancel,
                           renderTypeName
                       }) => {
    const selectOptions = [
        ['quan', 'huyen'],
        ['phuong', 'xa', 'thi-tran'],
        ['lang', 'xom', 'kdc', 'to']
    ];
    const [adString, setAdString] = useState('');

    const [typeName, setTypeName] = useState('');

    const [loading, setLoading] = useState(false);

    const onChangeInput = e => {
        setAdString(e.target.value);
    };

    const handleBeforeOk = () => {
        const code = currentAd?.code ?? '';
        if (!code) return;
        setLoading(true);
        if (adString.trim().length === 0) {
            Notify.error(`${nameWithType[typeName]} không được để trống`);
            setLoading(false);
            return;
        }
        apiAdministrative.createAdministrative(
            {
                parent_code: code,
                name: adString,
                typeName
            },
            (err, res) => {
                if (res) {
                    onOk(res);
                    Notify.success(`Tạo mới ${nameWithType[typeName]} thành công`)
                }
                setLoading(false);
            }
        );
    };

    const onChangeSelectTypeName = value => {
        setTypeName(value);
    };

    useEffect(() => {
        if (visible) {
            setAdString('');
            setTypeName(selectOptions[currentAd?.division - 1][0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal
            title={`Tạo mới ${nameWithType[typeName]}`}
            visible={visible}
            onOk={handleBeforeOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Xác nhận">
            <Row>
                <Col md={{span: 5}} className="my-1">
                    <Select
                        value={typeName}
                        onChange={onChangeSelectTypeName}
                        dropdownMatchSelectWidth={false}
                        style={{minWidth: '100%'}}>
                        {(selectOptions[currentAd?.division - 1] ?? []).map(
                            (o, i) => (
                                <Select.Option value={o} key={i}>
                                    {nameWithType[o]}
                                </Select.Option>
                            )
                        )}
                    </Select>
                </Col>
                <Col md={{span: 18, offset: 1}} className="my-1">
                    <Input
                        className="w-100"
                        value={adString}
                        onChange={onChangeInput}
                        placeholder={`Tên ${nameWithType[typeName]}`}
                    />
                </Col>
            </Row>
        </Modal>
    );
};

const ModalCreateLocal = ({
                              currentAd,
                              visible,
                              onOk,
                              onCancel,
                              location
                          }) => {

    const _coordinatesFields = useRef([
        {key: 'longitude', title: 'Kinh độ'},
        {key: 'latitude', title: 'Vĩ độ'}
    ]).current;

    const isEdited = useRef(false);

    const [dataLocation, setDataLocation] = useState({
        latitude: '',
        longitude: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChangeInput = (e, key) => {
        if (!isEdited.current) isEdited.current = true;
        const newValue = e.target.value;
        setDataLocation(prev => {
            return {
                ...prev,
                [key]: newValue
            };
        });
    };

    useEffect(() => {
        if (visible) {
            setDataLocation(prev => ({
                ...prev,
                longitude: location?.longitude,
                latitude: location?.latitude
            }));
        }
    }, [visible]);

    const handleBeforeOk = () => {
        const code = location?.id ?? "";
        if (!isEdited.current) {
            onOk();
            return;
        }
        for (const f of _coordinatesFields) {
            if (!dataLocation[f.key]) {
                return Notify.error(`${f.title} không được để trống`);
            }
        }
        setLoading(true);
        apiMap.editMap(
            {
                id: code,
                longitude: dataLocation.longitude,
                latitude: dataLocation.latitude
            },
            (err, res) => {
                if (res) {
                    onOk(res);
                    isEdited.current = false;
                    Notify.success('Cập nhật tọa độ thành công')
                }
                setLoading(false);
            }
        );
    };

    return (
        <Modal
            title={`Cập nhật tọa độ`}
            visible={visible}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Xác nhận"
            onOk={handleBeforeOk}>
            <Row>
                <Col md={{span: 5}}>
                    <Form>
                        <Form.Item
                            name="longtitude"
                            label="Kinh Độ">
                        </Form.Item>
                    </Form>
                </Col>
                <Col md={{span: 18, offset: 1}} className="my-1">
                    <Input
                        value={dataLocation.longitude}
                        onChange={e => handleChangeInput(e, 'longitude')}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={{span: 5}}>
                    <Form>
                        <Form.Item
                            name="latitude"
                            label="Vĩ Độ">
                        </Form.Item>
                    </Form>
                </Col>
                <Col md={{span: 18, offset: 1}} className="my-1">
                    <Input
                        value={dataLocation.latitude}
                        onChange={e => handleChangeInput(e, 'latitude')}
                    />
                </Col>
            </Row>
        </Modal>
    );
};

const ModalEditCurrentAd = ({currentAd, visible, onOk, onCancel}) => {
    const _requiredFields = useRef([
        {key: 'adString', title: `${nameWithType[currentAd?.typeName]}`}
        // {key: 'latitue', title: 'Kinh độ'},
        // {key: 'longitude', title: 'Vĩ độ'}
    ]).current;

    // const _coordinatesFields = useRef([
    //     {key: 'latitue', title: 'Kinh độ'},
    //     {key: 'longitude', title: 'Vĩ độ'}
    // ]).current;

    const isEdited = useRef(false);

    const [data, setData] = useState({
        typeName: null,
        adString: '',
        latitude: '',
        longitude: ''
    });

    const [loading, setLoading] = useState(false);

    const onChangeInput = (e, key) => {
        if (!isEdited.current) isEdited.current = true;
        const newValue = e.target.value;
        setData(prev => ({
            ...prev,
            [key]: newValue
        }));
    };

    const handleBeforeOk = () => {
        const code = currentAd?.code ?? '';
        if (!isEdited.current) {
            onOk();
            return;
        }
        for (const f of _requiredFields) {
            if (!data[f.key]) {
                return Notify.error(`${f.title} không được để trống`);
            }
        }
        setLoading(true);
        apiAdministrative.editAdministrative(
            {
                code,
                typeName: data.typeName,
                name: data.adString
            },
            (err, res) => {
                if (res) {
                    onOk(res);
                    isEdited.current = false;
                }
                setLoading(false);
            }
        );
    };

    const handleChangeTypeName = value => {
        if (!isEdited.current) isEdited.current = true;
        setData(prev => ({...prev, typeName: value}));
    };

    useEffect(() => {
        if (visible) {
            setData(prev => ({
                ...prev,
                adString: currentAd?.name,
                typeName: currentAd?.typeName
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal
            title="Thay đổi địa phương gốc"
            visible={visible}
            onOk={handleBeforeOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Xác nhận"
            maskClosable={false}>
            <Row className="align-items-center">
                <Col md={{span: 6}}>
                    <Select
                        value={data.typeName}
                        onChange={handleChangeTypeName}
                        style={{minWidth: '110px'}}>
                        <Select.Option value="tinh">Tỉnh</Select.Option>
                        <Select.Option value="thanh-pho">
                            Thành phố
                        </Select.Option>
                    </Select>
                </Col>
                <Col md={{span: 18}}>
                    <Input
                        value={data.adString}
                        onChange={e => onChangeInput(e, 'adString')}
                        placeholder={nameWithType[currentAd?.typeName]}
                    />
                </Col>
            </Row>
        </Modal>
    );
};

const EditableCell = ({
                          editing,
                          dataIndex,
                          title,
                          inputType,
                          record,
                          index,
                          children,
                          ...restProps
                      }) => {
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0
                    }}
                    rules={[
                        {
                            required: true,
                            message: `Không được để trống trường ${title}!`
                        }
                    ]}>
                    <Input/>
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const Administrative = () => {
    const user = useSelector(state => state.user);

    const dispatch = useDispatch();

    const [location, setLocation] = useState({});

    const [state, setState] = useState({
        data: [],
        isLoading: true,
        dataBreadCrumb: [user?.administrativeCode],
        visibleModalEdit: false,
        visibleModalNew: false,
        visibleModalNewLocation: false
    });

    const [editingKey, setEditingKey] = useState('');

    const [form] = Form.useForm();

    const currentAd = useMemo(
        () => state?.dataBreadCrumb[state.dataBreadCrumb.length - 1] ?? '',
        [state.dataBreadCrumb]
    );

    const renderNameAd = useCallback(() => {
        switch (
            state.dataBreadCrumb[state.dataBreadCrumb.length - 1].division
            ) {
            case 1:
                return 'Quận/Huyện';
            case 2:
                return 'Phường/Xã/Thị trấn';
            case 3:
                return 'ĐĐ/Xóm/Khu dân cư/Tổ';
            default:
                return null;
        }
    }, [state.dataBreadCrumb]);

    const isEditing = useCallback(
        record => {
            return record.code === editingKey;
        },
        [editingKey]
    );

    const edit = record => {
        form.setFieldsValue({
            nameWithType: '',
            ...record
        });
        setEditingKey(record.code);
    };

    const cancel = useCallback(() => {
        setEditingKey('');
    }, []);

    const save = async code => {
        try {
            const row = await form.validateFields();
            const newData = [...state.data];
            const index = newData.findIndex(item => code === item.code);
            if (index > -1) {
                const item = newData[index];
                if (row?.nameWithType === newData[index]?.nameWithType) {
                    setEditingKey('');
                    return;
                }
                apiAdministrative.editAdministrative(
                    {
                        code,
                        name: row?.name
                    },
                    (err, res) => {
                        if (res) {
                            newData.splice(index, 1, {...item, ...row});
                            setState(prev => ({
                                ...prev,
                                data: newData
                            }));
                        }
                        setEditingKey('');
                    }
                );
            } else {
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const onDelete = record => {
        const code =
            state.dataBreadCrumb[state.dataBreadCrumb.length - 1]?.code ?? '';
        const id = record?.id ?? '';
        if (!code) return;
        setState(prev => ({
            ...prev,
            isLoading: true
        }));
        apiAdministrative.deleteAdministrative({id}, err => {
            if (!err) {
                getMoreAd(code);
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false
                }));
            }
        });
    };

    const columns = useMemo(() => {
        return [
            {
                title: 'STT',
                align: 'center',
                width: 80,
                render: (_, data, i) => i + 1
            },
            {
                title: renderNameAd(),
                dataIndex: ['name'],
                editable: true,
                render: (_, data) =>
                    `${nameWithType[data?.typeName]} ${data?.name}`
            },
            {
                title: 'Thao tác',
                align: 'center',
                width: 400,
                render: (_, record) => {
                    const editable = isEditing(record);
                    return editable ? (
                        <Row className="justify-content-center">
                            <Button
                                onClick={() => save(record?.code)}
                                className="mr-2 row-all-center"
                                icon={<SaveOutlined/>}>
                                Lưu
                            </Button>
                            <Popconfirm
                                title="Xác nhận hủy thay đổi ?"
                                onConfirm={cancel}>
                                <Button
                                    icon={<CloseCircleOutlined/>}
                                    className="row-all-center">
                                    Hủy
                                </Button>
                            </Popconfirm>
                        </Row>
                    ) : (
                        <Row className="justify-content-center">
                            <Button
                                disabled={editingKey !== ''}
                                onClick={() => edit(record)}
                                className="mr-2 row-all-center"
                                icon={<EditOutlined/>}>
                                Sửa
                            </Button>
                            <Popconfirm
                                disabled={editingKey !== ''}
                                title={`Xóa ${record?.nameWithType} ?`}
                                onConfirm={() => onDelete(record)}>
                                <Button
                                    disabled={editingKey !== ''}
                                    icon={<DeleteOutlined/>}
                                    className="row-all-center">
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </Row>
                    );
                }
            }
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingKey, renderNameAd]);

    const mergedColumns = useMemo(() => {
        return columns.map(col => {
            if (!col?.editable) {
                return col;
            }

            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: isEditing(record)
                })
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns]);


    const getMoreAd = code => {
        apiAdministrative.getAdministrativeByCode({code}, (err, res) => {
            if (res) {
                setState(prev => ({
                    ...prev,
                    data: res,
                    isLoading: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false
                }));
            }
        });
    };

    const onRow = useCallback(
        record => {
            return {
                onDoubleClick: e => {
                    if (currentAd?.division === 3) return;
                    if (
                        e.target.tagName === 'TD' ||
                        e.target.tagName === 'LABEL'
                    ) {
                        setState(prev => ({
                            ...prev,
                            dataBreadCrumb: [...prev.dataBreadCrumb, record],
                            isLoading: true
                        }));
                        getMoreAd(record?.code);
                    }
                }
            };
        },
        [currentAd]
    );

    const handleBeforeGetAd = useCallback(
        (i, code) => {
            if (i === state.dataBreadCrumb.length - 1) return;
            setState(prev => {
                const cpPrev = _.cloneDeep(prev);
                cpPrev.isLoading = true;
                cpPrev.dataBreadCrumb.length = i + 1;
                return cpPrev;
            });
            getMoreAd(code);
        },
        [state.dataBreadCrumb]
    );

    const onEditCurrentAd = useCallback(res => {
        if (!res) {
            setState(prev => {
                const cpPrev = _.cloneDeep(prev);
                cpPrev.visibleModalEdit = false;
                return cpPrev;
            });
            return;
        }
        dispatch(userChange({administrativeCode: res}));
        setState(prev => {
            const cpPrev = _.cloneDeep(prev);
            cpPrev.dataBreadCrumb[0] = res;
            cpPrev.visibleModalEdit = false;
            return cpPrev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onEditLocal = useCallback(res => {
        if (!res) {
            setState(prev => ({
                ...prev,
                visibleModalNewLocation: false
            }));
            return;
        }
        setState(prev => ({
            ...prev,
            visibleModalNewLocation: false
        }));
    }, []);
    const onCreateAd = useCallback(() => {
        const code =
            state.dataBreadCrumb[state.dataBreadCrumb.length - 1]?.code ?? '';
        if (!code) return;
        setState(prev => ({
            ...prev,
            isLoading: true,
            visibleModalNew: false
        }));
        getMoreAd(code);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.dataBreadCrumb]);

    useEffect(() => {
        apiMap.getMap((err, res) => {
            if (res) {
                setLocation(res.data[0]);
            }
        });
    }, [state.visibleModalNewLocation]);
    useEffect(() => {
        getMoreAd(user?.administrativeCode?.code ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="account-administrative">
            <div className="d-flex align-items-center border-bottom pb-1 custom-button-menu">
                <MenuOutlined
                    className="icon-menu"
                    onClick={() => {
                        dispatch(openSidebar());
                    }}
                />
                <span className="font-weight-bold ml-2">Địa phương</span>
            </div>
            <Row className="justify-content-between">
                <Row className="mt-1 align-items-center">
                    <Tooltip title="Thay đổi địa phương gốc">
                        <div
                            className="row-vertical-center hover-pointer"
                            onClick={() =>
                                setState(prev => ({
                                    ...prev,
                                    visibleModalEdit: true
                                }))
                            }>
                            <EditOutlined className="d-flex"/>
                        </div>
                    </Tooltip>
                    <Breadcrumb className="ml-2 font-size-1rem">
                        {state.dataBreadCrumb.map((d, i) => (
                            <Breadcrumb.Item key={i} className="text-bold-5">
                                <a
                                    onClick={() =>
                                        handleBeforeGetAd(i, d?.code)
                                    }>
                                    {`${nameWithType[d?.typeName]} ${d?.name}`}
                                </a>
                            </Breadcrumb.Item>
                        ))}
                    </Breadcrumb>
                </Row>
                <div className="d-flex flex-row">
                    <Row className="mt-1 mr-2">
                        {state.dataBreadCrumb[state.dataBreadCrumb.length - 1]
                            ?.division < 4 && (
                            <Button
                                icon={<PlusCircleOutlined/>}
                                className="row-all-center"
                                onClick={() =>
                                    setState(prev => ({
                                        ...prev,
                                        visibleModalNewLocation: true
                                    }))
                                }>
                                Sửa tọa độ Tỉnh
                            </Button>
                        )}
                    </Row>
                    <Row className="mt-1">
                        {state.dataBreadCrumb[state.dataBreadCrumb.length - 1]
                            ?.division < 4 && (
                            <Button
                                icon={<PlusCircleOutlined/>}
                                className="row-all-center"
                                onClick={() =>
                                    setState(prev => ({
                                        ...prev,
                                        visibleModalNew: true
                                    }))
                                }>
                                Tạo mới {renderNameAd()}
                            </Button>
                        )}
                    </Row>
                </div>
            </Row>
            <Form form={form} component={false}>
                <CustomTable
                    components={{
                        body: {
                            cell: EditableCell
                        }
                    }}
                    isLoading={state.isLoading}
                    rowKey="code"
                    data={state.data}
                    columns={mergedColumns}
                    onRow={onRow}
                    rowClassName="editable-row"
                />
            </Form>
            <ModalEditCurrentAd
                currentAd={state.dataBreadCrumb[0]}
                visible={state.visibleModalEdit}
                onCancel={() =>
                    setState(prev => ({...prev, visibleModalEdit: false}))
                }
                onOk={onEditCurrentAd}
            />
            <ModalCreateLocal
                currentAd={currentAd}
                visible={state.visibleModalNewLocation}
                onCancel={() =>
                    setState(prev => ({
                        ...prev,
                        visibleModalNewLocation: false
                    }))
                }
                onOk={onEditLocal}
                location={location}
            />
            <ModalCreateAd
                currentAd={currentAd}
                visible={state.visibleModalNew}
                onCancel={() =>
                    setState(prev => ({...prev, visibleModalNew: false}))
                }
                onOk={onCreateAd}
            />
        </div>
    );
};

export default Administrative;
