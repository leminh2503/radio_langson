import React, {useEffect, useState} from "react";
import {useSelector}                from "react-redux";
import {Col, Input}                 from "reactstrap";
import {Checkbox}                   from "antd";

import apiAdministrative from "../../../Api/Administrative/Administrative";

const SelectAddressComponent = ({currentCode, setSelectedTypeNameAd}) => {
    const user = useSelector(state => state.user);

    const [state, setState] = useState({
        province: true,
        district: false,
        wards: false,
        village: false,
        listArea: {
            province: [],
            district: [],
            wards: [],
            village: []
        }
    });

    const handleCheckedAdministrative = (code, nextArea) => {
        // if (state[area]) return;
        // if (code === currentCode.current.district) return;
        apiAdministrative.getAdministrativeByCode({code}, (err, res) => {
            if (res) {
                currentCode.current[nextArea] = res[0]?.code;
                setState(prev => ({
                    ...prev,
                    listArea: {
                        ...prev.listArea,
                        [nextArea]: res
                    }
                }));
            }
        });
    };

    const handleSelectAdministrative = (code, prevArea, nextArea) => {
        currentCode.current[prevArea] = code;
        apiAdministrative.getAdministrativeByCode({code}, (err, res) => {
            if (res) {
                if (state.village) {
                    currentCode.current.village = res[0]?.code;
                }
                setState(prev => ({
                    ...prev,
                    listArea: {
                        ...prev.listArea,
                        [nextArea]: res
                    }
                }));
            }
        });
    };

    const getParentCode = () => {
        const administrative = user?.administrativeCode ?? "";
        if (administrative?.parent?.parent?.parent) {
            currentCode.current.village = administrative.parent.parent.parent.code;
            return administrative.parent.parent;
        } else if (administrative?.parent?.parent) {
            currentCode.current.wards = administrative.parent.parent.code;
            return administrative.parent.parent;
        } else if (administrative?.parent) {
            currentCode.current.district = administrative.parent.code;
            return administrative.parent;
        } else {
            currentCode.current.province = administrative.code;
            return administrative;
        }
    };

    const listDataRender = [
        {
            title: 'Tỉnh/Thành phố',
            key: 'province',
            checked: state.province,
            onClickCheckbox: null,
            disabledCheckbox: false,
            disabledSelect: !state.province
        },
        {
            title: 'Quận/Huyện',
            key: 'district',
            checked: state.district,
            disabledCheckbox: state.wards || state.listArea.province.length === 0,
            disabledSelect: !state.district || state.wards || state.listArea.district.length === 0,
            onChangeSelect: (e) => {
                handleSelectAdministrative(e.target.value, 'district', 'wards');
            },
            onClickCheckbox: () => {
                if (state.district) {
                    setSelectedTypeNameAd('province');
                    currentCode.current.district = '';
                } else {
                    setSelectedTypeNameAd('district');
                    handleCheckedAdministrative(currentCode.current.province, 'district');
                }
                setState(prev => ({
                    ...prev,
                    listArea: {
                        ...prev.listArea,
                        district: state.district ? [] : state.listArea.district
                    },
                    district: !state.district
                }));
            }
        },
        {
            title: 'Phường/Xã/Thị trấn',
            key: 'wards',
            checked: state.wards,
            disabledCheckbox: !state.district || state.village || state.listArea.district.length === 0,
            disabledSelect: !state.wards || !state.district || state.village || state.listArea.wards.length === 0,
            onChangeSelect: (e) => {
                handleSelectAdministrative(e.target.value, 'wards', 'village');
            },
            onClickCheckbox: () => {
                if (state.wards) {
                    currentCode.current.wards = '';
                    setSelectedTypeNameAd('district');
                } else {
                    setSelectedTypeNameAd('wards');
                    handleCheckedAdministrative(currentCode.current.district, 'wards');
                }
                setState(prev => ({
                    ...prev,
                    listArea: {
                        ...prev.listArea,
                        wards: state.wards ? [] : state.listArea.wards
                    },
                    wards: !state.wards
                }));
            }
        },
        {
            title: 'Làng/Xóm/Khu dân cư/Tổ',
            key: 'village',
            checked: state.village,
            disabledCheckbox: !state.wards || state.listArea.wards.length === 0,
            disabledSelect: !state.village || state.listArea.village.length === 0,
            onChangeSelect: (e) => {
                currentCode.current.village = e.target.value;
            },
            onClickCheckbox: () => {
                if (state.village) {
                    currentCode.current.village = '';
                    setSelectedTypeNameAd('wards');
                } else {
                    setSelectedTypeNameAd('village');
                    handleCheckedAdministrative(currentCode.current.wards, 'village');
                }
                setState(prev => ({
                    ...prev,
                    listArea: {
                        ...prev.listArea,
                        village: state.village ? [] : state.listArea.village
                    },
                    village: !state.village
                }));
            }
        }
    ];

    useEffect(() => {
        setState(prev => ({
            ...prev,
            listArea: {
                ...prev.listArea,
                province: [getParentCode()]
            }
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {
                listDataRender.map(({
                                        title,
                                        key,
                                        checked,
                                        disabledCheckbox,
                                        disabledSelect,
                                        onChangeSelect,
                                        onClickCheckbox
                                    }, i) => (
                    <Col md={6} className="mb-2" key={i}>
                        <Checkbox
                            checked={checked}
                            className="mb-2"
                            disabled={disabledCheckbox}
                            onClick={onClickCheckbox}
                        >
                            {title}
                        </Checkbox>
                        <Input
                            type="select"
                            onChange={onChangeSelect}
                            disabled={disabledSelect}
                        >
                            {
                                state.listArea[key].length === 0 &&
                                <option value="">Chưa chọn</option>
                            }
                            {
                                (state[key] ? state.listArea[key] : []).map(({nameWithType, code}, idx) => (
                                    <option value={code} key={idx}>
                                        {nameWithType}
                                    </option>
                                ))
                            }
                        </Input>
                    </Col>
                ))
            }
        </>
    );
};

export default SelectAddressComponent;