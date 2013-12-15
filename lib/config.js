/*************************************************************************************************
	DO NOT MODIFY THIS FILE UNLESS YOU REALLY REALLY REALLY REALLY KNOW WHAT YOU ARE DOING!!!  /k
*************************************************************************************************/
var path = require('path');
var rc = require('rc');

var defaults = {
	messageEncoding: 'utf8',
	aws: {
		region: 'us-standard',
		accessKeyId: undefined,
		secretAccessKey: undefined
	},
	password: undefined,
	fileLoggers: [
		'tcp://127.0.0.1:5003'
	],
	/*
		see lru-cache for all the options
	*/
	lru: {
		max: 100,
		maxAge: 1000 * 60 * 60
	},

	gzip: {
		enabled: false,
		options: undefined
	},

	/*
		in put() functions where a string or an object is provided (and not a buffer) this enconding will be used when turning the data into a buffer
	*/
	uploadEncoding: undefined,

	uploadRetries: 5
};

module.exports = rc('zero-s3', defaults);
