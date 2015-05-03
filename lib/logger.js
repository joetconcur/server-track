'use strict';

var winston = require('winston');

var logger = process.env.NODE_ENV === 'test' ?
    new winston.Logger() :
    new winston.Logger({transports: [
        new (winston.transports.Console)({timestamp: true, colorize: true}),
        new (winston.transports.File)({filename: 'error.log', level: 'error', timestamp: true})
]});

// https://gist.github.com/johndgiese/59bd96360ce411042294
// Extend a winston by making it expand errors when passed in as the
// second argument (the first argument is the log level).
var expandErrors = function (loggerParam) {
    var oldLogFunc = loggerParam.log;
    loggerParam.log = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        if (args.length >= 2 && args[1] instanceof Error) {
            args[1] = args[1].stack;
        }
        return oldLogFunc.apply(this, args);
    };
    return loggerParam;
};

logger = expandErrors(logger);

module.exports = logger;