import React, {useEffect, useState} from 'react';
import {useHistory}                 from "react-router-dom";

import Sidebar     from "./Sidebar";
import Main        from "./Main";
import SidebarBase from "../../Components/Layouts/Sidebar/SidebarBase";

const Account = React.memo(() => {
    const history = useHistory();

    const [isOpenPage, setIsOpenPage] = useState("info");

    useEffect(() => {
        const tab = history?.location?.state?.tab ?? "";
        if (tab) {
            history.replace();
            setIsOpenPage(tab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history]);

    return (
        <div className="account-management d-flex">
            <SidebarBase>
                <Sidebar
                    isOpenPage={isOpenPage}
                    setIsOpenPage={setIsOpenPage}
                />
            </SidebarBase>
            <Main isOpenPage={isOpenPage}/>
        </div>
    );
});

export default Account;
