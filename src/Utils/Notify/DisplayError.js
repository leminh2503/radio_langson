import {store} from "../../Redux/Store/index";

import Notify      from "./Notify";
import {userClear} from "../../Redux/Actions/userAction";
import {appClear}  from "../../Redux/Actions/appActions";
import {
    does_not_exist,
    invalid,
    max_length,
    message as _errorMessage,
    min_length,
    specialKey,
    TOKEN_EXPIRATION_CODE,
    unique,
    SRC_MESSAGE
}                  from "./ErrorMessage";

const _listKey = Object.keys(_errorMessage);
const _srcKey = Object.keys(SRC_MESSAGE)

function findSameKey(key) {
    if (key) {
        let findKey = _listKey.find(dt => dt === key);
        if (findKey === undefined) {
            findKey = _listKey.find(dt => dt.includes(key));
        }
        return findKey;
    }
    return null;
}

const getSpecialObjMessage = (key) => {
    switch (key) {
        case 'invalid':
            return invalid;
        case 'max_length':
            return max_length;
        case 'min_length':
            return min_length;
        case 'does_not_exist':
            return does_not_exist;
        default:
            return unique;
    }
};

const displaySpecialError = (key, error) => {
    const errorMessage = error.response.data.errorMessage ?? {};
    const specialObjMessage = getSpecialObjMessage(key);
    for (const m in errorMessage) {
        if (Object.keys(specialObjMessage).includes(m)) {
            return Notify.error(specialObjMessage[m]);
        } else {
            return Notify.error(`Lỗi ${key} trường "${m}" chưa dịch`);
        }
    }
};

export default function displayError(error, options = {notFound: false}) {
    if (options.notFound) return;
    if (error.message === "Network Error") {
        return Notify.error("Không kết nối được tới máy chủ dữ liệu, vui lòng kiểm tra lại mạng và tải lại trang web");
    }
    if (error.response) {
        // Text to speech
        if (error.response.data?.code === 'expired' && error.response.data?.mess && error.response.data?.status === 'error') {
            return Notify.error("Gói đăng ký hiện tại đã hết hạn sử dụng");
        } else if (error.response.data?.status === 'error') {
            return Notify.error("Vui lòng kiểm tra lại service tạo Audio từ text (hạn sử dụng, quyền sử dụng,...)");
        }
        if (error.response.status === 500) {
            return Notify.error("Máy chủ dữ liệu gặp sự cố, vui lòng báo lại kỹ thuật viên");
        } else if (error.response.data.errorCode) {
            let key = findSameKey(error.response.data.errorCode.split(".")[0]);
            let keySrc = ""
            if(key === 'CALENDAR021S') {
                return Notify.error(`${error.response.data.errorMessage}`)
            }
            let message = "";
            if (specialKey.includes(key)) {
                return displaySpecialError(key, error);
            }
            if (key === "USER2021" || key.includes(TOKEN_EXPIRATION_CODE)) {
                store.dispatch(userClear());
                store.dispatch(appClear());
                return;
            }
            if (key) {
                message = _errorMessage[key];
            } else {
                // if (error.response.status === 403) {
                //     return Notify.error('Tài khoản không có đủ quyền hạn thực hiện thao tác hoặc lấy dữ liệu');
                // } else if (error.response.status === 404) {
                //     return Notify.error("Không tìm thấy đường link gửi Request");
                // }
                message = `ErrorCode: ${error.response.data.errorCode}. ErrorMessage: ${error.response.data?.errorMessage ?? "không tìm thấy errorMessage"}`;
            }
            Notify.error(message, options);
        } else {
            Notify.error('Có lỗi xảy ra, vui lòng báo lại kỹ thuật viên');
        }
    } else {
        if (error) {
            Notify.error(error.toString());
        } else {
            Notify.error("Somethings is wrong!");
        }
    }
}
