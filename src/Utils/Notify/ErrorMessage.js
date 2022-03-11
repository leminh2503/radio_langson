export const TOKEN_EXPIRATION_CODE = ["AUTH3002", "AUTH3010", "AUTH3011", "DEVICE101V"];

const AUTH_MESSAGE = {
    AUTH2011: 'Tài khoản đã tồn tại',
    AUTH2021: 'Sai tài khoản hoặc mật khẩu',
    AUTH3000: "Phát hiện lỗi xác thực, vui lòng đăng nhập lại",
    AUTH3001: "Phát hiện lỗi xác thực, vui lòng đăng nhập lại",
    AUTH3002: "Hết hạn phiên đăng nhập, vui lòng đăng nhập lại",
    AUTH3010: "Hết hạn phiên đăng nhập, vui lòng đăng nhập lại",
    AUTH3011: "Hết hạn phiên đăng nhập, vui lòng đăng nhập lại",
    AUTH4001: "Tài khoản không còn hiệu lực, vui lòng liên hệ quản trị viên"
};

const SRC_MESSAGE = {
    ValidatorInvalid: "Trình xác thực không hợp lệ",
    IntegrityError: "Tên file đã tồn tại"
}

const ADMINISTRATIVE_MESSAGE = {
    AD011M: "Không thể xóa địa phương vì đang tồn tại địa phương con"
}

const ADTIVE_MESSAGE = {
    ADTIVE021V: "Tạo đơn vị không đúng cấp"
};

const USER_MESSAGE = {
    USER001P: 'Tài khoản không có quyển thực hiện thao tác',
    USER001A: 'Quyền đã chọn không phù hợp',
    USER011M: "Vị trí công việc không phù hợp với Đơn vị đang làm việc",
    USER012S: 'Tài khoản đang bị khóa',
    USER0811A: 'Số điện thoại  đã tồn tại',
    USER0812A: 'Email đã tồn tại',
    USER0821A: 'Không đúng định dạng SĐT',
    USER0822A: 'Không đúng định dạng Email',
    USER084A: 'Mã OTP không chính xác',
    USER104A: 'Mật khẩu hiện tại không đúng',
    USER1101: "Mật khẩu hiện tại không được để trống",
    USER111A: 'Email hoặc số điện thoại không chính xác',
    USER1102: "Mật khẩu mới không được để trống",
    USER1103: "Độ dài mật khẩu cần ít nhất 6 kí tự",
    USER121A: "Vui lòng chọn đúng cơ sở làm việc",
    USER2010: "Không tìm thấy Email",
    USER2011: "Sai tài khoản hoặc mật khẩu",
    USER2021: "Hết hạn phiên đăng nhập, vui lòng đăng nhập lại"
};

const PERM_MESSAGE = {
    PERM011: "Tài khoản không có quyển thực hiện thao tác",
    PERM013: "Tài khoản không có quyển thực hiện thao tác",
    PERM015: "Tài khoản không có quyển thực hiện thao tác",
    PERM016: "Tài khoản không có quyển thực hiện thao tác",
    PERM018: "Không thể thao tác trên thiết bị không thuộc đơn vị làm việc"
};

const CONFIRM_MESSAGE = {
    CONFIRM001P: 'Tài khoản không thuộc khu vực đang chọn',
    CONFIRM012A: 'Không có chương trình nào để yêu cầu xác nhận lịch',
    CONFIRM051P: 'Lịch chưa được xác nhận',
    CONFIRM082P: 'Không có chương trình chờ duyệt nào trong lịch',
    CONFIRM091P: 'Tài khoản không đủ quyền thực hiện thao tác này'
};

const CALENDAR_MESSAGE = {
    CALENDAR011S: "Đơn vị đã tồn tại trong một lịch khác",
    CALENDAR601A: "Không thể xóa lịch đã có chương trình",
    CALENDAR021S: 'Ngày lặp lịch không phù hợp, đã có chương trình trong lịch',
};

const SOURCE_STREAM_MESSAGE = {
    SOURCESTREAM001V: 'Chưa chọn đài'
};

const SCHEDULE_MESSAGE = {
    SCHEDULE001P: 'Không thể thao tác do không đúng địa phương làm việc',
    SCHEDULE002A: 'Đang có chương trình phát',
    SCHEDULE011A: 'Lịch không tồn tại',
    SCHEDULE011S: 'Khung giờ đã có chương trình',
    SCHEDULE012S: 'Khung giờ chọn đã có chương trình của cấp dưới',
    SCHEDULE011P: 'Thao tác bị từ chối do không đúng trạng thái của lịch',
    SCHEDULE071P: 'Không thể kết thúc, vui lòng kiểm tra lại trạng thái chương trình',
    SCHEDULE072P: 'Chỉ có người tạo mới có thể thao tác',
    SCHEDULE102V: 'Thời gian bắt đầu, kết thúc không phù hợp',
    SCHEDULE111V: 'Thời gian bắt đầu, kết thúc không phù hợp',
    SCHEDULE002P: 'Lịch đang tạm khóa',
    SCHEDULE080: 'Có quá nhiều chương trình đang trực tiếp',
    SCHEDULE044P: 'Không thể sửa chương trình đã phát sóng',
};

const VALID_MESSAGE = {
    VALID1011: 'Số diện thoại không đúng định dạng'
};

const FILE_FOLDER_MESSAGE = {
    FILE001A: 'Không thể sửa tên thư mục không thuộc cơ sở đang làm việc',
    FILE001P: 'Số lượng file upload mỗi tháng đã tới giới hạn',
    FILE001V: 'Tệp không được hỗ trợ',
    FILE002P: 'Không thể thao tác do không đúng địa phương làm việc',

    // FOLDER
    FOLDER001P: 'Số lượng folder tạo mới mỗi tháng đã tới giới hạn'
};

const PROTECT_MESSAGE = {
    PROTECT_AdministrativeTree_Administrative: 'Không thể xóa, địa phương đã được sử dụng để tạo lịch phát',
    PROTECT_SourceStream_File: 'Không thể xóa file đã được sử dụng để tạo chương trình phát',
    PROTECT_HistoryAction_Administrative: 'Không thể xóa, địa phương đã được lưu lịch sử hoạt động',
    PROTECT_SourceStream_Channel: 'Không thể xóa, Kênh tiếp sóng đã đi vào hoạt động',
};

const DEVICE_MESSAGE = {
    DEVICE011M: 'Không thể xóa địa phương đã có thiết bị',
    DEVICE101V: 'Chức năng này chưa được hoàn thiện'
};

const OTHERS_MESSAGE = {
    'invalid': "Dữ liệu không hợp lệ",
    'throttled': "Vượt quá số lần trao đổi dữ liệu với máy chủ",
    'method_not_allowed': "Giao thức hiện tại không hỗ trợ",
    'default_code.PermissionDenied': 'Tài khoản không có quyền thực hiện thao tác này',
    'min_length': 'Không đủ độ dài tối thiểu',
    'max_length': 'Vượt quá độ dài quy định',
    'max_value': 'Giá trị vừa nhập lớn hơn mức cho phép',
    'min_value': 'Giá trị vừa nhập nhỏ hơn mức cho phép',
    'unique': 'Đã tồn tại dữ liệu',
    'invalid_choice': 'Dữ liệu lựa chọn không phù hợp',
    'incorrect_type': 'Dữ liệu không hợp lệ',
    'null.ValidatorInvalid': 'Các trường dữ liệu không được để trống',
    'does_not_exist': 'Không tìm thấy dữ liệu',
    'not_authenticated': 'Xác thực không hợp lệ',
    'min_date_value': 'Khoảng thời gian không đúng',
    'src': "Tên file đã tồn tại"
};

const message = {
    ...AUTH_MESSAGE,
    ...ADMINISTRATIVE_MESSAGE,
    ...ADTIVE_MESSAGE,
    ...USER_MESSAGE,
    ...PERM_MESSAGE,
    ...CONFIRM_MESSAGE,
    ...CALENDAR_MESSAGE,
    ...SOURCE_STREAM_MESSAGE,
    ...SCHEDULE_MESSAGE,
    ...VALID_MESSAGE,
    ...FILE_FOLDER_MESSAGE,
    ...PROTECT_MESSAGE,
    ...DEVICE_MESSAGE,
    ...OTHERS_MESSAGE,
    ...SRC_MESSAGE
};

const unique = {
    phoneNumber: 'Số điện thoại đã tồn tại',
    nonFieldError: 'Đã tồn tại file',
    nonFieldErrors: 'Đã tồn tại thư mục',
    mac: 'Mã thiết bị trùng',
    email: 'Địa chỉ email đã tồn tại'
};

const min_length = {
    username: 'Tài khoản cần tối thiểu nhất 5 ký tự'
};

const max_length = {};

const invalid = {
    email: 'Định dạng email không chính xác',
    duration: 'Không xác định được thời lượng của file, file tải lên có thể không đúng định dạng, hãy kểm tra lại'
};

const does_not_exist = {
    broadcastCalendar: 'Lịch đang khóa không thể tạo chương trình'
};

const specialKey = ['unique', 'min_length', 'max_length', 'invalid', 'does_not_exist'];

export {
    max_length,
    message,
    min_length,
    unique,
    specialKey,
    invalid,
    does_not_exist,
    SRC_MESSAGE
};
