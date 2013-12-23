/*************************************************************************************************
	DO NOT MODIFY THIS FILE UNLESS YOU REALLY REALLY REALLY REALLY KNOW WHAT YOU ARE DOING!!!  /k
*************************************************************************************************/
var path = require('path');
var rc = require('rc');

var defaults = {

	password: undefined,

	clientType: 'knox',

	fileLoggers: [
		'tcp://127.0.0.1:5003'
	],

	uploadAttempts: 5
};

module.exports = rc('zero-s3', defaults);
