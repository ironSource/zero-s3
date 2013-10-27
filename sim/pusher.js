var zmq = require('zmq');
var argv = require('optimist').argv;
console.log(argv)
var workChannel = zmq.socket('push');
workChannel.identity = 'zero-s3' + process.pid;
workChannel.bindSync('tcp://127.0.0.1:' + argv.port);

setInterval(function() {
	workChannel.send(JSON.stringify({
		bucket: 'rtb-redshift',
		key: 'kessler-test/' + Date.now(),
		url: 'moooooo'
	}));
}, 5000);
