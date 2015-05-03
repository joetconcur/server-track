'use strict';

var logger = require('./lib/logger');
var express = require('express');
var app = express();
var loadsRouter = require('./routes/loads').router;
var port = process.env.SERVER_TRACK_PORT || 8090;

// start app
app.use('/servertrack', loadsRouter);
app.listen(port);
logger.info('Server running on port ' + port);
