var zmq = require('zmq');
var path = require('path');
var Messaging = require('forkraft').Messaging;

var outgoingWorkChannel = zmq.socket('push');
outgoingWorkChannel.identity = 'loggerToZeroS3' + process.pid;
outgoingWorkChannel.bind('tcp://127.0.0.1:5003');

process.on('message', function (msg) {
	server[msg]();
});

var server = {
	sendMessage: function () {
		var message = {
			bucket: 'rtb-redshift',
			key: 'test/12',
			path: path.join(__dirname, 'uploadtestfile')
		};

		console.log('sending', message);

		outgoingWorkChannel.send(JSON.stringify(message));
	}
}