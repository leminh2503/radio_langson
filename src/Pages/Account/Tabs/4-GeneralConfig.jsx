import React, {useCallback, useEffect, useMemo, useRef, useState}  from 'react';
import {Divider, Input, Button, Form, Row, Popconfirm, Modal, Col} from "antd";
import {FormGroup, Label}                                          from "reactstrap";
import {useDispatch, useSelector}                                 from "react-redux";
import {
    AuditOutlined,
    MenuOutlined,
    FormOutlined,
    PlusCircleOutlined,
    SaveOutlined,
    CloseCircleOutlined, EditOutlined, DeleteOutlined
}                                                                  from "@ant-design/icons";

import {openSidebar} from "../../../Redux/Actions/appActions";
import Notify        from "../../../Utils/Notify/Notify";
import apiConfig     from "../../../Api/Config/Config";
import apiChannel    from "../../../Api/Channel/Channel";
import apiCalendar   from "../../../Api/Calendar/Calendar";
import CustomTable   from "../../../Components/CustomTag/CustomTable";
import apiThread     from "../../../Api/Thread/Thread";
import apiMap        from "../../../Api/Map/Map";
import { isBuffer } from 'lodash';


// const CustomSelect = React.memo(({listChannel, value, onChange}) => {
//     return (
//         <Select
//             value={value}
//             dropdownMatchSelectWidth={false}
//             style={{minWidth: '130px'}}
//             onChange={onChange}
//         >
//             {
//                 listChannel.map(({title, id}, i) => (
//                     <Select.Option value={id} key={i}>
//                         {title}
//                     </Select.Option>
//                 ))
//             }
//         </Select>
//     );
// });


const CustomInput = React.memo(({value, onChange}) => {
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{maxWidth: '130px'}}
        />
    );
});
const ModalCreateAd = ({onOk, onCancel, visible}) => {
    const _coordinatesFields = useRef([
        {key: 'name', title: 'Tên Kênh'},
        {key: 'url', title: 'Link tiếp sóng'}
    ]).current;

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')

    const onChangeName = e => {
        setName(e.target.value)
    }

    const onChangeUrl = e => {
        setUrl(e.target.value)
    }

    const handleBeforeOk = () => {
        if(name.trim().length === 0){
            return Notify.error(`Tên Kênh không được để trống`)
        }
        if(url.trim().length === 0){
           return Notify.error(`Link tiếp sóng không được để trống`)
        }
        setLoading(true);
        apiChannel.createChannel(
            {
                title: name,
                url: url
            },
            (err, res) => {
                if (res) {
                    onOk(res);
                }
                setLoading(false);
                Notify.success(`Tạo kênh tiếp sóng thành công`)
            }
        );
    };
    useEffect(() => {
        if(visible) {
            setName('')
            setUrl(' ')
        }
    },[])
    return (
        <Modal
            title={`Tạo kênh tiếp sóng`}
            visible={visible}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Xác nhận"
            onOk={handleBeforeOk}>
            <Row>
                <Col md={{span: 5}}>
                    <Form>
                        <Form.Item
                            name="name"
                            label="Tên Kênh"></Form.Item>
                    </Form>
                </Col>
                <Col md={{span: 18, offset: 1}} className="my-1">
                    <Input
                        value={name}
                        onChange={e => onChangeName(e)}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={{span: 5}}>
                    <Form>
                        <Form.Item name="url" label="Link tiếp sóng"></Form.Item>
                    </Form>
                </Col>
                <Col md={{span: 18, offset: 1}} className="my-1">
                    <Input
                        value={url}
                        onChange={e => onChangeUrl(e)}
                    />
                </Col>
            </Row>
        </Modal>
    );
};

const EditableCell = ({
                          editing, dataIndex, title, inputType, record, index, children, ...restProps
                      }) => {
    return (<td {...restProps}>
        {editing ? (<Form.Item
            name={dataIndex}
            style={{margin: 0}}
            rules={[{
                required: true, message: `Không được để trống trường ${title}!`
            }]}
        >
            <Input/>
        </Form.Item>) : (children)}
    </td>);
};

const GeneralConfig = React.memo(() => {
    const dispatch = useDispatch();

    const user = useSelector(state => state.user);

    const adCode = user?.administrativeCode?.code ?? "";

    const [state, setState] = useState({
        villageSourceStream: null,
        districtSourceStream: null,
        provinceSourceStream: null,
        listChannel: [],
        maxNumberOfFile: null,
        maxNumberOfFolder: null,
        defaultCalendar: null,
        isGettingDefaultCalendar: true,
        isLoadingCreateDefaultCalendar: false
    });

    const [value, setValue] = useState({
        data: [],
        isLoading: false,
        visibleModalNew: false
    });
    const [editingKey, setEditingKey] = useState('');

    const [form] = Form.useForm();

    const isEditing = useCallback(
        record => {
            return record.id === editingKey;
        },
        [editingKey]
    );

    const edit = record => {
        form.setFieldsValue({
            title: '',
            url: '',
            ...record
        });
        setEditingKey(record.id);
    };
    const cancel = useCallback(() => {
        setEditingKey('');
    }, []);

    const save = async id => {
        try {
            const row = await form.validateFields();
            const newData = [...value.data];
            const index = newData.findIndex(item => id === item.id);
            if (index > -1) {
                const item = newData[index];
                if (row?.title === newData[index]?.title) {
                    setEditingKey('');
                    return;
                }
                apiChannel.updateChannel({
                    id,
                    title: row?.title,
                    url: row?.url
                }, (err, res) => {
                    if (res) {
                        newData.splice(index, 1, {
                            ...item,
                            ...row
                        });
                        setValue(prev => ({
                            ...prev,
                            data: newData
                        }));
                    }
                    setEditingKey('');
                });
            } else {
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed: ', errInfo);
        }
    };
    const onDelete = (record) => {
        const id = record?.id ?? '';
        apiChannel.deleteChannel({id}, (err, res) => {
            if (!err) {
                getMoreAd();
            } else {
                setValue(prev => ({
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
                width: 100,
                render: (_, data, index) => {
                    return index + 1;
                }
            },
            {
                title: `Tên Kênh`,
                dataIndex: ['title'],
                editable: true,
                render: (_, data) => [`${data?.title}`]
            },
            {
                title: `Url`,
                dataIndex: ['url'],
                editable: true,
                render: (_, data) => [`${data?.url}`]
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
                            onClick={() => save(record?.id)}
                            icon={<SaveOutlined/>}
                            className="mr-2 row-all-center"
                        >
                            Lưu
                        </Button>
                        <Popconfirm
                            title="Xác nhận hủy thay đổi ?"
                            onConfirm={cancel}
                        >
                            <Button
                                icon={<CloseCircleOutlined/>}
                                className="row-all-center"
                            >
                                Hủy
                            </Button>
                        </Popconfirm>
                    </Row>) : (<Row className="justify-content-center">
                        <Button
                            disabled={editingKey !== ''}
                            onClick={() => {
                                edit(record);
                            }}
                            icon={<EditOutlined/>}
                            className="mr-2 row-all-center"
                        >
                            Sửa
                        </Button>
                        <Popconfirm
                            disabled={editingKey !== ''}
                            title={`Xóa ${record?.title}`}
                            onConfirm={() => onDelete(record)}
                        >
                            <Button
                                disabled={editingKey !== ''}
                                icon={<DeleteOutlined/>}
                                className="row-all-center"
                            >
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Row>);
                }
            }];
    }, [editingKey]);
    const mergedColumns = useMemo(() => {
        return columns.map(col => {
            if (!col?.editable) {
                return col;
            }

            return {
                ...col, onCell: (record, item) => ({
                    record,
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: isEditing(record)
                })
            };
        });
    });
    const getMoreAd = () => {
        apiChannel.getListChannel( (err, res) => {
            if (res) {
                setValue(prev => ({
                    ...prev,
                    data: res,
                    isLoading: false
                }));
            } else {
                setValue(prev => ({
                    ...prev,
                    idLoading: false
                }));
            }
        });
    };
    useEffect(() => {
        apiChannel.getListChannel((err, res) => {
            if (res) {
                setValue(prev => ({
                    ...prev,
                    data: res
                }));
            }
        });
    }, []);
    const onCreateAd = useCallback(() => {
        setValue(prev => ({
            ...prev,
            isLoading: true,
            visibleModalNew: false
        }));
        getMoreAd()
    });
    // const _listSelect = useRef([
    //     {label: 'Đài Tỉnh/Thành phố', key: 'provinceSourceStream'},
    //     {
    //         label: 'Đài Quận/Huyện',
    //         key: 'districtSourceStream',
    //         moreOptions: [{title: 'Đài Tỉnh', id: 'dv1', isDivision: true}]
    //     },
    //     {
    //         label: 'Đài Phường/Xã',
    //         key: 'villageSourceStream',
    //         moreOptions: [
    //             {title: 'Đài Tỉnh', id: 'dv1', isDivision: true},
    //             {title: 'Đài Huyện', id: 'dv2', isDivision: true}
    //         ]
    //     }
    // ]).current;

    const _listInput = useRef([
        {label: 'Số lượng file tải lên/tháng', key: 'maxNumberOfFile'},
        {label: 'Số lượng folder được tạo/tháng', key: 'maxNumberOfFolder'}
    ]).current;

    const mountedInput = useRef(false);

    const counter = useRef({
        maxNumberOfFile: null,
        maxNumberOfFolder: null
    });

    const currentValueInput = useRef({
        maxNumberOfFile: null,
        maxNumberOfFolder: null
    });

    const getConfig = useCallback((resChannel) => {
        apiConfig.getConfig({}, (err, res) => {
            if (res) {
                currentValueInput.current = {
                    maxNumberOfFile: res.maxNumberOfFile,
                    maxNumberOfFolder: res.maxNumberOfFolder
                };
                if (resChannel) {
                    setState({
                        ...res,
                        listChannel: resChannel
                    });
                } else {
                    setState(prev => ({
                        ...prev,
                        res
                    }));
                }
                getDefaultCalendar();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getDefaultCalendar = () => {
        apiCalendar.listCalendar({
            default_calendar: true,
            administrative_code: adCode
        }, (err, res) => {
            if (res && res?.length > 0) {
                setState(prev => ({
                    ...prev,
                    defaultCalendar: res[0],
                    isGettingDefaultCalendar: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isGettingDefaultCalendar: false
                }));
            }
        });
    };

    // const getValue = (key) => {
    //     const data = state[key];
    //     if (data?.sourceType === 3) {
    //         return state.listChannel.find(c => c.id === data?.channel?.id)?.id;
    //     } else if (data?.sourceType === 4) {
    //         return 'dv' + data?.division;
    //     }
    // };

    // const handleEdit = (key, channel, sourceType, division) => {
    //     apiConfig.editConfig({
    //         id: state?.id,
    //         [key]: {channel, sourceType, division}
    //     }, (err, res) => {
    //         if (res) {
    //             setState(prev => ({
    //                 ...prev,
    //                 ...res
    //             }));
    //             Notify.success('Thao tác thành công', {autoClose: 1200});
    //         } else {
    //             Notify.error('Thao tác thất bại', {autoClose: 1200});
    //         }
    //     });
    // };

    // const handleSelect = (key, value) => {
    //     if (String(value).includes('dv')) {
    //         handleEdit(key, undefined, 4, value.split('dv')[1]);
    //     } else {
    //         handleEdit(key, value, 3, null);
    //     }
    // };

    const handleChangeInput = (key, value) => {
        if (!mountedInput.current) mountedInput.current = true;
        if (counter.current[key]) {
            clearTimeout(counter.current[key]);
        }
        const reg = /^-?\d*(\.\d*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            setState(prev => ({
                ...prev,
                [key]: value
            }));
            if (String(currentValueInput.current[key]) === String(value)) return;
            counter.current[key] = setTimeout(() => {
                apiConfig.editConfig({
                    id: state?.id,
                    [key]: value === "" ? 0 : value
                }, (err, res) => {
                    if (res && mountedInput.current) {
                        if (value === "") {
                            setState(prev => ({
                                ...prev,
                                [key]: 0
                            }));
                        }
                        currentValueInput.current = {
                            ...currentValueInput.current,
                            [key]: value === "" ? 0 : value
                        };
                        Notify.success(`Cập nhật ${_listInput.find(d => d.key === key)?.label} thành công`, {autoClose: 1500});
                    } else {
                        setState(prev => ({
                            ...prev,
                            [key]: currentValueInput.current[key]
                        }));
                    }
                });
            }, 2000);
        }
    };

    // const gotoDefaultCalendar = () => {
    //     if (!state?.defaultCalendar?.id) {
    //         Modal.confirm({
    //             title: 'Nhắc nhở',
    //             content: 'Chưa có lịch mặc định, tạo lịch mặc định ngay ?',
    //             okText: 'Xác nhận',
    //             cancelText: 'Hủy bỏ',
    //             onOk: () => {
    //                 const data = {
    //                     date_schedule: moment().format("YYYY-MM-DD"),
    //                     default_calendar: true,
    //                     adTree: {
    //                         title: "Lịch mặc định",
    //                         province: null,
    //                         districts: [],
    //                         wards: [],
    //                         selected: [adCode]
    //                     }
    //                 };
    //                 setState(prev => ({
    //                     ...prev,
    //                     isLoadingCreateDefaultCalendar: true
    //                 }));
    //                 apiCalendar.createCalendar(data, (err, res) => {
    //                     if (res) {
    //                         history.push("/radio-program", {
    //                             selectedCalendar: res,
    //                             isDefaultCalendar: true
    //                         });
    //                     }
    //                 });
    //             }
    //         });
    //         return;
    //     }
    //     if (!state.defaultCalendar?.id) {
    //         return Notify.error('Lịch không tồn tại');
    //     }
    //     history.push("/radio-program", {
    //         selectedCalendar: state.defaultCalendar,
    //         isDefaultCalendar: true
    //     });
    // };

    React.useEffect(() => {
        apiChannel.getListChannel((err, resChannel) => {
            if (resChannel) {
                getConfig(resChannel);
            }
        });
        return () => {
            mountedInput.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="general-config">
            <div className="row-vertical-center border-bottom py-1 custom-button-menu">
                <MenuOutlined
                    className="icon-menu"
                    onClick={() => {
                        dispatch(openSidebar());
                    }}
                />
                <span className="ml-2 font-weight-bold">
                    Cấu hình
                </span>
            </div>
            <Divider className="font-weight-bold font-size-1rem mb-3" orientation="left">
                <div className="row-vertical-center">
                    <AuditOutlined/>
                    <span className="ml-1">Số lượng File/Folder</span>
                </div>
            </Divider>
            <div className="grid-input">
                {
                    _listInput.map(({label, key}, i) => (
                        <FormGroup key={i} className="grid-input-items">
                            <Label for={key} className="mr-2">
                                {label}
                            </Label>
                            <CustomInput
                                value={state[key]}
                                onChange={(value) => handleChangeInput(key, value)}
                            />
                        </FormGroup>
                    ))
                }
            </div>
            {/*<Divider className="font-weight-bold font-size-1rem mb-3" orientation="left">*/}
            {/*    <div className="row-vertical-center">*/}
            {/*        <ControlOutlined/>*/}
            {/*        <span className="ml-1">Cấu hình Đài phát khi không có lịch</span>*/}
            {/*    </div>*/}
            {/*</Divider>*/}
            {/*<div className="grid-select">*/}
            {/*    {*/}
            {/*        _listSelect.map(({label, key, moreOptions}, i) => (*/}
            {/*            <FormGroup key={i} className="grid-select-items">*/}
            {/*                <Label for={key} className="mr-2">*/}
            {/*                    {label}*/}
            {/*                </Label>*/}
            {/*                <CustomSelect*/}
            {/*                    value={getValue(key)}*/}
            {/*                    listChannel={moreOptions ? state.listChannel.concat(moreOptions) : state.listChannel}*/}
            {/*                    onChange={(value) => handleSelect(key, value)}*/}
            {/*                />*/}
            {/*            </FormGroup>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <Button*/}
            {/*        icon={<LoginOutlined/>}*/}
            {/*        type="primary"*/}
            {/*        className="row-vertical-center"*/}
            {/*        loading={state.isLoadingCreateDefaultCalendar || state.isGettingDefaultCalendar}*/}
            {/*        onClick={gotoDefaultCalendar}*/}
            {/*        disabled={state.isGettingDefaultCalendar}*/}
            {/*    >*/}
            {/*        Chuyển tới lịch mặc định*/}
            {/*    </Button>*/}
            {/*</div>*/}
            <div className="d-flex justify-content-between align-items-center">
                <Divider className="font-weight-bold font-size-1rem mb-3 mw-75" type="vertical" orientation="left">
                    <div className="row-vertical-center">
                        <FormOutlined/>
                        <span className="ml-1">Quản lý kênh tiếp sóng </span>
                    </div>
                </Divider>
                <Button
                    icon={<PlusCircleOutlined/>}
                    className="row-all-center"
                    onClick={() =>
                        setValue(prev => ({
                            ...prev,
                            visibleModalNew: true
                        }))
                    }>
                    Thêm kênh tiếp sóng
                </Button>
            </div>
            <Form form={form} component={false}>
                <CustomTable
                    components={{
                        body: {
                            cell: EditableCell
                        }
                    }}
                    isLoading={value.isLoading}
                    rowKey="code"
                    data={value.data}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                />
            </Form>
            <ModalCreateAd
                visible={value.visibleModalNew}
                onCancel={() =>
                    setValue(prev => ({...prev, visibleModalNew: false}))
                }
                onOk={onCreateAd}
            />

        </div>
    );
});

export default GeneralConfig;