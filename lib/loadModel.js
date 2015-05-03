'use strict';

var moment = require('moment');
var _ = require('underscore');

var internal = exports.internal = {};

var loads = internal.loads = [];

var createValidationError = function (message, path, value) {
    return {
        message: message,
        path: path,
        value: value
    };
};

var isPercentageNumber = function(num) {
    return typeof num === 'number' && num >= 0 && num <= 100;
};

var validate = function (load) {
    var result = {};
    result.errors = [];

    if (!load) {
        result.errors.push(createValidationError("Invalid load"));
    }
    else {
        if (typeof load.serverName !== 'string' || load.serverName.trim().length === 0) {
            result.errors.push(createValidationError("Invalid serverName", 'serverName', load.serverName));
        }

        if(!isPercentageNumber(load.cpu)) {
            result.errors.push(createValidationError("Invalid cpu", 'cpu', load.cpu));
        }

        if(!isPercentageNumber(load.ram)) {
            result.errors.push(createValidationError("Invalid ram", 'ram', load.ram));
        }
    }

    // done validating
    result.valid = result.errors.length === 0;
    return result;
};

var addLoad = function (load) {
    load.dateTime = new Date();
    load.serverName = load.serverName.trim();
    loads.push(load);
};

var getCombineCPU = function(memo, load) {
    return memo + load.cpu;
};

var getCombineRAM = function(memo, load) {
    return memo + load.ram;
};

var getAvgValues = function(loadArray) {
    return {
        avgCPU: _.reduce(loadArray, getCombineCPU, 0) / loadArray.length,
        avgRAM: _.reduce(loadArray, getCombineRAM, 0) / loadArray.length
    };
};

var getAvgLoadValues = function(serverLoads, startMoment, durationInMinutes, numMinutesForGroupBy) {
    var minTime = startMoment.clone().subtract(durationInMinutes, 'minutes');
    var loadsLastPeriod = _.filter(serverLoads, function(load) {
        return moment(load.dateTime).isBetween(minTime, startMoment);
    });

    var breakDown = _.groupBy(loadsLastPeriod, function(load) {
        var diffMilliseconds = startMoment - load.dateTime;
        return Math.ceil(diffMilliseconds / (numMinutesForGroupBy * 60000));
    });

    var result = {};
    _.each(breakDown, function(loadArray, key) {
        result[key] = getAvgValues(loadArray);
    });

    return result;
};

var getReport = function(serverName, callback) {
    var now = moment();
    var report = {
        serverName: serverName,
        avgLast60Minutes: {},
        avgLast24Hours: {}
    };

    var serverLoads = _.filter(loads, function(load) {
        return serverName.toLowerCase() === load.serverName;
    });

    if (!serverLoads || serverLoads.length === 0) {
        callback(report);
        return;
    }

    // try to do this asynchronously to accommodate more requests
    setImmediate(function() {
        report.avgLast60Minutes = getAvgLoadValues(serverLoads, now, 60, 1);
        setImmediate(function() {
            report.avgLast24Hours = getAvgLoadValues(serverLoads, now, 1440, 60);

            callback(report);
        });
    });
};

exports.validate = validate;
exports.addLoad = addLoad;
exports.getReport = getReport;