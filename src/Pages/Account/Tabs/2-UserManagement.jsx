import React, {useEffect, useRef, useState} from "react";
import {Row}                                from "antd";
import {FontAwesomeIcon}                    from "@fortawesome/react-fontawesome";
import {faCircle, faLock, faPen, faPlus}    from "@fortawesome/free-solid-svg-icons";
import moment                               from "moment";
import _                                    from "lodash";
import {useSelector}                        from "react-redux";

import ActionBar       from "../../../Components/CustomTag/ActionBar";
import CustomTable     from "../../../Components/CustomTag/CustomTable";
import FilterBar       from "../../../Components/CustomTag/FilterBar";
import apiAccount      from "../../../Api/User/User";
import ModalAccount    from "../Modal/ModalAccount";
import apiAuth         from "../../../Api/Auth/Auth";
import useModalManager from "../../../Components/ModalManger/useModalManager";
import Notify          from "../../../Utils/Notify/Notify";
import Alert           from "../../../Utils/Notify/Alert";
import {allRole}       from "../../../Config/role";

const UserManagement = React.memo(() => {
    const user = useSelector(state => state.user);

    const administrative = user?.administrativeCode;

    const page_size = useRef(50).current;

    const isFirstTime = useRef(true);

    const searchString = useRef('');

    const listItem = [
        {
            title: 'Thêm',
            icon: faPlus,
            key: 1,
            color: 'green',
            onClick: () => handleOpenModalAdd()
        },
        {
            title: 'Sửa',
            icon: faPen,
            key: 2,
            color: 'purple',
            onClick: () => {
                if (infoSelectedAccount?.role?.id === allRole.system) {
                    Notify.error('Không thể chỉnh sửa tài khoản Admin', {autoClose: 1200});
                    return;
                }
                if (selectedAccount[0] !== '') {
                    handleOpenModalEdit();
                }
            }
        },
        {
            title: 'Khóa/Mở',
            icon: faLock,
            key: 3,
            color: 'red',
            onClick: () => {
                if (infoSelectedAccount?.role?.id === allRole.system) {
                    Notify.error('Không thể khóa tài khoản Admin', {autoClose: 1200});
                    return;
                }
                handleBlockAccount();
            }
        },
        // {
        //     title: 'Xóa',
        //     icon: faTrash,
        //     key: 3,
        //     color: 'red',
        //     onClick: () => handleDeleteUser()
        // }
    ];

    const columns = [
        {
            title: "ID",
            width: 50,
            render: (_, __, i) => i + 1 + ((pageObj.current - 1) * page_size)
        },
        {
            title: "Tài khoản",
            render: (_, data) => data?.username
        },
        {
            title: "Họ tên",
            render: (_, data) => data?.fullName
        },
        {
            title: "Email",
            dataIndex: 'email'
        },
        {
            title: "SĐT",
            align: 'center',
            dataIndex: 'phoneNumber'
        },
        {
            title: "Khu vực",
            render: (_, data) => data.administrativeCode?.pathWithType || data.administrativeCode?.nameWithType
        },
        {
            title: "Quyền",
            render: (_, data) => data.role.roleName
        },
        {
            title: "Trạng thái",
            width: 80,
            align: 'center',
            render: (_, data) => (
                <FontAwesomeIcon
                    icon={faCircle}
                    color={data?.accountStatus === 1 ? 'green' : 'red'}
                />
            )
        },
        {
            title: "Ngày tạo",
            width: 160,
            align: 'center',
            render: (_, data) => moment(data?.created).format("DD/MM/YYYY HH:mm:ss")
        }
    ];

    /*  State  */
    const [isOpenModalAdd, , handleOpenModalAdd, handleCloseModalAdd] = useModalManager();

    const [isOpenModalEdit, , handleOpenModalEdit, handleCloseModalEdit] = useModalManager();

    const [listAccount, setListAccount] = useState([]);

    const [selectedAccount, setSelectedAccount] = useState(['']);

    const [pageObj, setPageObj] = useState({
        current: 1,
        total: 1
    });

    const admCode = useRef({
        value: administrative.code ?? "",
        isDPT: false
    });

    const [startFilter, setStartFilter] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const timeoutSearch = useRef(null);

    const infoSelectedAccount = listAccount.find(d => d.username === selectedAccount[0]);

    const getListUser = (pageNow) => {
        if (!isLoading) setIsLoading(true);
        apiAccount.getListUser({
            [admCode.current.isDPT ? 'administrative_code' : 'administrative_code__extended']: admCode.current.value,
            page: pageNow ?? pageObj?.current,
            page_size,
            search: searchString.current ? searchString.current : undefined
        }, (e, res, totalPage) => {
            if (res) {
                if (isFirstTime.current) {
                    isFirstTime.current = false;
                }
                setPageObj(prev => ({...prev, total: totalPage, current: pageNow ?? prev.current}));
                setListAccount(res);
            }
            setIsLoading(false);
        });
    };

    const onRow = (record) => {
        return {
            onClick: () => {
                if (selectedAccount[0] !== record?.username) {
                    setSelectedAccount([record?.username]);
                    return;
                }
                setSelectedAccount([]);
            },
            onDoubleClick: () => {
                setSelectedAccount([record?.username]);
                if (record?.role?.id === allRole.system) {
                    Notify.error('Không thể chỉnh sửa tài khoản Admin', {autoClose: 1200});
                    return;
                }
                handleOpenModalEdit();
            }
        };
    };

    const handleAddUser = (dataModal, setIsLoadingModal, administrativeCode) => {
        apiAuth.register({
            username: dataModal.username,
            password: dataModal.password,
            fullName: dataModal.fullName,
            role: dataModal.role,
            phoneNumber: dataModal.phoneNumber,
            email: dataModal.email,
            administrativeCode
        }, (err, result) => {
            if (result) {
                handleCloseModalAdd();
                getListUser();
                setTimeout(() => {
                    Notify.success("Tạo mới tài khoản thành công");
                }, 500);
            }
            setIsLoadingModal(false);
        });
    };

    const handleEditUser = (dataModal, setIsLoadingModal) => {
        let dataEdit = _.omit(dataModal, 'administrativeCode');
        apiAccount.adminEditUser(dataEdit, (err, result) => {
            if (result) {
                handleCloseModalEdit();
                getListUser();
                setTimeout(() => {
                    Notify.success("Thay đổi thành công");
                }, 500);
            }
            setIsLoadingModal(false);
        });
    };

    // const handleDeleteUser = () => {
    //     if (infoSelectedAccount?.role?.id === allRole.system) {
    //         Notify.error('Không thể xóa tài khoản Admin', {autoClose: 1200});
    //         return;
    //     }
    //     if (!selectedAccount[0]) return;
    //     Alert.confirm("Bạn muốn xóa tài khoản này?", (check) => {
    //         if (check) {
    //             apiAccount.deleteUser({
    //                 username: listAccount.find(d => d.username === selectedAccount[0]).username
    //             }, (err) => {
    //                 if (!err) {
    //                     setSelectedAccount(['']);
    //                     getListUser();
    //                     setTimeout(() => {
    //                         Notify.success("Xóa tài khoản thành công");
    //                     }, 500);
    //                 }
    //             });
    //         }
    //     });
    // };

    const pagination = {
        total: pageObj.total * page_size,
        current: pageObj.current,
        pageSize: page_size,
        onChange: (pageNow) => {
            setSelectedAccount(['']);
            getListUser(pageNow);
        }
    };

    const rowSelection = {
        type: "radio",
        selectedRowKeys: selectedAccount,
        onChange: (selectedRowKeys) => {
            setSelectedAccount(selectedRowKeys);
        }
    };

    const onSearchString = (value) => {
        searchString.current = value;
        setStartFilter(!startFilter);
    };

    const handleBlockAccount = () => {
        if (!selectedAccount[0]) return;
        const {username, accountStatus} = infoSelectedAccount;
        const tmp = accountStatus === 1 ? "khóa tài khoản" : "mở khóa tài khoản";
        Alert.confirm(`Xác nhận ${tmp} " ${username} " ?`, (check) => {
            if (check) {
                apiAccount.adminEditUser({
                    username,
                    accountStatus: accountStatus === 1 ? 3 : 1
                }, (err, result) => {
                    if (result) {
                        handleCloseModalEdit();
                        getListUser();
                        setTimeout(() => {
                            Notify.success(`Đã ${tmp} " ${username} "`);
                        }, 500);
                    }
                });
            }
        });
    };

    const onChangeSearch = (e) => {
        const value = e.target.value;
        if (timeoutSearch.current) {
            clearTimeout(timeoutSearch.current);
        }
        timeoutSearch.current = setTimeout(() => {
            onSearchString(value);
        }, 700);
    };

    useEffect(() => {
        getListUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isFirstTime.current) {
            getListUser(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startFilter]);

    return (
        <div className="account-management_content_slide-in-fade-in mt-2">
            <Row className="mt-2">
                <ActionBar
                    listItem={listItem}
                    width={370}
                />
            </Row>
            <Row className="mt-2">
                <FilterBar
                    searchBox
                    searchString={searchString.current}
                    setAdmCode={(value) => admCode.current = value}
                    startFilter={() => setStartFilter(prev => !prev)}
                    onSearchString={onSearchString}
                    onChangeSearch={onChangeSearch}
                />
            </Row>
            <div className="table-list-user mt-2">
                <CustomTable
                    rowKey="username"
                    isLoading={isLoading}
                    data={listAccount}
                    columns={columns}
                    scrollY="calc(100vh - 280px)"
                    rowSelection={rowSelection}
                    onRow={onRow}
                    pagination={pagination}
                />
            </div>
            <ModalAccount
                onChange={handleAddUser}
                onClose={handleCloseModalAdd}
                isOpen={isOpenModalAdd}
            />
            <ModalAccount
                onChange={handleEditUser}
                onClose={handleCloseModalEdit}
                isOpen={isOpenModalEdit}
                dataEdit={listAccount.find(d => d.username === selectedAccount[0])}
                typeModal="edit"
                handleBlockAccount={handleBlockAccount}
            />
        </div>
    );
});

export default UserManagement;
