var $u = require('util');
var AbstractS3Client = require('./AbstractS3Client.js');
var knox = require('knox');
var assert = require('assert');
var fs = require('fs');
var zlib = require('zlib');

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

function onResponse (callback) {

	return function onResponseImpl(res) {

		if (200 == res.statusCode) {
			callback(null, res);
		} else {
			callback(new Error('response error ' + res.statusCode), res);
		}

		res.end();
	}
}

KnoxS3Client.prototype.put = function(key, data, callback) {

	if (!Buffer.isBuffer(data)) {
		data = new Buffer(JSON.stringify(data), config.uploadEncoding);
	}

	var length = data.length;

	var request = this._client.put(key, {
		'Content-Length': length,
		'Content-Type': 'application/json'
	});

	request.on('response', onResponse(callback));
	request.on('error', callback);

	if (config.gzip.enabled) {
		var gzip = zlib.createGzip(config.gzip.options);

		gzip.write(data);
		gzip.pipe(request);
	} else {
		request.end(data);
	}

};

KnoxS3Client.prototype.putFile = function(key, file, callback) {

	function innerCallback(err, res) {
		callback(err, res);

		if (!res.finished)
			res.end();
	}

	var self = this;
	if (config.gzip.enabled) {
		fs.stat(file, function(err, stat) {
			if(err) return callback(err);

			self.putStream(key, fs.createReadStream(file), { 'Content-Type': 'text/plain', 'Content-Length': stat.size }, callback);
		});
	} else {
		this._client.putFile(file, key, innerCallback);
	}
};

KnoxS3Client.prototype.putStream = function(key, stream, headers, callback) {

	function innerCallback(err, res) {
		callback(err, res);

		if (!res.finished)
			res.end();
	}

	if (config.gzip.enabled) {
		var gzip = zlib.createGzip(config.gzip.options);
		var request = this._client.put(key, headers);

		request.on('response', onResponse(callback));
		request.on('error', innerCallback);

		stream.pipe(gzip).pipe(request);

	} else {
		this._client.putStream(stream, key, headers, innerCallback);
	}

};

module.exports = KnoxS3Client;