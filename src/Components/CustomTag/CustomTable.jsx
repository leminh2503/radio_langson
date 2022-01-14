import React     from 'react';
import {Table}   from "antd";
import propTypes from 'prop-types';

import logo from '../../Assets/icon/Radio.png';

const EmptyData = () => {
    return (
        <div>
            <img
                width='98px'
                height='88px'
                src={logo}
                alt={""}
                style={{filter: "grayscale(1)", opacity: "0.3", scale: '0.5'}}
            />
            <div className="mt-2" style={{fontSize: "12pt"}}>
                Không có dữ liệu
            </div>
        </div>
    );
};

const CustomTable = React.memo((props) => {
    const {
        rowKey,
        columns,
        data,
        className,
        size,
        scrollY,
        scrollX,
        summary,
        rowSelection,
        isLoading,
        pagination,
        tableIndex,
        hasSticky,
        bordered
    } = props;

    const _defaultPagination = {
        position: 'bottomRight',
        pageSize: 20,
        showSizeChanger: false,
        size: 'default',
        ...pagination
    };

    const sticky = {offsetScroll: 100};

    return (
        <Table
            {...props}
            sticky={hasSticky ? sticky : false}
            id={`custom-table${tableIndex}`}
            bordered={bordered}
            loading={isLoading}
            rowKey={rowKey}
            columns={columns}
            dataSource={data}
            className={`custom-table mt-2 ${className}`}
            size={size}
            summary={summary}
            scroll={{y: scrollY, x: scrollX}}
            pagination={pagination ? _defaultPagination : false}
            locale={{emptyText: <EmptyData/>}}
            rowSelection={rowSelection}
        />
    );
});

CustomTable.defaultProps = {
    rowKey: "id",
    scrollY: 720,
    size: "small",
    scrollX: 900,
    summary: null,
    isLoading: false,
    className: "",
    pagination: false,
    tableIndex: null,
    data: [],
    bordered: true
};

CustomTable.propTypes = {
    rowKey: propTypes.any,
    columns: propTypes.any.isRequired,
    data: propTypes.array,
    scrollY: propTypes.any,
    scrollX: propTypes.any,
    size: propTypes.oneOf(['small', "middle", 'large']),
    summary: propTypes.func,
    isLoading: propTypes.bool,
    className: propTypes.string,
    pagination: propTypes.any,
    tableIndex: propTypes.any,
    bordered: propTypes.bool
};

export default CustomTable;
