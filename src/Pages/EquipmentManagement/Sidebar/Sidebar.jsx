import React                                 from "react";
import {Dropdown, Menu, Tree}                from "antd";
import {EditOutlined, UnorderedListOutlined} from "@ant-design/icons";
import {Spinner}                             from "reactstrap";
import {useDispatch, useSelector}            from "react-redux";
import {FontAwesomeIcon}                     from '@fortawesome/react-fontawesome';
import {faBars, faMapMarkerAlt}              from "@fortawesome/free-solid-svg-icons";
import {closeSidebar, openContent}           from "../../../Redux/Actions/appActions";

const Sidebar = React.memo(({
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

    const dispatch = useDispatch();

    const menu = (
        <Menu>
            <Menu.Item
                key="edit"
                icon={<EditOutlined/>}
                onClick={() => {
                    handleOpenModalEdit();
                    selectedItem?.type === 'file' ? typeItem.current = 'file' : typeItem.current = 'folder';
                    setIsAllowedArea(false);
                }}
            >
                Đổi tên {selectedItem?.type === 'file' ? 'file' : 'thư mục'}
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="equipment-management_sidebar pl-2 pb-1 border-right">
            <div className="d-flex justify-content-between">
                <div className="d-flex">
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
                {
                    !app.isOpenContent &&
                    <div
                        className="row-vertical-center py-2 pr-2 hover-pointer"
                        onClick={() => {
                            dispatch(openContent());
                            dispatch(closeSidebar());
                        }}
                    >
                        <FontAwesomeIcon icon={faBars}/>
                    </div>
                }
            </div>
            <div
                className={`sidebar${!app.isOpenSidebar ? ' w-100' : ''}`}
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
                        icon={<FontAwesomeIcon icon={faMapMarkerAlt}/>}
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

export default Sidebar;
