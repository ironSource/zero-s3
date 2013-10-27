/*************************************************************************************************
	DO NOT MODIFY THIS FILE UNLESS YOU REALLY REALLY REALLY REALLY KNOW WHAT YOU ARE DOING!!!  /k
*************************************************************************************************/
var path = require('path');
var rc = require('rc');

var defaults = {
	messageEncoding: 'utf8',
	aws: {
		region: 'us-east-1',
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
	}
};

module.exports = rc('zero-s3', defaults);
