import React                          from "react";
import {Col, FormGroup, Input, Label} from "reactstrap";
import AlertValid                     from "../../../Components/CustomTag/AlertValid";

const CustomInput = React.memo(({
                                    label,
                                    type,
                                    keyValue,
                                    value,
                                    disabled,
                                    required,
                                    onChange,
                                    typeModal,
                                    visible,
                                    requiredValid,
                                    typeValid,
                                    conditionValid,
                                    messageValid,
                                    placeholder
                                }) => {
    if (typeModal === 'edit' && visible) {
        return (
            <Col md={12}>
                <FormGroup>
                    <Label
                        for={keyValue}
                        className={required ? 'account_required-item' : ''}
                    >
                        {label}
                    </Label>
                    <Input
                        disabled={disabled}
                        type={type}
                        value={value || ""}
                        onChange={(event) => onChange(event.target.value)}
                    />
                </FormGroup>
            </Col>);
    }

    if (typeModal === 'edit' && keyValue === 'password') {
        return null;
    }

    return (
        <Col md={12}>
            <FormGroup>
                <Label
                    for={keyValue}
                    className={required ? 'account_required-item' : ''}
                >
                    {label}
                </Label>
                <Input
                    placeholder={placeholder}
                    autoComplete="new-password"
                    disabled={disabled}
                    type={type}
                    value={value || ""}
                    onChange={(event) => onChange(event.target.value)}
                />
                {
                    (requiredValid && (typeValid === 'lte' ? value?.length > conditionValid : value?.length < conditionValid)) &&
                    <AlertValid
                        classNames="mt-2"
                        message={`${label} ${messageValid}`}
                    />
                }
            </FormGroup>
        </Col>
    );
});

CustomInput.defaultProps = {
    options: [],
    size: '100',
    value: "",
    required: false,
    disabled: false
};

export default CustomInput;