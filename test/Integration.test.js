var config = require('../lib/config.js');
var child = require('child_process');
var path = require('path');
var Messaging = require('forkraft').Messaging;

var workerPath = path.resolve(__dirname, '..', 'worker.js');
var testServerPath = path.join(__dirname, 'testServer.js');

console.log(workerPath, testServerPath);
var testFunction = describe;

if (config.aws.accessKeyId === undefined || config.aws.secretAccessKey === undefined) {

	testFunction = describe.skip;
	console.warn('skipping integration test because no aws credentials were supplied');
}

describe('zeros3', function () {

	it('spawns', function(done) {
		this.timeout(60000);



		var server = fork(testServerPath);


		setTimeout(function () {
		 	var worker = fork(workerPath);

		 	setTimeout(function() {

 				server.send('sendMessage');

		 	}, 1000);


		}, 1000);

		//worker.on('exit', done);
		//server.on('exit', done);
	});

});

function fork(what) {
	return child.fork(what, process.argv.slice(2),  { cwd: process.cwd() });
}