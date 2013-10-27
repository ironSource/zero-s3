var LRUCache = require('lru-cache');
var KnoxS3Client = require('./KnoxS3Client.js');
var _l = require('lodash');

function Provider(lruCacheOptions, awsOptions) {
	this._cache = LRUCache(lruCacheOptions);
	this._awsOptions = awsOptions;
}

Provider.prototype.get = function(bucket) {
	var client = this._cache.get(bucket);

	if (!client) {
		var options = _l.clone(this._awsOptions);

		options.bucket = bucket;

		client = new KnoxS3Client(options);

		this._cache.set(bucket, client);

		console.log('initialized client for bucket %s', bucket);
	}

	return client;
};

module.exports = Provider;