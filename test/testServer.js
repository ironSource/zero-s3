var zmq = require('zmq');
var path = require('path');
var outgoingWorkChannel = zmq.socket('push');
outgoingWorkChannel.identity = 'loggerToZeroS3' + process.pid;
outgoingWorkChannel.bind('tcp://127.0.0.1:5003');


setTimeout(send, 5000);


function send() {

	var message = {
		bucket: 'rtb-redshift',
		key: 'test/1',
		path: path.join(__dirname, 'uploadtestfile')
	}

	console.log('sending', message);

	outgoingWorkChannel.send(JSON.stringify(message));
}
