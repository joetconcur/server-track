'use strict';

var mock = require('mock');
var assert = require('chai').assert;
var moment = require('moment');

describe('loadModel', function() {
    var loadModel, loadSample;

    beforeEach(function () {
        loadModel = mock('../lib/loadModel', {}, require);

        loadSample = {
            serverName: "server1",
            cpu: 10,
            ram: 5
        };
    });

    describe('#validate', function() {
        it('should return invalid result when the load\'s serverName is just spaces', function() {
            loadSample.serverName = '     ';
            var result = loadModel.validate(loadSample);
            assert.isFalse(result.valid);
        });

        it('should return invalid result when the load\'s serverName is missing', function() {
            delete loadSample.serverName;
            var result = loadModel.validate(loadSample);
            assert.isFalse(result.valid);
        });

        it('should return valid result when the load\'s serverName has only one character', function() {
            loadSample.serverName = "  a  ";
            var result = loadModel.validate(loadSample);
            assert.isTrue(result.valid);
        });

        it('should return invalid result when the load\'s cpu is missing', function() {
            delete loadSample.cpu;
            var result = loadModel.validate(loadSample);
            assert.isFalse(result.valid);
        });

        it('should return invalid result when the load\'s ram is missing', function() {
            delete loadSample.ram;
            var result = loadModel.validate(loadSample);
            assert.isFalse(result.valid);
        });

        it('should return invalid result when the load\'s cpu is negative', function() {
            loadSample.cpu = -1;
            var result = loadModel.validate(loadSample);
            assert.isFalse(result.valid);
        });

        it('should return invalid result when the load\'s ram is more than 100', function() {
            loadSample.ram = 101;
            var result = loadModel.validate(loadSample);
            assert.isFalse(result.valid);
        });

        it('should return valid result when the load is valid', function() {
            var result = loadModel.validate(loadSample);
            assert.isTrue(result.valid);
        });

        it('should return valid result when the load\'s cpu is 0', function() {
            loadSample.cpu = 0;
            var result = loadModel.validate(loadSample);
            assert.isTrue(result.valid);
        });

        it('should return valid result when the load\'s ram is 0', function() {
            loadSample.ram = 0;
            var result = loadModel.validate(loadSample);
            assert.isTrue(result.valid);
        });

        it('should return valid result when the load\'s cpu is 100', function() {
            loadSample.cpu = 100;
            var result = loadModel.validate(loadSample);
            assert.isTrue(result.valid);
        });

        it('should return valid result when the load\'s ram is 100', function() {
            loadSample.ram = 100;
            var result = loadModel.validate(loadSample);
            assert.isTrue(result.valid);
        });
    });

    describe('#addLoad', function() {
        it('should increment internal.load array when adding a load', function() {
            assert.strictEqual(loadModel.internal.loads.length, 0);
            loadModel.addLoad(loadSample);
            assert.strictEqual(loadModel.internal.loads.length, 1);
        });
    });

    describe('#getReport', function() {
        it('should return report with empty avg values when the the loads array is empty', function(done) {
            loadModel.getReport('server1', function(report) {
                assert.strictEqual(Object.keys(report.avgLast60Minutes).length, 0);
                assert.strictEqual(Object.keys(report.avgLast24Hours).length, 0);
                done();
            });
        });

        it('should return report with "1" groups when querying the server just added 1 ms ago', function(done) {
            loadModel.addLoad(loadSample);
            setTimeout(function(){
                loadModel.getReport('server1', function(report) {
                    assert.strictEqual(Object.keys(report.avgLast60Minutes).length, 1);
                    assert.strictEqual(Object.keys(report.avgLast24Hours).length, 1);
                    assert.isNumber(report.avgLast60Minutes["1"].avgCPU);
                    assert.isNumber(report.avgLast60Minutes["1"].avgRAM);
                    assert.isNumber(report.avgLast24Hours["1"].avgCPU);
                    assert.isNumber(report.avgLast24Hours["1"].avgRAM);
                    done();
                });
            }, 1);
        });

        it('should return report with empty avg values when server being queried is not yet added', function(done) {
            loadModel.addLoad(loadSample);
            setTimeout(function(){
                loadModel.getReport('server2', function(report) {
                    assert.strictEqual(Object.keys(report.avgLast60Minutes).length, 0);
                    assert.strictEqual(Object.keys(report.avgLast24Hours).length, 0);
                    done();
                });
            }, 1);
        });

        it('should return correct avg values', function(done) {
            loadModel.addLoad({
                serverName: "server1",
                cpu: 10,
                ram: 5
            });
            loadModel.addLoad({
                serverName: "server1",
                cpu: 20,
                ram: 10
            });
            loadModel.addLoad({
                serverName: "server1",
                cpu: 30,
                ram: 15
            });
            loadModel.addLoad({
                serverName: "server1",
                cpu: 40,
                ram: 20
            });
            setTimeout(function(){
                loadModel.getReport('server1', function(report) {
                    assert.strictEqual(Object.keys(report.avgLast60Minutes).length, 1);
                    assert.strictEqual(Object.keys(report.avgLast24Hours).length, 1);
                    assert.strictEqual(report.avgLast60Minutes["1"].avgCPU, (10 + 20 + 30 + 40) / 4);
                    assert.strictEqual(report.avgLast60Minutes["1"].avgRAM, (5 + 10 + 15 + 20) / 4);
                    assert.strictEqual(report.avgLast24Hours["1"].avgCPU, (10 + 20 + 30 + 40) / 4);
                    assert.strictEqual(report.avgLast24Hours["1"].avgRAM, (5 + 10 + 15 + 20) / 4);
                    done();
                });
            }, 1);
        });

        it('should return correct grouping in avg values for the last 60 minutes', function(done) {
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 10,
                ram: 20,
                dateTime: moment()._d
            });
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 20,
                ram: 30,
                dateTime: moment().subtract(30, 'seconds')._d
            });
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 30,
                ram: 40,
                dateTime: moment().subtract(80, 'seconds')._d
            });
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 40,
                ram: 50,
                dateTime: moment().subtract(100, 'seconds')._d
            });
            setTimeout(function(){
                loadModel.getReport('server1', function(report) {
                    assert.strictEqual(Object.keys(report.avgLast60Minutes).length, 2);
                    assert.strictEqual(report.avgLast60Minutes["1"].avgCPU, (10 + 20) / 2);
                    assert.strictEqual(report.avgLast60Minutes["1"].avgRAM, (20 + 30) / 2);
                    assert.strictEqual(report.avgLast60Minutes["2"].avgCPU, (30 + 40) / 2);
                    assert.strictEqual(report.avgLast60Minutes["2"].avgRAM, (40 + 50) / 2);

                    assert.strictEqual(Object.keys(report.avgLast24Hours).length, 1);
                    assert.strictEqual(report.avgLast24Hours["1"].avgCPU, (10 + 20 + 30 + 40) / 4);
                    assert.strictEqual(report.avgLast24Hours["1"].avgRAM, (20 + 30 + 40 + 50) / 4);

                    done();
                });
            }, 1);
        });

        it('should return correct grouping in avg values for the last 24 hours', function(done) {
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 10,
                ram: 20,
                dateTime: moment()._d
            });
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 20,
                ram: 30,
                dateTime: moment().subtract(61, 'minutes')._d
            });
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 30,
                ram: 40,
                dateTime: moment().subtract(80, 'minutes')._d
            });
            loadModel.internal.loads.push({
                serverName: "server1",
                cpu: 40,
                ram: 50,
                dateTime: moment().subtract(100, 'minutes')._d
            });
            setTimeout(function(){
                loadModel.getReport('server1', function(report) {
                    assert.strictEqual(Object.keys(report.avgLast60Minutes).length, 1);
                    assert.strictEqual(report.avgLast60Minutes["1"].avgCPU, 10);
                    assert.strictEqual(report.avgLast60Minutes["1"].avgRAM, 20);

                    assert.strictEqual(Object.keys(report.avgLast24Hours).length, 2);
                    assert.strictEqual(report.avgLast24Hours["1"].avgCPU, 10);
                    assert.strictEqual(report.avgLast24Hours["1"].avgRAM, 20);
                    assert.strictEqual(report.avgLast24Hours["2"].avgCPU, (20 + 30 + 40) / 3);
                    assert.strictEqual(report.avgLast24Hours["2"].avgRAM, (30 + 40 + 50) / 3);

                    done();
                });
            }, 1);
        });
    });
});