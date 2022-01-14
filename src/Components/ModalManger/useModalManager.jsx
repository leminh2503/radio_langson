import React from "react";

const useModalManager = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    const handleOpen = React.useCallback(() => {
        setIsVisible(true);
    }, []);

    const handleClose = React.useCallback(() => {
        setIsVisible(false);
    }, []);

    return [isVisible, setIsVisible, handleOpen, handleClose];

};

export default useModalManager;
