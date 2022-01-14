import React                                                             from "react";
import {Dropdown, Menu, Tree}                                            from "antd";
import {EditOutlined, FileOutlined, FolderFilled, UnorderedListOutlined} from "@ant-design/icons";
import {Spinner}                                                         from "reactstrap";
import {useSelector}                                                     from "react-redux";

const SideBar = React.memo(({
                                expandsKey,
                                selectedItem,
                                onExpand,
                                listFolder,
                                onSelect,
                                onRightClick,
                                isExpanding,
                                isAllowedArea,
                                setIsAllowedArea,
                                handleOpenModalEdit,
                                typeItem
                            }) => {
    const app = useSelector(state => state.app);


    const menu = (
        <Menu>
            {/*{*/}
            {/*    selectedItem?.type === 'folder' &&*/}
            {/*    <Menu.SubMenu*/}
            {/*        title="Thêm mới"*/}
            {/*        icon={<PlusOutlined/>}*/}
            {/*        className="row-vertical-center"*/}
            {/*    >*/}
            {/*        <Menu.Item*/}
            {/*            key="new-folder"*/}
            {/*            onClick={() => {*/}
            {/*                handleOpenModalNew();*/}
            {/*                typeItem.current = 'folder';*/}
            {/*                setIsAllowedArea(false);*/}
            {/*            }}*/}
            {/*            className="menu-dropdown-submenu-item"*/}
            {/*        >*/}
            {/*            <Col span={8} className="row-vertical-center">*/}
            {/*                <FolderOutlined/>*/}
            {/*            </Col>*/}
            {/*            <Col span={16} className="row-vertical-center">*/}
            {/*                Thư mục*/}
            {/*            </Col>*/}
            {/*        </Menu.Item>*/}
            {/*        <Menu.Item*/}
            {/*            key="new-file"*/}
            {/*            onClick={() => {*/}
            {/*                handleOpenModalNew();*/}
            {/*                typeItem.current = 'file';*/}
            {/*                setIsAllowedArea(false);*/}
            {/*            }}*/}
            {/*            className="menu-dropdown-submenu-item"*/}
            {/*        >*/}
            {/*            <Col span={8} className="row-vertical-center">*/}
            {/*                <FileOutlined/>*/}
            {/*            </Col>*/}
            {/*            <Col span={16} className="row-vertical-center">*/}
            {/*                Tệp tin*/}
            {/*            </Col>*/}
            {/*        </Menu.Item>*/}
            {/*    </Menu.SubMenu>*/}
            {/*}*/}
            <Menu.Item
                key="edit"
                icon={<EditOutlined/>}
                onClick={() => {
                    handleOpenModalEdit();
                    selectedItem?.type === 'file' ? typeItem.current = 'file' : typeItem.current = 'folder';
                }}
            >
                Đổi tên {selectedItem?.type === 'file' ? 'file' : 'thư mục'}
            </Menu.Item>
            {/*{*/}
            {/*    !selectedItem?.isRootFolder &&*/}
            {/*    <Menu.Item*/}
            {/*        key="delete"*/}
            {/*        icon={<DeleteOutlined/>}*/}
            {/*    >*/}
            {/*        Xóa {selectedItem?.type === 'file' ? 'file' : 'thư mục'}*/}
            {/*    </Menu.Item>*/}
            {/*}*/}
        </Menu>
    );

    return (
        <div className="content-management_sidebar border-right pl-2">
            <div className="d-flex">
                <div className="d-flex w-75">
                    <div className="p-2 row-vertical-center font-weight-bold">
                        <UnorderedListOutlined className="mr-1"/>
                        Danh sách thư mục
                    </div>
                    {
                        isExpanding &&
                        <div className="ml-3 d-flex align-items-center">
                            <Spinner
                                color="primary"
                                size="sm"
                            />
                        </div>
                    }
                </div>
            </div>
            <div
                className={`sidebar${!app.isOpenSidebar ? ' w-100' : ''}`}
                onClick={() => {
                    if (isAllowedArea) {
                        setIsAllowedArea(false);
                    }
                }}
            >
                <Dropdown
                    visible={isAllowedArea && selectedItem?.type === 'folder'}
                    overlay={menu}
                    trigger={['contextMenu']}
                    onVisibleChange={(visible) => {
                        if (!visible) {
                            setIsAllowedArea(false);
                        }
                    }}
                >
                    <Tree
                        showLine={{showLeafIcon: false}}
                        showIcon
                        // switcherIcon={<DownOutlined/>}
                        icon={({data}) => data?.type === 'file' ? <FileOutlined/> : <FolderFilled/>}
                        allowDrop={() => false}
                        draggable={true}
                        selectedKeys={[selectedItem?.key]}
                        onRightClick={onRightClick}
                        onSelect={onSelect !== null ? onSelect : false}
                        treeData={listFolder}
                        expandedKeys={expandsKey}
                        onExpand={onExpand}
                    />
                    {/*</div>*/}
                </Dropdown>
            </div>
        </div>
    );
});

export default SideBar;
