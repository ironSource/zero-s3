var zmq = require('zmq');
var config = require('./lib/config.js');
var $u = require('util');
var Message = require('./lib/Message.js');
var http = require('http');
var decrypt = require('./lib/decrypt.js');
var S3ClientProviderSelector = require('./lib/S3ClientProviderSelector.js');
var domain = require('domain');

var incomingChannel = zmq.socket('pull');
incomingChannel.identity = 'zero-s3' + process.pid;

for (var i = 0; i < config.fileLoggers.length; i++) {
	console.log('connecting to %s', config.fileLoggers[i]);
	incomingChannel.connect(config.fileLoggers[i]);
}

console.log('zero-s3 client provider is %s', config.clientType);

var ClientProviderClass = S3ClientProviderSelector.get(config.clientType);
var clientProvider = new ClientProviderClass(config);

function putCallback(err, res, message) {
	if (err) {

		console.error(err);
		printResponse(res);

		if (message.uploadAttempts <= config.uploadAttempts) {
			console.warn('retrying upload %s (%s/%s)', message.payload.key, message.uploadAttempts, config.uploadAttempts);
			upload(message);
		} else {
			console.warn('failed to upload message %s', message.payload.key);
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

	response.data = '';

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