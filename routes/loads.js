'use strict';

var express = require('express');
var router = express.Router();
var logger = require('../lib/logger');
var _ = require('underscore');
var bodyParser = require('body-parser');
var loadModel = require('../lib/loadModel');

exports.router = router;

// logging middleware
router.use(function (req, res, next) {
    logger.info(req.method + ' request from ' + req.url);
    next();
});

router.use(bodyParser.json());
router.use(function (err, req, res, next) {
    //json error
    logger.error(err);
    res.status(400).send({message: 'Invalid request format'});
});

// route for recording load
router.post('/loads', function(req, res){
    var load = req.body;

    // validate the load
    var result = loadModel.validate(load);
    if (!result.valid) {
        res.status(400).send({validationError: result.errors});
        return;
    }

    // save the load
    loadModel.addLoad(load);

    // return the response
    res.json({message: 'success'});
});

// route for displaying load
router.get('/loads/:server_name', function(req, res) {
    var serverName = req.params.server_name;

    loadModel.getReport(serverName, function(err, report) {
        if(err) {
            logger.error(err);
            res.status(500).send({message: 'Internal error.'});
            return;
        }

        // return the response
        res.json(report);
    });
});
