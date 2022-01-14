import React from 'react';
import propTypes from "prop-types";

const AuthLayout = React.memo(({ children }) => {
    return (
        <div>
            {children}
        </div>
    );
});

AuthLayout.propTypes = {
    children: propTypes.any.isRequired
};

export default AuthLayout;
