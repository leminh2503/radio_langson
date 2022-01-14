import React, {useEffect, useState} from 'react';
import {Tree}                       from "antd";
import {useSelector}                from "react-redux";
import {FileOutlined, FolderFilled} from "@ant-design/icons";
import _                            from "lodash";
import apiFolder                    from "../../../Api/Folder/Folder";
import {findData}                   from "../../../Utils/Data/tree";

const TreeFolder = React.memo((props) => {
    const {disabled, onSelectFile} = props;

    const user = useSelector(state => state.user);

    const [treeData, setTreeData] = useState([]);

    function onLoadData(node) {
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
                        let copyPrev = _.cloneDeep(prev);
                        copyPrev = findData(copyPrev, id + "_" + type, res, true);
                        return copyPrev;
                    });
                }
                resolve();
            });
        });
    }

    useEffect(() => {
        apiFolder.listAllInFolder({
            type: 'administrative',
            id: user?.administrativeCode?.code ?? ""
        }, (err, res) => {
            if (res) {
                const convertedData = [];
                res.forEach((item) => {
                    convertedData.push({
                        ...item,
                        title: item?.nameWithType ?? item?.title,
                        key: (item?.code ?? item?.id) + "_" + item?.type,
                        isLeaf: item?.type === 'file' ? true : undefined
                    });
                });
                setTreeData(convertedData);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Tree
            showLine={{showLeafIcon: false}}
            disabled={disabled}
            showIcon
            loadData={onLoadData}
            onSelect={(value, {node}) => onSelectFile(node)}
            treeData={treeData}
            icon={({data}) => data?.type === 'file' ? <FileOutlined/> : <FolderFilled/>}
        />
    );
});

export default TreeFolder;