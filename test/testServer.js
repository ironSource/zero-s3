var zmq = require('zmq');
var path = require('path');
var Messaging = require('forkraft').Messaging;
var $u = require('util');

var outgoingWorkChannel = zmq.socket('push');

process.on('message', function (msg) {
	console.log('test server: invoking %s', $u.inspect(msg));
	server[msg.method].apply(null, msg.params);
});

var server = {
	init: function() {
		outgoingWorkChannel.identity = 'loggerToZeroS3' + process.pid;
		outgoingWorkChannel.bindSync('tcp://127.0.0.1:5003');
	},
	sendMessage: function (bucket, key) {

		var message = {
			bucket: bucket,
			key: key,
			path: path.join(__dirname, 'uploadtestfile')
		};

		console.log('test server: sending %s to zero s3 worker', $u.inspect(message));

		outgoingWorkChannel.send(JSON.stringify(message));

		console.log('sent!');
	}
};

console.log('test server: started (pid: %s)', process.pid);