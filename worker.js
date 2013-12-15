var zmq = require('zmq');
var config = require('./lib/config.js');
var $u = require('util');
var Message = require('./lib/Message.js');
var http = require('http');
var decrypt = require('./lib/decrypt.js');
var SimpleFileWriter = require('simple-file-writer');
var KnoxS3ClientProvider = require('./lib/KnoxS3ClientProvider.js');

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

var clientProvider = new KnoxS3ClientProvider(config.lru, config.aws);

function putCallback(err, res, message) {
	if (err) {
		console.error(err);
		printResponse(res);

		if (message.uploads < config.uploadRetries) {
			upload(message);
		}
	}
}

incomingChannel.on('message', handleMessage);

function handleMessage(payload) {
	try {
		payload = JSON.parse(decrypt(payload));
		upload(new Message(payload));
	} catch (e) {
		console.error('dropping message %s due to %s', $u.inspect(payload), $u.inspect(e));
	}
}

function upload (message) {
	var client = clientProvider.get(message.payload.bucket);
	message.upload(client, putCallback);
}

function printResponse(response) {

	if (!response) return;

	function readMore() {
		var result = response.read();

		if (result) {
			response.data += result;
			readMore();
		}
	}

	response.on('readable', readMore);

	response.on('end', function () {
		console.log(response.data);
	});
}

console.log('zero-s3 worker started (pid: %s)', process.pid);