import _ from "lodash";

import DateTime from "./DateTime/DateTime";

export function isEmpty(value) {

    if(_.isObject(value)) {
        if(Object.keys(value).length === 0) return true;
    }

    if(_.isArray(value)) {
        if(value.length === 0) return true;
    }

    if(value === "") {
        return true;
    }

    return (
        // _.isEmpty(value) ||
        _.isNull(value) ||
        _.isUndefined(value)
    )
}

export function deepCompareObj(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
}

export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const checkIsBottomScrollDown = (element) => {
    if (!element) return;
    const {scrollHeight, scrollTop, clientHeight} = element;
    const threshold = 100;
    /* Cuộn chuột thì (scrollHeight - scrollTop) giảm dần cho đến khi nhỏ hơn khung 
    đang cuộn + thêm giá trị threshold (tức là vị trí trước khi xuống dưới cùng)
     */
    return scrollHeight - scrollTop <= clientHeight + threshold;
};

export default {
    isEmpty,
    deepCompareObj,
    DateTime,
    isMobileDevice
};


