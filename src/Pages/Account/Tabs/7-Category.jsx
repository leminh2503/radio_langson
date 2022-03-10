import React, {useState, useCallback, useMemo, useEffect} from "react";
import {
    Modal, Row, Input, Button, Form, Popconfirm, Breadcrumb
}                                                         from 'antd';
import {useDispatch, useSelector}                         from 'react-redux';
import {
    PlusCircleOutlined, CloseCircleOutlined, EditOutlined, SaveOutlined, DeleteOutlined
}                                                         from '@ant-design/icons';
import apiAdministrative                                  from '../../../Api/Administrative/Administrative';
import CustomTable                                        from '../../../Components/CustomTag/CustomTable';
import {nameWithType}                                     from '../Etc/Etc';
import apiThread                                          from '../../../Api/Thread/Thread';
import _                                                  from 'lodash';
import Notify from "../../../Utils/Notify/Notify";

const ModalCreateAd = ({currentAd, onOk, onCancel, visible}) => {
    const [loading, setLoading] = useState(false);
    const [adString, setAdString] = useState('');

    const onChangeInput = e => {
        const newValue = e.target.value;
        setAdString(newValue);
    };

    const handleBeforeOk = () => {
        const parent = currentAd.length === 1 ? null : currentAd?.id;
        setLoading(true);
        apiThread.createThread({
            parent, name: adString
        }, (err, res) => {
            if (res) {
                onOk(res);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (visible) {
            setAdString('');
        }
    }, [visible]);

    return (<Modal
        title="Tạo mới tin bài"
        visible={visible}
        onOk={handleBeforeOk}
        onCancel={onCancel}
        confirmLoading={loading}
        onText="Xác nhận">
        <Row>
            <Input
                className="w-full"
                value={adString}
                onChange={e => {
                    onChangeInput(e);
                }}
            />
        </Row>
    </Modal>);
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

const Category = () => {
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [state, setState] = useState({
        data: [], isLoading: true, dataBreadCrumb: [], visibleModalNew: false
    });
    const renderNameAd = useCallback(() => {
        return state.data[0]?.parent ? 'Con' : 'Cha';
    }, [state.data]);

    const currentAd = useMemo(() => {
        return state?.dataBreadCrumb[state.dataBreadCrumb.length - 1] ?? '';
    }, [state.dataBreadCrumb]);

    const isEditing = useCallback((record) => {
        return record.id === editingKey;
    }, [editingKey]);

    const save = async id => {
        try {
            const row = await form.validateFields();
            const newData = [...state.data];
            const index = newData.findIndex(item => id === item.id);
            if (index > -1) {
                const item = newData[index];
                if (row?.name === newData[index]?.name) {
                    setEditingKey('');
                    return;
                }
                if (row?.name.trim().length === 0) {
                    return Notify.error(`Tên danh mục không được để trống`);
                }
                apiThread.editThread({
                    id, name: row?.name
                }, (err, res) => {
                    if (res) {
                        newData.splice(index, 1, {
                            ...item, ...row
                        });
                        setState(prev => ({
                            ...prev, data: newData
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

    const cancel = useCallback(() => {
        setEditingKey('');
    }, []);

    const edit = record => {
        form.setFieldsValue({
            name: '', ...record
        });
        setEditingKey(record.id);
    };

    const onDelete = (record) => {
        const code = state.dataBreadCrumb[state.dataBreadCrumb.length - 1]?.id ?? '';
        const id = record?.id ?? '';
        setState(prev => ({
            ...prev, isLoading: true
        }));
        apiThread.deleteThread({id}, (err, res) => {
            if (!err) {
                getMoreAd(code);
            } else {
                setState(prev => ({
                    ...prev, isLoading: false
                }));
            }
        });
    };

    const columns = useMemo(() => {
        return [{
            title: 'STT', align: 'center', width: 100, render: (_, data, index) => {
                return index + 1;
            }
        }, {
            title: `Tin bài ${renderNameAd()}`,
            dataIndex: ['name'],
            editable: true,
            render: (_, data) => [`${data?.name}`]
        }, {
            title: 'Thao tác', align: 'center', width: 400, render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (<Row className="justify-content-center">
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
                        title={`Xóa ${record?.name}`}
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
    }, [editingKey, renderNameAd]);

    const handleBeforeGetAd = useCallback((i, id) => {
        if (i === state.dataBreadCrumb.length - 1) return;
        setState(prev => {
            const cpPrev = _.cloneDeep(prev);
            cpPrev.isLoading = true;
            cpPrev.dataBreadCrumb.length = i + 1;
            return cpPrev;
        });
        getMoreAd(id);
    }, [state.dataBreadCrumb]);

    const mergedColumns = useMemo(() => {
        return columns.map(col => {
            if (!col?.editable) {
                return col;
            }

            return {
                ...col, onCell: (record, item) => ({
                    record, inputType: 'text', dataIndex: col.dataIndex, title: col.title, editing: isEditing(record)
                })
            };
        });
    });

    const onRow = useCallback((record, rowIndex) => {
        return {
            onDoubleClick: e => {
                if (state.dataBreadCrumb.length === 2) return;
                if (e.target.tagName === 'TD' || e.target.tagName === 'LABEL') {
                    setState(prev => ({
                        ...prev, dataBreadCrumb: [...prev.dataBreadCrumb, record], isLoading: true
                    }));
                    getMoreAd(record?.id);
                }
            }
        };
    });

    const getMoreAd = (id=null) => {
        if(id) {
            apiThread.getThread({
                parent: id
            }, (err, res) => {
                if (res) {
                    setState(prev => ({
                        ...prev, data: res, isLoading: false
                    }));
                } else {
                    setState(prev => ({
                        ...prev, idLoading: false
                    }));
                }
            });
        } else {
            apiThread.getThread({
                parent__isnull: true
            }, (err, res) => {
                if (res) {
                    setState(prev => ({
                        ...prev, data: res, isLoading: false
                    }));
                } else {
                    setState(prev => ({
                        ...prev, idLoading: false
                    }));
                }
            });
        }
    };

    useEffect(() => {
        apiThread.getThread({
            parent__isnull: true,
        }, (err, res) => {
            if (res) {
                setState(prev => ({
                    ...prev, dataBreadCrumb: [res]
                }));
            }
        });
        getMoreAd();
    }, []);

    const onCreateAd = useCallback(() => {
        const parent = state.dataBreadCrumb[state.dataBreadCrumb.length - 1]?.id ?? '';
        setState(prev => ({
            ...prev, isLoading: true, visibleModalNew: false
        }));
        getMoreAd(parent);
    }, [state.dataBreadCrumb]);

    return (<div className="account-category ">
        <Row className="d-flex justify-content-between">
            <Row className="mt-1 align-items-center">
                <Breadcrumb className="ml-2 font-size-1rem">
                    {state.dataBreadCrumb.map((d, i) => {
                        return i === 0 ? (<Breadcrumb.Item key={i} className="text-bold-5">
                            <a onClick={() => handleBeforeGetAd(i, d?.id)}>
                                Tin bài Cha
                            </a>
                        </Breadcrumb.Item>) : (<Breadcrumb.Item key={i} className="text-bold-5">
                            <a onClick={() => handleBeforeGetAd(i, d?.id)}>
                                Tin bài Con
                            </a>
                        </Breadcrumb.Item>);
                    })}
                </Breadcrumb>
            </Row>
            <div className="">
                <Row className="mt-1 mr-2">
                    <Button
                        icon={<PlusCircleOutlined/>}
                        className="row-all-center"
                        onClick={() => {
                            setState(prev => ({
                                ...prev, visibleModalNew: true
                            }));
                        }}>
                        {`Tạo Mới Tin Bài ${renderNameAd()}`}
                    </Button>
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
        <ModalCreateAd
            currentAd={currentAd}
            onOk={onCreateAd}
            onCancel={() => {
                setState(prev => ({
                    ...prev, visibleModalNew: false
                }));
            }}
            visible={state.visibleModalNew}
        />
    </div>);
};


export default Category;