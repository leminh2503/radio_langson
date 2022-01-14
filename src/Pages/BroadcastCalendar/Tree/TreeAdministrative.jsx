import React, {useEffect, useRef, useState} from 'react';
import {Tree}                               from 'antd';
import {useSelector}                        from "react-redux";

import apiAdministrative from '../../../Api/Administrative/Administrative';
import {faMapMarkerAlt}  from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const convertData = (data) => {
    const isLeaf = data?.division === 4 || data?.type === 'administrative_dpt';
    const parentCode = data?.parentCode ? `_${data.parentCode}` : "_null";
    const division = data?.division ? `_${data.division}` : "";
    const type = data?.type ? `_${data.type}` : "";
    const key = data?.code + parentCode + division + type;
    return {
        // title: data?.code + "_" + data?.nameWithType ?? "",
        key,
        isLeaf,
        title: data?.nameWithType ?? "",
        division: data?.division
    };
};

const mapData = (data, key, res) => {
    data.map(d => {
        if (d.key === key) {
            const array = [];
            res.forEach(r => {
                const obj = convertData(r);
                array.push(obj);
            });
            d.children = array;
            d.gotData = true;
        } else if (d?.children) {
            mapData(d?.children, key, res);
        }
        return d;
    });
    return data;
};

const findChildren = (dataMapped, key) => {
    for (const p of dataMapped) {
        if (p?.key === key) {
            return p;
        } else if (p?.children) {
            const children = findChildren(p.children, key);
            if (children) return children;
        }
    }
};

const TreeAdministrative = React.memo((props) => {
    const {adCode, disabled} = props;

    const user = useSelector(state => state.user);

    const administrativeUser = user?.administrativeCode;

    const autoExpandParent = useRef(true);

    const [treeData, setTreeData] = useState([]);

    const [expandedKeys, setExpandedKeys] = useState([]);

    const onExpand = (expandedKeysValue) => {
        autoExpandParent.current = false;
        setExpandedKeys(expandedKeysValue);
    };

    const handleCheckedKeys = (checkedKeys) => {
        adCode.current = {
            province: "",
            districts: [],
            wards: [],
            selected: []
        };
        const all = checkedKeys.find(k => k.includes("_all"));
        if (all) {
            const splitCode = all.split("_");
            adCode.current = {
                province: "",
                districts: [],
                wards: [],
                selected: []
            };
            if (splitCode[2] === "1") {
                adCode.current.province = splitCode[0];
            } else if (splitCode[2] === "2") {
                adCode.current.districts = [splitCode[0]];
            } else if (splitCode[2] === "3") {
                adCode.current.wards = [splitCode[0]];
            }
            return;
        }
        checkedKeys = checkedKeys.filter(k => !k.includes("_fake"));
        adCode.current.province = "";
        checkedKeys.forEach(d => {
            const splitCode = d.split("_");
            const division = splitCode[2];
            const type = splitCode?.length === 5 ? splitCode[4] : splitCode[3];
            if (division === "2" && type !== 'dpt') {
                adCode.current.districts.push(d);
            }
            if (division === "3" && type !== 'dpt') {
                adCode.current.wards.push(d);
            }
            if (division === "4" || type === 'dpt') {
                adCode.current.selected.push(d);
            }
        });
        const {districts, wards} = adCode.current;
        const districtsCode = districts.map(d => d.split("_")[0]);
        const wardsCode = wards.map(d => d.split("_")[0]);
        const newWardsCode = [];
        const newSelectedCode = [];
        adCode.current.wards.forEach(w => {
            const wardCode = w.split("_")[0];
            const wardParentCode = w.split("_")[1];
            if (!districtsCode.includes(wardParentCode)) {
                newWardsCode.push(wardCode);
            }
        });
        adCode.current.selected.forEach(s => {
            const splitSelected = s.split("_");
            const selectedCode = splitSelected[0];
            const selectedParentCode = splitSelected[1];
            const type = splitSelected?.length === 5 ? splitSelected[4] : splitSelected[3];
            if (type === 'dpt') {
                if (
                    !districtsCode.includes(selectedCode) &&
                    !wardsCode.includes(selectedCode)
                ) {
                    newSelectedCode.push(selectedCode);
                }
            } else if (
                !wardsCode.includes(selectedParentCode) &&
                !districtsCode.includes(selectedParentCode)
            ) {
                newSelectedCode.push(selectedCode);
            }
        });
        adCode.current.districts = districtsCode;
        adCode.current.wards = newWardsCode;
        adCode.current.selected = newSelectedCode;
    };

    const onCheck = (checkedKeysValue) => {
        handleCheckedKeys(checkedKeysValue);
    };

    const updateTreeData = (list, key, children) => {
        return list.map((node) => {
            if (node.key === key) {
                return {...node, children};
            }

            if (node.children) {
                return {...node, children: updateTreeData(node.children, key, children)};
            }

            return node;
        });
    };

    const onLoadData = ({key, children}) => {
        return new Promise((resolve) => {
            if (children) {
                resolve();
                return;
            }
            apiAdministrative.getAdministrativeWithSelf({
                code: key.split("_")[0]
            }, (err, res) => {
                if (res) {
                    const checkedArray = [];
                    res.forEach(r => checkedArray.push(r.code));
                    const copyTreeData = JSON.parse(JSON.stringify(treeData[0].children));
                    const dataMapped = mapData(copyTreeData, key, res);
                    setTreeData((origin) => updateTreeData(origin, key, findChildren(dataMapped, key)?.children));
                    resolve();
                }
            });
        });
    };

    useEffect(() => {
        apiAdministrative.getAdministrativeWithSelf({
            code: administrativeUser?.code
        }, (err, res) => {
            if (res) {
                const key = administrativeUser?.code + `_all_${administrativeUser.division}`;
                const array = [{
                    key,
                    title: administrativeUser?.nameWithType ?? "",
                    division: administrativeUser?.division ?? "",
                    children: []
                }];
                res.forEach(r => {
                    const obj = convertData(r);
                    array[0].children.push(obj);
                });
                setTreeData(array);
                setExpandedKeys([key]);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Tree
            showIcon
            checkable
            disabled={disabled}
            loadData={onLoadData}
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent.current}
            onCheck={onCheck}
            treeData={treeData}
            selectedKeys={[]}
            icon={<FontAwesomeIcon icon={faMapMarkerAlt}/>}
        />
    );
});

export default TreeAdministrative;