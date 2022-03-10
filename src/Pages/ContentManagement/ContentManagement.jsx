import React, {useMemo, useRef, useState}                                              from "react";
import {Breadcrumb, Button, Dropdown, Input, Menu, Result, Row, Select, Spin, Tooltip} from "antd";
import {
    FontAwesomeIcon
}                                                                                      from "@fortawesome/react-fontawesome";
import {
    faCheck
}                                                                                      from "@fortawesome/free-solid-svg-icons";
import {
    AppstoreOutlined,
    BarsOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    FileOutlined,
    FolderFilled,
    FolderOpenOutlined,
    LoadingOutlined,
    NotificationOutlined,
    PlayCircleOutlined,
    PlusCircleOutlined,
    UploadOutlined
}                                                                                      from "@ant-design/icons";
import {
    faFileAudio
}                                                                                      from "@fortawesome/free-regular-svg-icons";
import {useSelector}                                                                   from "react-redux";
import _                                                                               from "lodash";
import moment                                                                          from "moment";

import Alert                     from "../../Utils/Notify/Alert";
import ModalPlay                 from "./Modal/ModalPlay";
import ModalFilesFolder          from "../../Components/CustomTag/Modal/ModalFilesFolder";
import useModalManager           from "../../Components/ModalManger/useModalManager";
import {isEmpty, isMobileDevice} from "../../Utils";
import Notify                    from "../../Utils/Notify/Notify";
import apiFolder                 from "../../Api/Folder/Folder";
import apiFile                   from "../../Api/File/File";
import ModalTTS                  from "../../Components/CustomTag/Modal/ModalTTS";
import CustomTable               from "../../Components/CustomTag/CustomTable";
import {convertDataFiles}        from "../../Utils/Data/tree";


const FolderContent = (props) => {
    const {state, renderMenuActions, getSelectedClassName, handleSelect, onContextMenu, onDoubleClick} = props;

    return (
        <div className="folder-content">
            {
                state.data.map((item, i) => (
                    <Tooltip
                        title={item?.nameWithType?.length > 20 || item?.title?.length > 15 ? (item?.nameWithType ?? item?.title) : ''}
                        key={i}>
                        <Dropdown trigger="contextMenu" overlay={renderMenuActions}>
                            <div
                                className={`folder-parent ${getSelectedClassName(item)}`}
                                onClick={(e) => handleSelect(e, item)}
                                onContextMenu={() => onContextMenu(item)}
                                onDoubleClick={() => onDoubleClick(item)}
                            >
                                <div className="item-checked position-absolute">
                                    <FontAwesomeIcon
                                        className="icon-checked"
                                        icon={faCheck}
                                        size="1x"
                                    />
                                </div>
                                <div className="item-folder">
                                    <div>
                                        {
                                            item?.type === 'folder' || item?.type === 'administrative' ?
                                                <FolderFilled/>
                                                :
                                                <FontAwesomeIcon icon={faFileAudio}/>
                                        }
                                    </div>
                                    <div className="title-file">
                                        <span className="available-title">
                                            {item?.nameWithType ?? item?.title}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Dropdown>
                    </Tooltip>
                ))
            }
        </div>
    );
};

const FolderContentTable = (props) => {
    const {state, handleOpenFolder, handleOpenModalPlay, selectedFile, setSelectedFile} = props;

    const dateFormat = "DD/MM/YYYY HH:mm";

    const columns = [
        {
            title: 'Định dạng',
            width: 80,
            align: 'center',
            render: (_, data) => {
                if (data?.type === 'file') {
                    return (
                        <Tooltip title="File">
                            <div className="row-all-center">
                                <FileOutlined/>
                            </div>
                        </Tooltip>
                    );
                } else {
                    return (
                        <Tooltip title="Thư mục">
                            <div className="row-all-center">
                                <FolderFilled/>
                            </div>
                        </Tooltip>
                    );
                }
            }
        },
        {
            title: 'Tên',
            render: (_, data) => {
                const onClick = () => {
                    if (data?.type === 'file') {
                        setSelectedFile(data);
                        handleOpenModalPlay();
                    } else {
                        handleOpenFolder(data);
                    }
                };
                if (data?.title) {
                    return (
                        <span
                            className="table-folder_name"
                            onClick={onClick}
                        >
                            {data.title}
                        </span>
                    );
                }
                if (data?.nameWithType) {
                    return (
                        <span
                            className="table-folder_name"
                            onClick={onClick}
                        >
                            {data.nameWithType}
                        </span>
                    );
                }
            }
        },
        {
            title: 'Ngày tạo',
            render: (_, data) => {
                return (
                    data?.created ? moment(data?.created).format(dateFormat) : ""
                );
            }
        }
    ];

    const rowSelection = {
        type: 'radio',
        selectedRowKeys: [`${selectedFile?.id}_${selectedFile?.type}`]
    };

    const onRow = (record) => {
        return {
            onClick: (e) => {
                const ele = e.target;
                if (ele && ele.classList.contains("table-folder_name")) return;
                const recordKey = `${record?.id}_${record?.type}`;
                const selectedFileKey = `${selectedFile?.id}_${selectedFile?.type}`;
                if (recordKey === selectedFileKey) {
                    setSelectedFile(null);
                    return;
                }
                setSelectedFile(record);
            }
        };
    };

    const data = state.data.map(d => ({
        ...d,
        key: `${d?.id}_${d?.type}`
    }));

    return (
        <div className="table-folder_content">
            <div className="px-2">
                <CustomTable
                    rowKey="key"
                    data={data}
                    columns={columns}
                    scrollX={900}
                    scrollY="calc(100vh - 215px)"
                    rowSelection={rowSelection}
                    onRow={onRow}
                />
            </div>
        </div>
    );
};

const ContentManagement = React.memo(() => {
    const user = useSelector(state => state.user);

    const refState = useRef({
        searchValue: '',
        prevTreeData: [],
        originTreeData: [],
        isSearching: false
    });

    const timeoutSearch = useRef(null);

    const [selectedItem, setSelectedItem] = useState(null);

    const [visibleModalNewFolder, , handleOpenModalNewFolder, handleCloseModalNewFolder] = useModalManager();

    const [visibleModalNewFile, , handleOpenModalNewFile, handleCloseModalNewFile] = useModalManager();

    const [visibleModalEdit, , handleOpenModalEdit, handleCloseModalEdit] = useModalManager();

    const [visibleModalPlay, , handleOpenModalPlay, handleCloseModalPlay] = useModalManager();

    const [visibleModalTTS, , handleOpenModalTTS, handleCloseModalTTS] = useModalManager();

    const [state, setState] = useState({
        data: [],
        dataBreadcrumb: [{
            code: user?.administrativeCode?.code,
            title: user?.administrativeCode?.nameWithType ?? "",
            type: 'administrative'
        }],
        limitBreadcrumb: 4,
        isLoading: true,
        isDeleting: false,
        typeView: 'tiles',
        isLoadingHandleFile: false
    });

    const setLoading = (key, value) => {
        setState(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const onDelete = () => {
        const tmp = selectedItem?.type === 'file' ? 'file' : 'thư mục';
        const title = selectedItem?.title ?? '';
        Alert.confirm(`Xác nhận xóa ${tmp}: " ${title} " ?`, (check) => {
            if (check) {
                if (selectedItem?.type === 'file') {
                    apiFile.deleteFile({id: selectedItem?.id}, (err) => {
                        if (!err) {
                            setState(prev => {
                                const copyPrev = _.cloneDeep(prev);
                                copyPrev.data = copyPrev.data.filter(d => d?.id !== selectedItem?.id);
                                copyPrev.isLoading = false;
                                return copyPrev;
                            });
                            setSelectedItem(null);
                            Notify.success('Xóa file thành công');
                        } else {
                            setLoading('isDeleting', false);
                        }
                    });
                } else {
                    apiFolder.deleteFolder({id: selectedItem?.id}, (err) => {
                        if (!err) {
                            setState(prev => {
                                const copyPrev = _.cloneDeep(prev);
                                copyPrev.data = copyPrev.data.filter(d => d?.id !== selectedItem?.id);
                                copyPrev.isLoading = false;
                                return copyPrev;
                            });
                            setSelectedItem(null);
                            Notify.success('Xóa folder thành công');
                        } else {
                            setLoading('isDeleting', false);
                        }
                    });
                }
            }
        });
    };

    const handleSelect = (e, item) => {
        if (item?.type !== 'file') {
            const ele = e.target;
            if (ele.tagName === 'SPAN' && ele.classList.contains("available-title")) {
                handleOpenFolder(item);
                return;
            }
            if (ele.tagName === 'svg') {
                if (ele.getAttribute("data-icon") === 'folder') {
                    handleOpenFolder(item);
                    return;
                }
            }
            if (ele.tagName === 'path') {
                if (ele.getAttribute('fill') !== 'currentColor') {
                    handleOpenFolder(item);
                    return;
                }
            }
        }
        setSelectedItem(item);
        if (selectedItem?.type === item?.type) {
            if (selectedItem?.id && item?.id) {
                if (selectedItem?.id === item?.id) {
                    setSelectedItem(null);
                }
            } else if (selectedItem?.code && item?.code) {
                if (selectedItem.code === item.code) {
                    setSelectedItem(null);
                }
            }
        }
    };

    const handleDownloadFile = () => {
        const element = document.createElement("a");
        element.setAttribute('href', process.env.REACT_APP_URL + selectedItem?.url);
        element.setAttribute('download', selectedItem?.title);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const onContextMenu = (item) => {
        setSelectedItem(item);
    };

    const onDoubleClick = (item) => {
        if (item?.type === 'file') {
            setSelectedItem(item);
            handleOpenModalPlay();
        } else {
            setSelectedItem(item);
            handleOpenFolder(item);
        }
    };

    const handleOpenFolder = (item) => {
        setSelectedItem(null);
        const type = item?.type;
        const id = type === 'file' || type === 'folder' ? item.id : item.code;
        setLoading('isLoading', true);
        apiFolder.listAllInFolder({type, id}, (err, res) => {
            if (res) {
                setState(prev => {
                    const copyPrev = _.cloneDeep(prev);
                    copyPrev.data = res;
                    copyPrev.dataBreadcrumb.push(item);
                    copyPrev.isLoading = false;
                    return copyPrev;
                });
            } else {
                setLoading('isLoading', false);
            }
        });
    };

    const handleBackFolder = (nextFolder) => {
        setSelectedItem(null);
        if (state.dataBreadcrumb.length === 1) return;
        const typeNextFolder = nextFolder?.type;
        const idNextFolder = typeNextFolder === 'folder' ? nextFolder.id : nextFolder.code;
        setLoading('isLoading', true);
        apiFolder.listAllInFolder({type: typeNextFolder, id: idNextFolder}, (err, res) => {
            if (res) {
                setState(prev => {
                    const copyPrev = _.cloneDeep(prev);
                    copyPrev.data = res;
                    const array = [];
                    for (const d of copyPrev.dataBreadcrumb) {
                        if (typeNextFolder === 'folder') {
                            if (d?.id === idNextFolder) {
                                array.push(d);
                                break;
                            }
                        } else {
                            if (d?.code === idNextFolder) {
                                array.push(d);
                                break;
                            }
                        }
                        array.push(d);
                    }
                    copyPrev.dataBreadcrumb = array;
                    copyPrev.isLoading = false;
                    return copyPrev;
                });
            } else {
                setLoading('isLoading', false);
            }
        });
    };

    const getData = (action) => {
        const {dataBreadcrumb} = state;
        const last = dataBreadcrumb?.length - 1;
        const type = dataBreadcrumb[last]?.type;
        const id = type === 'file' || type === 'folder' ? dataBreadcrumb[last].id : dataBreadcrumb[last].code;
        apiFolder.listAllInFolder({id, type}, (err, res) => {
            if (res) {
                refState.current.originTreeData = res;
                setState(prev => ({
                    ...prev,
                    data: res,
                    isLoadingHandleFile: false
                }));
                if (action === 'c-folder') {
                    Notify.success('Tạo thư mục thành công');
                } else if (action === 'c-file') {
                    Notify.success('Upload file thành công');
                } else if (action === 'c-edit') {
                    Notify.success('Thay đổi thành công');
                } else if (action === 't2s') {
                    Notify.success('Thay đổi thành công');
                }
            }
        });
    };

    const handleCreateFolder = (dataModal, setLoadingModal) => {
        const {dataBreadcrumb} = state;
        const last = dataBreadcrumb?.length - 1;
        const parent = dataBreadcrumb[last]?.id;
        apiFolder.createFolder({...dataModal, parent}, (err, res) => {
            if (res) {
                getData('c-folder');
                handleCloseModalNewFolder();
            }
            setLoadingModal(false);
        });
    };

    const handleUploadFile = (dataModal, setLoadingModal, thread1, thread2, newFileName) => {
        const {dataBreadcrumb} = state;
        const last = dataBreadcrumb?.length - 1;
        const parent = dataBreadcrumb[last]?.id;
        apiFile.createFile({
            ...dataModal,
            title: dataModal.title ? dataModal.title : newFileName,
            url: dataModal.file,
            parent,
            thread1,
            thread2,
        }, (err, res) => {
            if (res) {
                getData('c-file');
                handleCloseModalNewFile();
            }
            setLoadingModal(false);
        });
    };

    const handleEditFileFolder = (dataModal, setLoadingModal, action) => {
        if (action === 'e-File') {
            apiFile.editFile({
                ...dataModal,
            }, (err, res) => {
                if (res) {
                    getData('c-edit');
                    setSelectedItem(res);
                    handleCloseModalEdit();
                }
                setLoadingModal(false);
            });
        } else {
            apiFolder.editFolder(dataModal,
                (err, res) => {
                if (res) {
                    getData('c-edit');
                    setSelectedItem(res);
                    handleCloseModalEdit();
                }
                setLoadingModal(false);
            });
        }
    };

    const getSelectedClassName = (item) => {
        if (selectedItem?.type === item?.type) {
            if (selectedItem?.id && item?.id) {
                if (selectedItem.id === item.id) {
                    return 'selected-file';
                }
            } else if (selectedItem?.code && item?.code) {
                if (selectedItem.code === item.code) {
                    return 'selected-file';
                }
            }
        }
        return "";
    };

    const handleUploadFileTTS = (dataModal, setLoadingModal) => {
        if (!dataModal || isEmpty(dataModal)) {
            setLoadingModal(false);
            Notify.error('Có lỗi xảy ra, không có dữ liệu để xử lý');
            return;
        }
        apiFile.textToSpeech(dataModal, (err) => {
            if (!err) {
                getData('t2s');
                handleCloseModalTTS();
            }
            setLoadingModal(false);
        });
    };

    const onSearch = (value) => {
        if (value === refState.current.searchValue) return;
        refState.current.searchValue = value;
        if (!value) {
            setState(prev => ({
                ...prev,
                data: refState.current.originTreeData
            }));
            return;
        }
        refState.current.prevTreeData = state.data;
        setState(prev => ({
            ...prev,
            isLoading: true
        }));
        if (!refState.current.isSearching) refState.current.isSearching = true;
        if (value === "") refState.current.isSearching = false;
        apiFile.searchFile({
            search: value
        }, (err, res) => {
            if (res) {
                setState(p => ({
                    ...p,
                    isLoading: false,
                    data: convertDataFiles(res)
                }));
            } else {
                setState(p => ({
                    ...p,
                    isLoading: false,
                    data: []
                }));
            }
        });
    };

    const onChangeSearch = (e) => {
        const value = e.target.value;
        if (timeoutSearch.current) {
            clearTimeout(timeoutSearch.current);
        }
        timeoutSearch.current = setTimeout(() => {
            onSearch(value);
        }, 700);
    };

    const onDragOver = (e) => e.preventDefault();

    const onDropFile = (e) => {
        e.preventDefault();
        if (state.isLoading || lastChildFolder?.type === 'administrative') {
            return Notify.error('Không thể tải file lên ở thư mục địa phương');
        }
        const files = e.dataTransfer.files ?? [];
        if (files?.length > 0 && files?.length > 1) {
            return Notify.error('Vui lòng upload lần lượt từng File');
        }
        const audio = document.createElement('audio');
        const reader = new FileReader();
        reader.onload = (e) => {
            audio.src = e.target.result;
            audio.addEventListener('loadedmetadata', () => {
                if (audio.duration) {
                    setState(prev => ({...prev, isLoadingHandleFile: true}));
                    apiFile.createFile({
                        url: files[0],
                        title: files[0]?.name ?? "",
                        duration: audio.duration,
                        tags: "",
                        parent: state.dataBreadcrumb[state.dataBreadcrumb.length - 1].id ?? ""
                    }, (err, res) => {
                        if (res) {
                            getData('c-file');
                        } else {
                            setState(prev => ({...prev, isLoadingHandleFile: false}));
                        }
                    });
                }
            }, false);
        };
        reader.readAsDataURL(files[0]);
    };

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 520 && state.limitBreadcrumb === 4) {
                setState(prev => ({...prev, limitBreadcrumb: 2}));
            } else if (window.innerWidth >= 520 && state.limitBreadcrumb === 2) {
                setState(prev => ({...prev, limitBreadcrumb: 4}));
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window, state.limitBreadcrumb]);

    React.useEffect(() => {
        apiFolder.listAllInFolder({
            type: 'administrative',
            id: user?.administrativeCode?.code
        }, (err, res) => {
            if (res) {
                refState.current.originTreeData = res;
                setState(prev => ({
                    ...prev,
                    data: res,
                    isLoading: false,
                    isMobileDevice: isMobileDevice()
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isMobileDevice: isMobileDevice()
                }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render
    const RenderBreadcrumb = () => {
        return (
            <Breadcrumb style={{fontSize: '16px'}} className="px-2">
                {
                    state.dataBreadcrumb.length > state.limitBreadcrumb &&
                    <>
                        <Breadcrumb.Item>
                            <Dropdown
                                trigger="click"
                                overlay={renderMenuDropdownBreadcrumb}
                            >
                                <a>• • •</a>
                            </Dropdown>
                        </Breadcrumb.Item>
                        {
                            state.dataBreadcrumb.map((d, i) => (
                                i > state.dataBreadcrumb.length - state.limitBreadcrumb - 1 &&
                                <Breadcrumb.Item
                                    key={i}
                                    onClick={() => i < state.dataBreadcrumb.length - 1 && handleBackFolder(d)}
                                    className="text-bold-5"
                                >
                                    <a>{d?.nameWithType ?? d.title}</a>
                                </Breadcrumb.Item>
                            ))
                        }
                    </>
                }
                {
                    state.dataBreadcrumb.length <= state.limitBreadcrumb &&
                    state.dataBreadcrumb.map((d, i) => (
                        <Breadcrumb.Item
                            key={i}
                            onClick={() => i < state.dataBreadcrumb.length - 1 && handleBackFolder(d)}
                            className="text-bold-5"
                        >
                            <a>{d?.nameWithType ?? d.title}</a>
                        </Breadcrumb.Item>
                    ))
                }
            </Breadcrumb>
        );
    };

    const renderMenuDropdownBreadcrumb = (
        <Menu>
            {
                state.dataBreadcrumb.map((item, i) => (
                    i < state.dataBreadcrumb.length - state.limitBreadcrumb &&
                    <Menu.Item
                        key={i}
                        onClick={() => handleBackFolder(item)}
                        icon={<FolderFilled/>}
                    >
                        {item?.nameWithType ?? item?.title}
                    </Menu.Item>
                ))
            }
        </Menu>
    );

    const lastChildFolder = useMemo(() => {
        return state.dataBreadcrumb[state.dataBreadcrumb.length - 1] ?? "";
    }, [state.dataBreadcrumb]);

    const listButton = [
        {
            label: "Tạo Folder",
            icon: <PlusCircleOutlined/>,
            visible: selectedItem === null,
            disabled: state.isLoading || lastChildFolder?.type === 'administrative' || lastChildFolder?.administrativeCode !== user?.administrativeCode?.code,
            tooltip: state.isLoading || lastChildFolder?.type === 'administrative' ? 'Không thể tạo thêm thư mục ở folder địa phương' : '',
            onClick: () => {
                handleOpenModalNewFolder();
            }
        },
        {
            label: "Upload File",
            icon: <UploadOutlined/>,
            visible: selectedItem === null,
            disabled: state.isLoading || lastChildFolder?.type === 'administrative' || lastChildFolder?.administrativeCode !== user?.administrativeCode?.code,
            tooltip: state.isLoading || lastChildFolder?.type === 'administrative' ? 'Không thể upload file ở thư mục địa phương' : '',
            onClick: () => {
                handleOpenModalNewFile();
            }
        },
        {
            label: 'Nghe',
            icon: <PlayCircleOutlined/>,
            visible: selectedItem?.type === 'file',
            disabled: state.isLoading,
            onClick: () => {
                handleOpenModalPlay();
            }
        },
        {
            label: 'Tải xuống',
            icon: <DownloadOutlined/>,
            visible: selectedItem?.type === 'file',
            disabled: state.isLoading,
            onClick: handleDownloadFile
        },
        {
            label: 'Tạo Audio từ Text',
            icon: <NotificationOutlined/>,
            visible: selectedItem === null,
            disabled: state.isLoading || lastChildFolder?.type === 'administrative' || lastChildFolder?.administrativeCode !== user?.administrativeCode?.code,
            tooltip: state.isLoading || lastChildFolder?.type === 'administrative' ? 'Không thể tạo thao tác ở thư mục địa phương' : '',
            onClick: () => {
                handleOpenModalTTS();
            }
        },
        {
            label: "Mở Folder",
            icon: <FolderOpenOutlined/>,
            visible: isMobileDevice() && selectedItem !== null && selectedItem?.type === 'folder',
            disabled: state.isLoading,
            onClick: () => {
                handleOpenFolder(selectedItem);
            }
        },
        {
            label: "Sửa",
            icon: <EditOutlined/>,
            type: 'primary',
            visible: selectedItem !== null,
            disabled: state.isLoading || selectedItem?.type === 'administrative' || selectedItem?.parent === null || lastChildFolder?.administrativeCode !== user?.administrativeCode?.code,
            tooltip: selectedItem?.type === 'administrative' || selectedItem?.parent === null ? 'Không thể thao tác thư mục địa phương' : '',
            onClick: () => {
                handleOpenModalEdit();
            }
        },
        {
            label: "Xóa",
            icon: <DeleteOutlined/>,
            type: 'danger',
            visible: selectedItem !== null,
            disabled: state.isLoading || selectedItem?.type === 'administrative' || selectedItem?.parent === null || lastChildFolder?.administrativeCode !== user?.administrativeCode?.code,
            tooltip: selectedItem?.type === 'administrative' || selectedItem?.parent === null ? 'Không thể thao tác thư mục địa phương' : '',
            isLoading: state.isDeleting,
            onClick: () => {
                onDelete();
            }
        }
    ];

    const renderMenuActions = () => {
        const listItem = [
            {
                label: 'Nghe file',
                icon: <PlayCircleOutlined/>,
                disabled: selectedItem?.type === 'folder',
                onClick: () => {
                    handleOpenModalPlay();
                }
            },
            {
                label: 'Mở Folder',
                icon: <FolderOpenOutlined/>,
                disabled: selectedItem?.type !== 'folder',
                onClick: () => {
                    setTimeout(() => {
                        handleOpenFolder(selectedItem);
                    }, 250);
                }
            },
            {
                label: 'Sửa',
                icon: <EditOutlined/>,
                disabled: lastChildFolder?.administrativeCode !== user?.administrativeCode?.code,
                tooltip: selectedItem?.type === 'administrative' || selectedItem?.parent === null ? 'Không thể thao tác thư mục địa phương' : '',
                onClick: () => {
                    handleOpenModalEdit();
                }
            },
            {
                label: 'Tải xuống',
                icon: <DownloadOutlined/>,
                disabled: selectedItem?.type === 'folder',
                onClick: handleDownloadFile
            },
            {
                label: "Xóa",
                icon: <DeleteOutlined/>,
                type: 'danger',
                disabled: lastChildFolder?.administrativeCode !== user?.administrativeCode?.code,
                tooltip: selectedItem?.type === 'administrative' || selectedItem?.parent === null ? 'Không thể thao tác thư mục địa phương' : '',
                onClick: () => {
                    onDelete();
                }
            }
        ];

        return (
            <Menu className="context-menu-size">
                {
                    listItem.map(({label, icon, disabled, onClick, tooltip}, i) => (
                        !disabled &&
                        <React.Fragment key={i}>
                            <Menu.Item
                                className={`row-vertical-center ${i !== listItem.length - 1 ? 'border-bottom' : ''}`}
                                icon={icon}
                                onClick={onClick}
                                disabled={!!tooltip}
                            >
                                <Tooltip title={tooltip}>
                                    <span className="p-1">
                                        {label}
                                    </span>
                                </Tooltip>
                            </Menu.Item>
                        </React.Fragment>
                    ))
                }
            </Menu>
        );
    };

    return (
        <div className="content-management_size-content">
            <Row className="justify-content-between options-bar">
                <Row className="pb-1 pt-2 px-2 option-left">
                    <Row className="list_button">
                        {
                            listButton.map((item, i) => (
                                item?.visible &&
                                <Tooltip title={item?.tooltip} key={i}>
                                    <Button
                                        loading={item?.isLoading}
                                        disabled={item?.disabled}
                                        className="row-vertical-center mr-2"
                                        icon={item?.icon}
                                        type={item?.type}
                                        onClick={item?.onClick}
                                    >
                                        {item?.label}
                                    </Button>
                                </Tooltip>
                            ))
                        }
                    </Row>
                    <div className="search_box">
                        <Input.Search
                            onChange={onChangeSearch}
                            loading={state.isLoading}
                            onSearch={onSearch}
                            placeholder="Tìm kiếm File (tag, tên file)..."
                        />
                    </div>
                </Row>
                <Row className="py-2 px-2 pt-1 view_type">
                    <Select
                        defaultValue={'tiles'}
                        style={{minWidth: '125px'}}
                        dropdownMatchSelectWidth={false}
                        onChange={(value) => setState(prev => ({...prev, typeView: value}))}

                    >
                        <Select.Option value="danh-sach">
                            <div className="row-vertical-center">
                                <BarsOutlined/>
                                <span className="ml-1">Danh sách</span>
                            </div>
                        </Select.Option>
                        <Select.Option value="tiles">
                            <div className="row-vertical-center">
                                <AppstoreOutlined/>
                                <span className="ml-1">Lưới</span>
                            </div>
                        </Select.Option>
                    </Select>
                </Row>
            </Row>
            <Spin spinning={state.isLoadingHandleFile} tip="Đợi trong giây lát..." size="large">
                <div
                    className="breadcrumb-and-file"
                    onDragOver={onDragOver}
                    onDrop={onDropFile}
                >
                    <div className="p-2">
                        {
                            !refState.current.searchValue &&
                            <RenderBreadcrumb/>
                        }
                    </div>
                    {
                        state.isLoading &&
                        <Result
                            icon={<LoadingOutlined size="small"/>}
                            title="Đang tải"
                            subTitle="Xin vui lòng đợi trong giây lát.."
                        />
                    }
                    {
                        (state.data?.length === 0 && !state.isLoading) &&
                        <Result
                            status="404"
                            title={refState.current.isSearching ? "Không tìm thấy file" : "Thư mục trống"}
                            subTitle={refState.current.isSearching ? "Hãy tải lên file mới hoặc tạo Audio từ text" : "Tạo mới thư mục hoặc tải lên file mới"}
                        />
                    }
                    {
                        !state.isLoading && state.typeView === 'tiles' && state.data?.length > 0 &&
                        <FolderContent
                            state={state}
                            renderMenuActions={renderMenuActions}
                            getSelectedClassName={getSelectedClassName}
                            handleSelect={handleSelect}
                            onContextMenu={onContextMenu}
                            onDoubleClick={onDoubleClick}
                        />
                    }
                    {
                        !state.isLoading && state.typeView === 'danh-sach' && state.data?.length > 0 &&
                        <FolderContentTable
                            state={state}
                            handleOpenFolder={handleOpenFolder}
                            handleOpenModalPlay={handleOpenModalPlay}
                            selectedFile={selectedItem}
                            setSelectedFile={setSelectedItem}
                        />
                    }
                </div>
            </Spin>
            <ModalPlay
                visible={visibleModalPlay}
                handleClose={handleCloseModalPlay}
                selectedItem={selectedItem}
            />
            <ModalFilesFolder
                visible={visibleModalNewFolder}
                handleClose={handleCloseModalNewFolder}
                typeModal="new"
                typeItem="folder"
                onOk={handleCreateFolder}
            />
            <ModalFilesFolder
                visible={visibleModalNewFile}
                handleClose={handleCloseModalNewFile}
                typeModal="new"
                typeItem="file"
                onOk={handleUploadFile}
            />
            <ModalFilesFolder
                visible={visibleModalEdit}
                handleClose={handleCloseModalEdit}
                typeModal="edit"
                typeItem={selectedItem?.type}
                onOk={handleEditFileFolder}
                folderInfo={selectedItem}
            />
            <ModalTTS
                visible={visibleModalTTS}
                onOk={handleUploadFileTTS}
                onCancel={handleCloseModalTTS}
                currentFolder={state.dataBreadcrumb[state.dataBreadcrumb.length - 1]}
            />
        </div>
    );
});

export default ContentManagement;
