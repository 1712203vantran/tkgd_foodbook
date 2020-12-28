function parseDateMonth(date, seperator = "-") {
    return [("0" + date.getDate()).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2)].join(seperator);
}
function parseDateTime(date, seperator) {
    return [("0" + date.getDate()).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join(seperator) + ' ' + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2)].join(':');
};
module.exports = {
    parseDateMonth,
    parseDateTime
}