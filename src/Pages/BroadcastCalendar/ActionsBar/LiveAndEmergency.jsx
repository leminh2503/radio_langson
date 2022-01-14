import React             from 'react';
import {Button}          from "antd";
import {AudioOutlined}   from "@ant-design/icons";
import {useSelector}     from "react-redux";
import {faPhoneAlt}      from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const LiveAndEmergency = React.memo((props) => {
    const {handleOpenModalEmergency, handleOpenModalLive, isDefaultCalendar} = props;

    const user = useSelector(state => state.user);

    const userDivision = user?.administrativeCode?.division ?? "";

    return (
        <div className="grid-live-and-emergency">
            {
                userDivision !== 4 &&
                <>
                    <Button
                        className="row-all-center"
                        disabled={isDefaultCalendar}
                        onClick={handleOpenModalEmergency}
                        icon={<FontAwesomeIcon icon={faPhoneAlt} className="mr-1" color="red"/>}
                    >
                        Phát khẩn cấp
                    </Button>
                    <Button
                        disabled={isDefaultCalendar || userDivision === 1} // PROVINCE: Division = 1
                        onClick={handleOpenModalLive}
                        icon={<AudioOutlined/>}
                    >
                        Phát trực tiếp
                    </Button>
                </>
            }
        </div>
    );
});

export default LiveAndEmergency;
