import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector}                                     from "react-redux";
import mqtt                                              from "mqtt";

import apiEquipment      from "../../Api/Equipment/Equipment";
import Sidebar           from "./Sidebar/Sidebar";
import Main              from "./Main";
import {findData}        from "../../Utils/Data/tree";
import apiAdministrative from "../../Api/Administrative/Administrative";
import {allRole}         from "../../Config/role";
import SidebarBase       from "../../Components/Layouts/Sidebar/SidebarBase";
import {useHistory}      from "react-router-dom";
import {defaultDivision} from "../../Config/division";

const EquipmentManagement = React.memo(() => {
    const {user} = useSelector(state => ({user: state.user}));

    const history = useHistory();

    const mountedComponent = useRef(false);

    const expandsKeyCurrent = useRef([]);

    const typeItem = useRef('');

    const currentAdCode = useRef('');

    const searchInput = useRef('');

    const statusDevice = useRef(history?.location.state?.status ?? 'all');

    const clientMqtt = useRef(undefined);

    const interval = useRef(null);

    const keysRequired = React.useRef(['vol', 'sts']).current;

    const currentPagination = useRef({
        page: 1,
        pageSize: 30,
        total: 0
    });

    const [isLoading, setIsLoading] = useState(true);

    const [listDataSidebar, setDataSidebar] = useState([]);

    const [listDataMain, setListDataMain] = useState({
        id: '',
        data: {},
        totalPage: 0
    });

    const [expandsKey, setExpandsKey] = useState([]);

    const [selectedItem, setSelectedItem] = useState(null);

    const [isExpanding, setIsExpanding] = useState(false);

    const [isAllowedArea, setIsAllowedArea] = useState(false);

    const fetchDevice = (administrative, page, isEditedModal = false) => {
        const code = administrative?.code;
        currentAdCode.current = code;
        apiEquipment.getListEquipment({
            page: currentPagination.current.page,
            page_size: currentPagination.current.pageSize,
            administrative_code__extended: code,
            search: searchInput.current ? searchInput.current : undefined,
            status: statusDevice.current === 'all' ? undefined : statusDevice.current
        }, (err, result, totalPage) => {
            if (result && mountedComponent.current) {
                setListDataMain(prev => ({
                    id: administrative?.code,
                    data: {
                        ...prev.data,
                        [administrative?.code]: result
                    },
                    totalPage
                }));
                currentPagination.current.total = totalPage
                setIsLoading(false);
            } else {
                if (mountedComponent.current) {
                    setIsLoading(false);
                }
            }
        });
    };

    const handleOpenFolder = useCallback((administrative, page = 1) => {
        if (mountedComponent.current) setIsLoading(true);
        if (interval.current) clearInterval(interval.current);
        if (!interval.current || page === 1) fetchDevice(administrative, page);
        interval.current = setInterval(() => {
            fetchDevice(administrative, page);
        }, 5 * 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onExpand = useCallback((expandsKeySelect, {node}) => {
        const code = node?.code;
        const type = node?.type;
        if (expandsKeySelect?.length > 0 && expandsKeySelect?.length > expandsKey?.length && !expandsKeyCurrent.current.includes(node.key)) {
            setIsExpanding(true);
            apiAdministrative.getAdministrativeWithSelf({code}, (err, result) => {
                if (result) {
                    expandsKeyCurrent.current.push(node.key);
                    setDataSidebar(prev => {
                        let copyPrev = JSON.parse(JSON.stringify(prev));
                        copyPrev = findData(copyPrev, code + "_" + type, result, false, true);
                        return copyPrev;
                    });
                    setTimeout(() => {
                        setExpandsKey(expandsKeySelect);
                        setIsExpanding(false);
                    }, 100);
                }
            });
        } else {
            setExpandsKey(expandsKeySelect);
        }
    }, [expandsKey]);

    const onSelect = useCallback((id, info) => {
        if (!mountedComponent.current) return;
        setSelectedItem(info.node);
        handleOpenFolder(info.node);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem, mountedComponent]);

    const onRightClick = useCallback(({node}) => {
        if (node.type !== 'folder') return;
        setIsAllowedArea(true);
        setSelectedItem(node);
    }, []);

    const onChangeStatusDevice = useCallback(() => {
        handleOpenFolder({code: currentAdCode.current}, 1);
    }, [handleOpenFolder]);

    const onSearch = useCallback((value) => {
        searchInput.current = value;
        if (!currentAdCode.current || isLoading) return;
        handleOpenFolder({code: currentAdCode.current}, 1);
    }, [isLoading, handleOpenFolder]);

    useEffect(() => {
        const client = mqtt.connect(process.env.REACT_APP_MQTT_WSS, {
            reconnectPeriod: 10000
        });

        client.on('connect', function () {
            if (mountedComponent.current) {
                client.subscribe('return_status', function (err) {
                    if (!err) {
                        clientMqtt.current = client;
                    }
                });
            } else {
                client.end();
            }
        });

        client.on('message', function (topic, message) {
            const messString = message.toString();

            const splitString = messString.split("_") ?? [];

            if (splitString.length < 2) return;

            const keyAndValue = splitString[1].split("=") ?? [];

            if (keyAndValue?.length < 2) return;

            const key = keyAndValue[0] ?? "";

            if (!keysRequired.includes(key)) return;

            const value = keyAndValue[1] ?? "";

            if (value === "") return;

            setListDataMain(prev => {
                const copyPrev = JSON.parse(JSON.stringify(prev));
                const index = copyPrev.data[copyPrev.id].findIndex(d => d.mac === splitString[0]);
                if (index === -1) return copyPrev;
                copyPrev.data[copyPrev.id][index][key === 'vol' ? 'volume' : 'status'] = Number(value);
                return copyPrev;
            });
        });
    }, [keysRequired]);

    useEffect(() => {
        mountedComponent.current = true;
        const administrative = user?.administrativeCode ?? {};
        apiAdministrative.getAdministrativeWithSelf({
            code: user?.administrativeCode?.code ?? undefined
        }, (err, result) => {
            if (result && mountedComponent.current) {
                const newData = [{
                    code: administrative?.code,
                    title: administrative?.nameWithType,
                    key: administrative?.code + "_administrative",
                    children: []
                }];
                if (result?.length === 0) {
                    newData.children = undefined;
                } else {
                    result.forEach((item) => {
                        newData[0].children.push({
                            ...item,
                            title: item?.nameWithType,
                            key: item?.code + "_" + item?.type,
                            children: item?.type === 'administrative_dpt' || item?.division === 4 ? undefined : [
                                {key: (item?.id ?? item?.code) + '_children'}
                            ]
                        });
                    });
                }
                setDataSidebar(newData);
                setSelectedItem(newData[0]);
                setExpandsKey([newData[0].key]);
                expandsKeyCurrent.current.push(newData[0].key);
                onSelect(newData[0].id, {node: newData[0]});
            } else {
                if (mountedComponent.current)
                    setIsLoading(false);
            }
        });

        return () => {
            mountedComponent.current = false;
            if (clientMqtt.current) {
                clientMqtt.current.end();
            }
            if (interval.current) {
                clearInterval(interval.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="d-flex equipment-management">
            <SidebarBase >
                <Sidebar
                    expandsKey={expandsKey}
                    selectedItem={selectedItem}
                    onExpand={onExpand}
                    listFolder={listDataSidebar}
                    onSelect={onSelect}
                    onRightClick={onRightClick}
                    isExpanding={isExpanding}
                    isAllowedArea={isAllowedArea}
                    setIsAllowedArea={setIsAllowedArea}
                    typeItem={typeItem}
                />
            </SidebarBase>
            <Main
                isLoading={isLoading}
                selectedFolder={selectedItem}
                listDataMain={listDataMain}
                typeItem={typeItem}
                handleOpenFolder={handleOpenFolder}
                setListDataMain={setListDataMain}
                onSearch={onSearch}
                statusDevice={statusDevice}
                onChangeStatusDevice={onChangeStatusDevice}
                interval={interval}
                selectedAd={selectedItem}
                fetchDevice={fetchDevice}
                currentPagination={currentPagination}
            />
        </div>
    );
});

export default EquipmentManagement;
