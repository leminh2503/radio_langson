import moment from "moment";

export function convertSchedule(schedule) {
    const newListSchedule = [];
    let dateNow;

    schedule.forEach((item) => {
        newListSchedule.push({
            ...item,
            subject: item?.title,
            startTime: moment(item?.datetimeStart, "DD/MM/YYYY HH:mm:ss").toDate(),
            endTime: moment(item.datetimeEnd, "DD/MM/YYYY HH:mm:ss").toDate(),
            ownerId: item?.status
            // fileId: item?.fileId
        });
    });
    return newListSchedule;
}