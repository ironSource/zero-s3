var zmq = require('zmq');
var path = require('path');
var Messaging = require('forkraft').Messaging;
var $u = require('util');

var outgoingWorkChannel = zmq.socket('push');
outgoingWorkChannel.identity = 'loggerToZeroS3' + process.pid;
outgoingWorkChannel.bind('tcp://127.0.0.1:5003');

process.on('message', function (msg) {
	server[msg.method].apply(null, msg.params);
});

var server = {
	sendMessage: function (bucket, key) {

		var message = {
			bucket: bucket,
			key: key,
			path: path.join(__dirname, 'uploadtestfile')
		};

		console.log('test server is sending %s to zero s3 worker', $u.inspect(message));

		outgoingWorkChannel.send(JSON.stringify(message));
	}
}