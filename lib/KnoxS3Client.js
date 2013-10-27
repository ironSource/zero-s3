var $u = require('util');
var AbstractS3Client = require('./AbstractS3Client.js');
var knox = require('knox');
var assert = require('assert');

$u.inherits(KnoxS3Client, AbstractS3Client);
function KnoxS3Client(awsOptions) {
	AbstractS3Client.call(this);

	this._client = knox.createClient({
	    key: 		awsOptions.accessKeyId,
	  	secret: 	awsOptions.secretAccessKey,
	  	bucket: 	awsOptions.bucket,
	  	region: 	awsOptions.region,
	  	endpoint: 	awsOptions.endpoint
	});
}

KnoxS3Client.prototype.put = function(key, data, callback) {

	var length;

	if (Buffer.isBuffer(data)) {
		length = data.length;

	} else if (typeof(data) !== 'string') {

		data = JSON.stringify(data);
		length = Buffer.byteLength(data);
	}

	var request = this._client.put(key, {
		'Content-Length': length,
		'Content-Type': 'application/json'
	});

	var gotCalled = false;

	function onResponse (res) {
		assert(!gotCalled);
		gotCalled = true;

		if (200 == res.statusCode) {
			callback(null, res);
		} else {
			callback(new Error('response error ' + res.statusCode), res);
		}

		res.end();
	}

	function onError(err) {
		assert(!gotCalled);
		gotCalled = true;

		callback(err);
	}

	request.on('response', onResponse);
	request.on('error', onError);

	request.end(data);
};

KnoxS3Client.prototype.putFile = function(key, file, callback) {
	this._client.putFile(key, file, callback);
};

module.exports = KnoxS3Client;