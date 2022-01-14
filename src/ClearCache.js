import React, {useEffect, useState} from "react";
import moment                       from "moment";

import packageJson from "../package.json";

const buildDateGreaterThan = (latestDate, currentDate) => {
    const momLatestDateTime = moment(latestDate);
    const momCurrentDateTime = moment(currentDate);
    return momLatestDateTime.isAfter(momCurrentDateTime);
};

function withClearCache(Component) {
    function ClearCacheComponent(props) {
        const [isLatestBuildDate, setIsLatestBuildDate] = useState(false);

        useEffect(() => {
            fetch("/meta.json")
                .then((response) => response.json())
                .then((meta) => {
                    const latestVersionDate = meta.buildDate;
                    const currentVersionDate = packageJson.buildDate;

                    const shouldForceRefresh = buildDateGreaterThan(
                        latestVersionDate,
                        currentVersionDate
                    );
                    if (shouldForceRefresh) {
                        setIsLatestBuildDate(false);
                        refreshCacheAndReload();
                    } else {
                        setIsLatestBuildDate(true);
                    }
                });
        }, []);

        const refreshCacheAndReload = () => {
            if (caches) {
                // Service worker cache should be cleared with caches.delete()
                caches.keys().then((names) => {
                    for (const name of names) {
                        caches.delete(name);
                    }
                });
            }
            // delete browser cache and hard reload
            window.location.reload(true);
        };

        return isLatestBuildDate ? <Component {...props} /> : null;
    }

    return ClearCacheComponent;
}

export default withClearCache;