//used to manually instrument the test server (not through a mocha test)
var fork = require('../fork.js');
var path = require('path');
var config = require('s3shield').config;

var testServerPath = path.join(__dirname, 'dummyServer.js');

var testServer = fork(testServerPath, process.cwd());

testServer.send({ method: 'init'});

setInterval(function () {
	testServer.send({ method: 'sendMessage', params: [ config.aws.bucket, 'test/1'] });
}, 100);