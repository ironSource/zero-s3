//used to manually instrument the test server (not through a mocha test)
var fork = require('./fork');
var config = require('../lib/config.js');
var testServer = fork('testServer');

testServer.send({ method: 'init'});

setInterval(function () {
	testServer.send({ method: 'sendMessage', params: [ config.aws.bucket, 'test/1'] });
}, 100);