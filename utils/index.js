const Utils = {
    validateDate: function (variable) {
        var validation_string = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;
        if (!validation_string.test(String(variable))) {
            return false;
        }
        return true;
    },
    validateYearMonth: function (variable) {
        return /^\d{4}-\d{2}$/.test(variable);
    },
    millisecondsToHours: function (milliseconds) {
        return milliseconds / (3600 * 1000);
    },
    hoursToMilliseconds: function (hours) {
        return hours * 60 * 60 * 1000;
    },
    iso8601ToMilliseconds: function (duration) {
        const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
        const matches = duration.match(regex);

        const hours = matches[1] ? parseInt(matches[1]) : 0;
        const minutes = matches[2] ? parseInt(matches[2]) : 0;
        const seconds = matches[3] ? parseInt(matches[3]) : 0;

        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    },
    millisecondsToIso8601: function (milliseconds) {
        let seconds = milliseconds / 1000;
        if (seconds === 0) {
            return "PT0S";
        }
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let remainingSeconds = Math.round(seconds % 60);
        if (remainingSeconds === 60) {
            remainingSeconds = 0;
            minutes += 1;
        }
        if (minutes === 60) {
            minutes = 0;
            hours += 1;
        }
        return `PT${hours ? hours + "H" : ""}${minutes ? minutes + "M" : ""}${remainingSeconds ? remainingSeconds + "S" : ""}`;
    }
};

module.exports = Utils;
