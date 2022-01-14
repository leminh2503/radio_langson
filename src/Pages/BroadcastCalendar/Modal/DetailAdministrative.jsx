import React, {useEffect, useRef, useState} from 'react';

import {Input, List, Modal, Row}  from "antd";
import {FontAwesomeIcon}          from '@fortawesome/react-fontawesome';
import {faMapMarkerAlt, faSearch} from '@fortawesome/free-solid-svg-icons';

const ContentDetailAdministrative = (props) => {
    const {administrative, data, renderTypeSelected} = props;

    return (
        administrative.map(({title, key, typeName: typeAdministrative}, index) => (
            <ListContent
                key={index}
                index={index}
                title={title}
                data={data}
                renderTypeSelected={renderTypeSelected}
                typeAdministrative={typeAdministrative}
                keyData={key}
            />
        ))
    );
};

const ListContent = ({index, title, data, renderTypeSelected, typeAdministrative, keyData}) => {
    const [searchInput, setSearchInput] = useState('');

    const [showSearch, setShowSearch] = useState(false);

    const handleSearch = (e) => {
        setSearchInput(e.target.value);
    };

    const filterList = searchInput
        ?
        data[keyData]
            .filter(ele => ele.nameWithType.normalize("NFD").replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .includes(searchInput.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, '')
                )
            )
        :
        data[keyData];

    const handleShowSearchInput = () => {
        setSearchInput('');
        setShowSearch(!showSearch);
    };

    useEffect(() => {
        setSearchInput('');
    }, [data]);

    if (data[keyData]?.length === 0) {
        return null;
    }

    const renderListAd = (item) => {
        return (
            <List.Item>
                • {
                keyData === 'selected' ?
                    `${renderTypeSelected(typeAdministrative, item.typeName)} ${item.nameWithType}`
                    :
                    item.nameWithType
            }
            </List.Item>
        );
    };

    return (
        <div key={index} className="mb-2">
            <Row className="row-vertical-center mb-2">
                <div className="text-bold-5 ml-1 d-flex justify-content-between w-100">
                    <span>
                        <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            color="#07BC0C"
                        />
                        <span className="ml-1">{title}</span>
                    </span>
                    <span onClick={handleShowSearchInput} style={{cursor: 'pointer'}}>
                        <FontAwesomeIcon icon={faSearch}/>
                    </span>
                </div>
                {
                    showSearch &&
                    <Input
                        className="mt-1"
                        placeholder="Tìm kiếm..."
                        value={searchInput}
                        onChange={handleSearch}
                    />
                }
            </Row>
            <List
                size="small"
                bordered
                dataSource={filterList.filter(d => typeof d === 'object')}
                style={{minHeight: '82px'}}
                renderItem={renderListAd}
            />
        </div>
    );
};

const DetailAdministrative = (props) => {
    const {visible, currentAdTree, onClose} = props;

    const _administrative = useRef([
        {
            title: 'Tỉnh/Thành phố',
            key: 'province',
            typeName: ['tinh', 'thanh-pho']
        },
        {
            title: 'Quận/Huyện',
            key: 'districts',
            typeName: ['quan', 'huyen']
        },
        {
            title: 'Phường/Xã/Thị trấn',
            key: 'wards',
            typeName: ['phuong', 'xa', 'thi-tran']
        },
        {
            title: 'Đài phát thanh/Làng',
            key: 'selected',
            typeName: ['lang']
        }
    ]).current;

    const [data, setData] = useState({
        province: [],
        districts: [],
        wards: [],
        selected: []
    });

    const renderTypeSelected = (typeAdministrative, typeName) => {
        if (typeAdministrative.includes(typeName)) {
            return "Làng";
        }
        return "ĐPT";
    };

    useEffect(() => {
        if (!visible) {
            currentAdTree.current = null;
        } else {
            const {province, districts, wards, selected} = currentAdTree.current;
            setData({
                province: province ? [province] : [],
                districts: districts ?? [],
                wards: wards ?? [],
                selected: selected ?? []
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal
            className="detail_administrative_modal"
            title="Danh sách địa phương"
            visible={visible}
            onOk={onClose}
            onCancel={onClose}
            okText="Xác nhận"
        >
            <ContentDetailAdministrative
                administrative={_administrative}
                data={data}
                renderTypeSelected={renderTypeSelected}
            />
        </Modal>
    );
};

export default DetailAdministrative;