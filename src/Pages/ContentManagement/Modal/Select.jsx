import React, {useEffect, useMemo, useState} from 'react';
import {Select}                              from "antd";
import {CheckOutlined}                       from "@ant-design/icons";
import apiThread                             from "../../../Api/Thread/Thread";

const defaultThread = {
    parentThread: 1,
    childThread: 2
};

const arrayThread = Object.keys(defaultThread);

const initListArrayThread = {
    parentThread: [],
    childThread: []
};

const ListThreadComponent = (props) => {
    const {
        listThread,
        state,
        setState,
        initCurrentCode,
        setParentThread,
        setChildThread
    } = props;

    const onSelect = (value, opData, keyValue) => {
        const {currentAdCode, listArrayThread} = state;
        const nextKey = arrayThread[defaultThread[keyValue]] ?? "";
        let thread = defaultThread[keyValue] ?? "";
        let newListArrayThread;
        switch (thread) {
            case defaultThread.parentThread:
                setParentThread(opData?.item);
                initCurrentCode.current = {...currentAdCode, childThread: null};
                initCurrentCode.current['parentThread'] = value;
                newListArrayThread = {...listArrayThread, childThread: []};
                break;
            case defaultThread.childThread:
                setChildThread(opData?.item);
                initCurrentCode.current = {...currentAdCode};
                initCurrentCode.current['childThread'] = value;
                newListArrayThread = {...listArrayThread};
                break;
            default:
                break;
        }
        setState(prev => ({
            ...prev,
            currentAdCode: initCurrentCode.current,
            listArrayThread: newListArrayThread
        }));
        apiThread.getThread({
            parent: value
        }, (err, res) => {
            if (res) {
                setState(prev => ({
                    ...prev,
                    listArrayThread: {
                        ...newListArrayThread,
                        [nextKey]: res
                    }
                }));
            }
        });
    };

    return (
        listThread.map(({title, keyValue}, i) => (
            <Select
                className="box-select"
                key={i}
                value={state.currentAdCode[keyValue]}
                dropdownMatchSelectWidth={false}
                onChange={(value, opData) => onSelect(value, opData, keyValue)}
                placeholder={title}
            >
                {
                    state.listArrayThread[keyValue].map(item => (
                        <Select.Option value={item?.id} key={item?.id} item={item}>
                            {item?.name ?? ""}
                        </Select.Option>
                    ))
                }
            </Select>
        ))
    );
};

const SelectComponent = React.memo((props) => {
    const {
        visible,
        initCurrentAdCode,
        setChildThread,
        setParentThread,
        typeModal,
        folderInfo
    } = props;

    const [state, setState] = useState({
        listArrayThread: initListArrayThread,
        currentAdCode: initCurrentAdCode.current
    });

    const listThread = useMemo(() => {
        return [
            {
                keyValue: 'parentThread',
                icon: <CheckOutlined/>,
                type: 'select'
            },
            {
                keyValue: 'childThread',
                icon: <CheckOutlined/>,
                type: 'select'
            }
        ];
    }, []);

    useEffect(() => {
        apiThread.getThread({
            parent__isnull: true
        }, (err, res) => {
            if (res) {
                if (typeModal === 'new') {
                    setState(prev => ({
                        ...prev,
                        listArrayThread: {
                            ...state.listArrayThread,
                            parentThread: res
                        },
                        currentAdCode: {
                            parentThread: null,
                            childThread: null
                        }
                    }));
                }
                if (typeModal === 'edit') {
                    apiThread.getThread({
                            parent: folderInfo?.thread1?.id
                        }, (err1, res1) => {
                            setState(() => {
                                return {
                                    listArrayThread: {
                                        parentThread: res,
                                        childThread: res1
                                    },
                                    currentAdCode: {
                                        parentThread: folderInfo?.thread1?.id ?? "",
                                        childThread: folderInfo?.thread2?.id ?? ""
                                    }
                                };
                            });
                        }
                    );
                }
            }
        });
    }, [typeModal, visible]);

    return (
        <div className="grid-filter-bar broadcast-calendar">
            <ListThreadComponent
                listThread={listThread}
                state={state}
                setState={setState}
                initCurrentCode={initCurrentAdCode}
                setParentThread={setParentThread}
                setChildThread={setChildThread}
            />
        </div>
    );
});

export default SelectComponent;