import React     from 'react';
import propTypes from 'prop-types';

const AlertValid = React.memo(({message, classNames}) => {
    return (
        <div className={`alert-valid ${classNames ?? ""}`}>
            <i>* {message}</i>
        </div>
    );
});

AlertValid.defaultProps = {
    message: 'Đây là cảnh báo'
};

AlertValid.propTypes = {
    message: propTypes.string.isRequired
};

export default AlertValid;