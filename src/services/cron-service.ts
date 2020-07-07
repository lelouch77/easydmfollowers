export const scheduleCron = (dateTime: Date, job: Function) => {
    const delay = dateTime.getTime() - (new Date()).getTime();
    return setTimeout(job, delay);
}