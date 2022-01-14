import React, {useCallback} from "react";

import ChangePasswordTab  from "./Tabs/6-ChangePasswordTab";
import AccountInformation from "./Tabs/1-AccountInformation";
import HistoryWork        from "./Tabs/3-HistoryWork";
import UserManagement     from "./Tabs/2-UserManagement";
import GeneralConfig      from "./Tabs/4-GeneralConfig";
import Administrative     from "./Tabs/5-Administrative";

const Main = React.memo(({isOpenPage}) => {
    const renderPage = useCallback(() => {
        switch (isOpenPage) {
            case "info":
                return <AccountInformation/>;
            case "user_management":
                return <UserManagement/>;
            case "history":
                return <HistoryWork/>;
            case "config":
                return <GeneralConfig/>;
            case "change_password":
                return <ChangePasswordTab/>;
            case "administrative":
                return <Administrative/>;
            default:
                return null;
        }
    }, [isOpenPage]);

    return (
        <div className='account-management_content'>
            {renderPage()}
        </div>
    );
});

export default Main;

