var zmq = require('zmq');
var config = require('./lib/config.js');
var $u = require('util');
var http = require('http');

var incomingChannel = zmq.socket('pull');
incomingChannel.identity = 'zero-s3' + process.pid;

function connectChannel(address) {
	incomingChannel.connect(address, function(err) {
		console.log(err)
	});
}

for (var i = 0; i < config.fileLoggers.length; i++) {
	connectChannel(config.fileLoggers[i]);
}


var KnoxS3ClientProvider = require('./lib/KnoxS3ClientProvider.js');

var clientProvider = new KnoxS3ClientProvider(config.lru, config.aws);

function putCallback(err, response) {
	if (err) console.error(err);
}

incomingChannel.on('message', function(message) {
	if (!message.bucket) {
		console.error('dropping message (missing bucket):\n%s\n\n', $u.inspect(message.toString(config.messageEncoding)));
		return;
	}

	if (!message.key) {
		console.error('dropping message (missing key):\n%s\n\n', $u.inspect(message.toString(config.messageEncoding)));
		return;
	}

	if (message.url || message.data) {

		var client = clientProvider.get(message.bucket);

		if (message.data) {
			client.put(message.key, message.data, putCallback);
		} else {
			getMessageAndUpload(client, message);
		}

	} else {

		console.error('dropping message (missing url or data):\n%s\n\n', $u.inspect(message.toString(config.messageEncoding)));
		return;
	}
});

console.log('zero-s3 worker started (pid: %s)', process.pid);