import moment from "moment";

const _strFormat = {
    "-dmy": "DD-MM-YYYY",
    "-ymd": "YYYY-MM-DD",
    "/dmy": "DD/MM/YYYY",
    "/ymd": "YYYY/MM/DD",

    "-dmy Hms": "DD-MM-YYYY HH:mm:ss",
    "-ymd Hms": "YYYY-MM-DD HH:mm:ss",
    "/dmy Hms": "DD/MM/YYYY HH:mm:ss",
    "/ymd Hms": "YYYY/MM/DD HH:mm:ss",

    "-dmy hms": "DD-MM-YYYY hh:mm:ss",
    "-ymd hms": "YYYY-MM-DD hh:mm:ss",
    "/dmy hms": "DD/MM/YYYY hh:mm:ss",
    "/ymd hms": "YYYY/MM/DD hh:mm:ss",
};

const format = (input, inFormat = "-ymd", outFormat = "/dmy") => {
    try {
        if (typeof (input) !== "string") {
            return "Invalid date";
        }

        if (input === "") {
            return "--/--/----";
        }

        if(!Object.keys(_strFormat).includes(inFormat) || !Object.keys(_strFormat).includes(outFormat)) {
            return "Invalid format date";
        }

        return moment(this, _strFormat[inFormat]).format(_strFormat[outFormat]);

    } catch (e) {
        return "--/--/----";
    }
};

const isExpired = (input, inFormat = "-ymd") => {
    if(typeof (input) !== "string") {
        return false;
    }
    if(input === "") {
        return false;
    }

    if(!Object.keys(_strFormat).includes(inFormat)) {
        return "Invalid format date";
    }

    input = moment(input, _strFormat[inFormat]);
    input.set("hours", 23);
    input.set("minutes", 59);
    input.set("seconds", 59);
    let now = moment();
    now.set("hours", 0);
    now.set("minutes", 0);
    now.set("seconds", 0);

    return input.diff(now) < 0;
};

export const formatSecToTime = (secs) => {
    const secNum = Math.round(secs);
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;
    const seconds = Math.floor(secNum % 60);
    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        // .filter((v, i) => v !== "00" || i > 0)
        .join(":");
};

const formatDateSendBackend = (input, outFormat = "-ymd") => {
    if (input) {
        return moment(input).format(_strFormat[outFormat]);
    }
    return moment().format(_strFormat[outFormat]);
};

export default {
    format,
    isExpired,
    formatDateSendBackend
};
