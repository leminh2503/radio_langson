import React from 'react';

import Analytics from "./Analytics";

const Dashboard = React.memo(() => {
    return (
        <div className="dashboard">
            <Analytics/>
        </div>
    );
});

export default Dashboard;