export const findData = (data, key, res, hasFile, onlyAdministrative) => {
    data.map((item) => {
        if (item?.key === key && res?.length > 0) {
            const tmp = [];
            res.forEach(i => {
                if (i?.type === 'administrative_dpt') {
                    tmp.push({
                        ...i,
                        title: i?.nameWithType ?? i?.title,
                        key: (i?.code ?? i?.id) + "_" + i.type,
                        isLeaf: true
                    });
                    return;
                }
                if (hasFile && i?.type === 'file') {
                    tmp.push({
                        ...i,
                        title: i?.nameWithType ?? i?.title,
                        key: (i?.code ?? i?.id) + "_" + i.type,
                        isLeaf: true
                    });
                    return;
                }
                if (i?.type === 'folder' || i?.type === 'administrative') {
                    tmp.push({
                        ...i,
                        title: i?.nameWithType ?? i?.title,
                        key: (i?.code ?? i?.id) + "_" + i.type,
                        children: onlyAdministrative ? [{key: (i?.code ?? i?.id) + "_children"}] : undefined
                    });
                }
            });
            item.children = tmp;
        } else if (item?.key !== key && item?.children) {
            findData(item?.children, key, res, hasFile, onlyAdministrative);
        } else if (item?.key === key && res?.length === 0) {
            item.children = undefined;
        }
        return item;
    });
    return data;
};

export const findDataEdit = (data, res) => {
    return data.map((item) => {
        if (item?.id === res.id) {
            item.title = res.title;
        } else {
            if (item?.children)
                findDataEdit(item.children, res);
        }
        return item;
    });
};

export const findDataCreateFolder = (currentDataSidebar, newItem) => {
    const keyParentNewItem = newItem?.parent + "_folder";
    currentDataSidebar.map(d => {
        if (d?.key === keyParentNewItem) {
            if (d?.children === undefined) {
                d.children = [{
                    ...newItem,
                    key: newItem?.id + "_folder"
                    // children: [{key: newItem?.id + "_children"}]
                }];
            } else {
                d.children.push({
                    ...newItem,
                    key: newItem?.id + "_folder"
                    // children: [{key: newItem?.id + "_children"}]
                });
            }
        } else if (d?.key !== keyParentNewItem && d?.children) {
            findDataCreateFolder(d?.children, newItem);
        }
        return d;
    });
    return currentDataSidebar;
};

export const findDataDeleteFolder = (currentDataSidebar, oldFolder) => {
    const keyParentOldFolder = oldFolder?.parent + "_folder";
    currentDataSidebar.map(d => {
        if (d?.key === keyParentOldFolder) {
            d.children = d.children.filter(c => c?.id !== oldFolder?.id);
        } else if (d?.key !== keyParentOldFolder && d?.children) {
            findDataCreateFolder(d?.children, oldFolder);
        }
        return d;
    });
    return currentDataSidebar;
};

export const addFileToParentFolder = (currentData = [], newFile) => {
    for (const i in currentData) {
        if (newFile?.parent === currentData[i].id) {
            if (currentData[i]?.children) {
                const convertFile = {
                    ...newFile,
                    key: newFile?.id + "_file",
                    type: 'file',
                    isLeaf: true
                };
                currentData[i].children = currentData[i].children.concat(convertFile);
                break;
            } else {
                currentData[i].children = [newFile];
                break;
            }
        } else {
            if (currentData[i]?.children) {
                addFileToParentFolder(currentData[i]?.children, newFile);
            }
        }
    }
    return currentData;
};

export const convertDataFiles = (data) => {
    return data.map(d => {
        d.isLeaf = true;
        d.key = d.id;
        d.type = 'file';
        return d;
    });
};