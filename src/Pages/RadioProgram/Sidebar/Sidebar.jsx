import React, {useEffect, useRef, useState} from 'react';
import {useSelector}                        from "react-redux";
import {Button, Empty, Input, Menu, Tree}   from "antd";
import _                                    from "lodash";
import {
    CloudUploadOutlined,
    FileOutlined,
    FolderFilled,
    PlusCircleOutlined,
    UnorderedListOutlined
}                                           from "@ant-design/icons";

import {addFileToParentFolder, convertDataFiles, findData}                          from "../../../Utils/Data/tree";
import Notify                                                                       from "../../../Utils/Notify/Notify";
import ModalFilesFolder
                                                                                    from "../../../Components/CustomTag/Modal/ModalFilesFolder";
import useModalManager
                                                                                    from "../../../Components/ModalManger/useModalManager";
import apiFolder                                                                    from "../../../Api/Folder/Folder";
import apiFile                                                                      from "../../../Api/File/File";
import ModalFile                                                                    from "../Modal/ModalFile";
import apiProgram                                                                   from "../../../Api/Program/Program";
import {convertOwnerIdProgram as convertOwnerId, convertTimeProgram as convertTime} from "../Etc/Etc";
import {isMobileDevice}                                                             from "../../../Utils";

const Sidebar = React.memo((props) => {
    const {scheduleObj, stateRef, historyState, disabledSchedule, isDefaultCalendar} = props;

    const user = useSelector(state => state.user);

    const administrative = user?.administrativeCode ?? "";

    const antTreeEle = document.querySelectorAll(".ant-tree.ant-tree-show-line");

    const refState = useRef({
        prevTreeData: [],
        searchValue: '',
        expandedKeys: [],
        originTreeData: []
    });

    const timeoutSearch = useRef(null);

    const [treeData, setTreeData] = useState({
        data: [],
        isLoading: true,
        selectedKeys: [],
        selectedItem: null,
        visibleContextMenu: false,
        rightClickNodeTreeItem: {
            pageX: "",
            pageY: ""
        }
    });

    const [visibleModalUpload, , openModalUpload, closeModalUpload] = useModalManager();

    const [visibleModalNewProgram, , openModalNewProgram, closeModalNewProgram] = useModalManager();

    // Tree function
    const onLoadData = (node) => {
        return new Promise((resolve) => {
            if (node?.children) {
                resolve();
                return;
            }
            const type = node?.type === 'administrative_dpt' ? 'folder' : node?.type;
            const id = node?.type === 'administrative' ? node?.key.split("_")[0] : node?.id;
            apiFolder.listAllInFolder({type, id}, (err, res) => {
                if (res) {
                    setTreeData(prev => {
                        let copyData = _.cloneDeep(prev.data);
                        copyData = findData(copyData, id + "_" + type, res, true);
                        refState.current.originTreeData = copyData;
                        return {...prev, data: copyData};
                    });
                }
                resolve();
            });
        });
    };

    const onDragStart = ({node}) => {
        setTreeData(p => ({
            ...p,
            selectedKeys: [node?.key]
        }));
        if (node?.type === 'folder') return;
        stateRef.current.draggingFile = node;
    };

    const onSelect = (keys, {node}) => {
        setTreeData(prev => ({
            ...prev,
            selectedKeys: keys,
            selectedItem: keys.length === 0 ? null : node
        }));
    };

    const onExpand = (keys) => {
        refState.current.expandedKeys = keys;
    };

    const onRightClickFile = (e) => {
        if (!isMobileDevice() || disabledSchedule) return;
        e.event.persist();
        setTreeData(prev => ({
            ...prev,
            selectedKeys: [e.node.key],
            selectedItem: e.node,
            visibleContextMenu: true,
            rightClickNodeTreeItem: {
                pageX: e.event.pageX,
                pageY: e.event.pageY
            }
        }));
    };

    // Search function
    const onSearch = (value) => {
        if (value === refState.current.searchValue) return;
        refState.current.searchValue = value;
        if (!value) {
            setTreeData(prev => ({
                ...prev,
                data: refState.current.originTreeData
            }));
            return;
        }
        refState.current.prevTreeData = treeData.data;
        setTreeData(prev => ({
            ...prev,
            isLoading: true
        }));
        apiFile.searchFile({
            search: value
        }, (err, res) => {
            if (res) {
                setTreeData(p => ({
                    ...p,
                    isLoading: false,
                    data: convertDataFiles(res)
                }));
            } else {
                setTreeData(prev => ({
                    ...prev,
                    isLoading: false
                }))
            }
        });
    };

    // Upload file function
    const handleOpenModalUpload = () => {
        const folder = treeData.selectedItem;
        if(folder?.type === 'file') {
            Notify.error('Chọn 1 thư mục trước')
        }

        if (folder === null) {
            Notify.error('Chọn 1 thư mục trước');
            return;
        }
        if (folder?.type === 'administrative') {
            Notify.error('Thư mục đang chọn không được phép upload file');
            return;
        }
        if (folder?.type === 'folder') {
            openModalUpload();
        }
    };

    const handleUploadFile = (dataModal, setLoadingModal) => {
        apiFile.createFile({
            url: dataModal?.file,
            parent: treeData.selectedItem?.code ?? treeData.selectedItem?.id,
            title: dataModal.title ? dataModal?.title : dataModal?.file?.name,
            duration: parseInt(dataModal?.duration),
            tags: dataModal?.tags
        }, (err, res) => {
            if (res) {
                if (refState.current.expandedKeys.includes(treeData.selectedItem?.key)) {
                    setTreeData(p => {
                        let copyTreeData = _.cloneDeep(p.data);
                        copyTreeData = addFileToParentFolder(copyTreeData, res);
                        refState.current.originTreeData = copyTreeData;
                        return {...p, data: copyTreeData};
                    });
                }
                closeModalUpload();
                Notify.success('Upload file thành công');
            }
            setLoadingModal(false);
        });
    };

    const disableDropdown = () => {
        setTreeData(prev => ({...prev, visibleContextMenu: false}));
    };

    const handleCreateProgram = (dataModal, setIsLoadingModal) => {
        apiProgram.createProgram({
            ...dataModal,
            broadcastCalendar: historyState?.selectedCalendar?.id ?? ""
        }, (err, res) => {
            if (res) {
                scheduleObj.current.addEvent({
                    ...res,
                    OwnerId: convertOwnerId(res),
                    ...convertTime(res)
                });
                closeModalNewProgram();
                Notify.success('Thêm chương trình thành công');
            }
            setIsLoadingModal(false);
        });
    };

    const onChangeSearch = (e) => {
        const value = e.target.value;
        if (timeoutSearch.current) clearTimeout(timeoutSearch.current);
        timeoutSearch.current = setTimeout(() => {
            onSearch(value);
        }, 700);
    };

    useEffect(() => {
        apiFolder.listAllInFolder({
            type: 'administrative',
            id: administrative?.code ?? ""
        }, (err, res) => {
            if (res) {
                const array = [];
                res.forEach(item => {
                    array.push({
                        ...item,
                        title: item?.nameWithType ?? item?.title,
                        key: (item?.code ?? item?.id) + "_" + item?.type,
                        isLeaf: item?.type === 'file' ? true : undefined
                    });
                });
                refState.current.originTreeData = array;
                setTreeData(prev => ({
                    ...prev,
                    data: array,
                    isLoading: false
                }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render
    const getNodeTreeRightClickMenu = () => {
        if (antTreeEle?.length > 0) {
            antTreeEle[0].style.overflow = 'hidden';
        }
        const {pageX, pageY} = {...treeData.rightClickNodeTreeItem};
        const tmpStyle = {
            position: "absolute",
            left: `${pageX}px`,
            top: `${pageY}px`,
            zIndex: 801,
            boxShadow: '0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%)'
        };
        const menu = (
            <Menu style={tmpStyle}>
                <Menu.Item
                    icon={<PlusCircleOutlined/>}
                    className="row-vertical-center"
                    style={{height: '30px'}}
                    onClick={() => openModalNewProgram()}
                >
                    Tạo chương trình
                </Menu.Item>
            </Menu>
        );
        if (!treeData.visibleContextMenu) {
            if (antTreeEle?.length > 0) {
                antTreeEle[0].style.overflow = 'auto';
            }
            return null;
        }
        return menu;
    };

    return (
        <>
            {
                treeData.visibleContextMenu &&
                <div
                    className="mask_dropdown"
                    onClick={disableDropdown}
                />
            }
            <div
                className="radio-program_sidebar"
                onDrag={(e) => e.preventDefault()}
                onClick={disableDropdown}
            >
                <div className="m-1 mb-2 d-flex font-weight-bold justify-content-between">
                    <div className="row-vertical-center">
                        <UnorderedListOutlined className="mr-1"/>
                        <span>Danh sách thư mục</span>
                    </div>
                    <Button
                        className="row-all-center"
                        icon={<CloudUploadOutlined/>}
                        onClick={handleOpenModalUpload}
                    >
                        Tải lên
                    </Button>
                </div>
                <div className="mb-2 m-1">
                    <Input
                        loading={treeData.isLoading ? 'true' : 'false'}
                        onChange={onChangeSearch}
                        onSearch={onSearch}
                        placeholder="Tìm kiếm File (tag, tên file)..."
                    />
                </div>
                {
                    treeData.data.length === 0 && !treeData.isLoading ?
                        <Empty description="Không tìm thấy dữ liệu..."/>
                        :
                        <Tree
                            showIcon
                            draggable={!disabledSchedule || isDefaultCalendar}
                            showLine={{showLeafIcon: false}}
                            allowDrop={() => false}
                            treeData={treeData.data}
                            selectedKeys={treeData.selectedKeys}
                            loadData={onLoadData}
                            onDragStart={onDragStart}
                            onSelect={onSelect}
                            onExpand={onExpand}
                            onRightClick={onRightClickFile}
                            icon={({data}) => data?.type === 'file' ? <FileOutlined/> : <FolderFilled/>}
                        />
                }

                <ModalFilesFolder
                    visible={visibleModalUpload}
                    handleClose={closeModalUpload}
                    typeModal="new"
                    typeItem="file"
                    onOk={handleUploadFile}
                />
                {getNodeTreeRightClickMenu()}
            </div>
            <ModalFile
                isOpen={visibleModalNewProgram}
                onClose={closeModalNewProgram}
                onChange={handleCreateProgram}
                dataEdit={treeData.selectedItem}
            />
        </>
    );
});

export default Sidebar;