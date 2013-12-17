var config = require('../lib/config.js');
var child = require('child_process');
var path = require('path');
var async = require('async');
var fs = require('fs');
var knox = require('knox');
var assert = require('assert');
var fs = require('fs');
var fork = require('./fork.js');

var workerPath = path.resolve(__dirname, '..', 'worker.js');
var testServerPath = path.join(__dirname, 'testServer.js');

var testFunction = describe;

if (config.aws.accessKeyId === undefined || config.aws.secretAccessKey === undefined) {

	testFunction = describe.skip;
	console.warn('skipping integration test because no aws credentials were supplied');
}

var testFileData = fs.readFileSync(path.join(__dirname, 'uploadtestfile'), 'utf8');

var s3Client = knox.createClient({
    key: 		config.aws.accessKeyId,
  	secret: 	config.aws.secretAccessKey,
  	bucket: 	config.aws.bucket,
  	region: 	config.aws.region,
  	endpoint: 	config.aws.endpoint
});

process.on('message', function(msg) {
	server[msg.method].apply(null, msg.params);
});

var TESTFILE = 'test/1';
var LOCALFILE = TESTFILE.replace('/', '_');

describe('zeros3', function () {

	/*
		test sends a message to the test server, which sends a message through zeromq to the zero-s3 worker
	*/
	it('uploads to s3', function(done) {
		this.timeout(60000);

		async.waterfall([
			initTest,
			clearS3TestData,
			forkTestServer,
			forkZeroS3Worker,
			tellTestServerToSendMessageToWorker,
			verifyUpload
		], testDone);

		function testDone(err, services) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				assert.strictEqual(services.downloadedFile, testFileData);

				teardown(services, done);
			}
		}
	});

	it.skip('retries the upload when it fails', function (done) {
		this.timeout(60000);

		async.waterfall([
			initTest,
			clearLocalData,
			forkTestServer,
			forkFaultyZeroS3Worker,
			tellTestServerToSendMessageToWorker,
			verifyLocalData
		], testDone);

		function testDone(err, services) {
			if (err) {
				console.log(err);
				done(err);
			} else {
				assert.strictEqual(services.downloadedFile, testFileData);
				teardown(services, done);
			}
		}
	});
});

function teardown(services, done) {

	services.zeros3Worker.kill();
	services.testServer.kill();

	function killWorker(callback) {
		services.zeros3Worker.on('close', callback);
		console.log('worker closed');
	}

	function killServer(callback) {
		services.testServer.on('close', callback);
		console.log('server closed');
	}

	async.parallel([
		killWorker,
		killServer,
	], done);
}

function initTest(callback) {
	callback(null, {});
}

/*

*/
function verifyLocalData(services, callback) {

	fs.readFile(path.join(__dirname, LOCALFILE), 'utf8', function(err, data) {
		services.downloadedFile = data
		callback(err, services);
	});
}


/*
	download the file from s3 and compare to test file data
*/
function verifyUpload(services, callback) {

	s3Client.getFile(TESTFILE, function(err, res) {

		services.downloadedFile = '';

		function readResponse() {

			if (!res) return;

			function readMore() {
				var result = res.read();

				if (result) {
					services.downloadedFile += result;
					readMore();
				}
			}

			res.on('readable', readMore);

			res.on('end', function () {
				callback(null, services);
			});
		}

		readResponse();
	});
}

/*
	tell our test server to send a message to the zero-s3 worker and wait 3 seconds
*/
function tellTestServerToSendMessageToWorker(services, callback) {
	console.log('telling test server to send a message to zero s3 worker');
	services.testServer.send({ method: 'sendMessage', params: [ config.aws.bucket, TESTFILE ] });
	setTimeout(function () {
		callback(null, services);
	}, 3000);
}

/*
	fork a zero-s3 worker
	then wait another second
*/
function forkZeroS3Worker(services, callback) {
	console.log('forking zero s3');
	services.zeros3Worker = fork(workerPath);
	setTimeout(function () {
		callback(null, services);
	}, 1000);
}

/*
	fork a faulty zero-s3 worker
	then wait another second
*/
function forkFaultyZeroS3Worker(services, callback) {
	var configPath = path.join(__dirname, 'faultyClientConfig.json');
//	configPath = 'faultyClientConfig.json';
	console.log('forking faulty zero s3 (%s)', configPath);
	services.zeros3Worker = fork(workerPath, ['--clientType', 'faulty', '--faulty.failures', 1, '--uploadAttempts', 2, '--faulty.directory', __dirname]);
	setTimeout(function () {
		callback(null, services);
	}, 1000);
}


/*
	fork a test server zero-s3 can connect using zmq
*/
function forkTestServer(services, callback) {
	console.log('forking test server');
	services.testServer = fork(testServerPath);

	setTimeout(function () {

		services.testServer.send({ method: 'init' });

		setTimeout(function () {
			callback(null, services);
		}, 1000);

	}, 1000);
}

/*
	clear s3 test data
*/
function clearS3TestData(services, callback) {
	console.log('clearing s3 test data');

	function success() {
		callback(null, services);
	}

	s3Client.deleteFile(TESTFILE, function(err, res) {

		if (err) callback(err);
		else if (res.statusCode.toString().substr(0, 2) !== '20')
			callback('response status code: ' + res.statusCode);
		else
			success();
	});
}

function clearLocalData(services, callback) {
	console.log('clearing local data');

	fs.unlink(path.join(__dirname, LOCALFILE), function (err) {
		if (err) callback(err);
		else callback(null, services);
	});
}
