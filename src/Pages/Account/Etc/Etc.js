const nameWithType = {
    "tinh": "Tỉnh",
    "thanh-pho": "Thành phố",
    "quan": "Quận",
    "huyen": "Huyện",
    "phuong": "Phường",
    "xa": "Xã",
    "thi-tran": "Thị trấn",
    "lang": "Làng",
    "xom": "Xóm",
    "kdc": "Khu dân cư",
    "to": "Tổ"
};

const listInputModalAccount = [
    {
        label: "Tài khoản",
        type: 'text',
        keyValue: "username",
        disabled: true,
        required: true,
        requiredValid: true,
        conditionValid: 120,
        typeValid: 'lte',
        messageValid: 'không được vượt quá 120 ký tự',
        placeholder: 'Tên tài khoản'
    },
    {
        label: "Email",
        type: 'email',
        keyValue: "email",
        disabled: true,
        required: true,
        placeholder: 'email@gmail.com'
    },
    {
        label: "Mật khẩu",
        type: 'password',
        keyValue: "password",
        disabled: true,
        required: true,
        visible: false,
        requiredValid: true,
        conditionValid: 6,
        typeValid: 'gte',
        messageValid: 'tối thiểu 6 ký tự',
        placeholder: 'Nhập mật khẩu'
    },
    {
        label: "Số điện thoại",
        type: 'number',
        keyValue: "phoneNumber",
        disabled: true,
        required: true,
        placeholder: 'Nhập số điện thoại'
    },
    {
        label: "Tên đầy đủ",
        type: 'text',
        keyValue: "fullName",
        required: true,
        requiredValid: true,
        conditionValid: 30,
        typeValid: 'lte',
        messageValid: 'không được vượt quá 30 ký tự',
        placeholder: 'Nguyễn Văn A'
    }
];

const listRoleForAdministrative = {
    province: [2, 3, 4],
    district: [5],
    wards: [6],
    village: [7]
};

export {
    listInputModalAccount,
    listRoleForAdministrative,
    nameWithType
};