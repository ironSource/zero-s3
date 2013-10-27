var zmq = require('zmq');

var incomingWorkChannel = zmq.socket('pull');
incomingWorkChannel.identity = 's3zero' + process.pid;
incomingWorkChannel.connect('tcp://127.0.0.1:5001');
incomingWorkChannel.connect('tcp://127.0.0.1:5002');

incomingWorkChannel.on('message', function(payload){
	console.log(JSON.parse(payload.toString()));
});
