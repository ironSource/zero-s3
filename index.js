module.exports.start = function () {
	require('./worker.js');
};

module.exports.S3ClientProviderSelector = require('./lib/S3ClientProviderSelector.js');
module.exports.AbstractS3Client = require('./lib/AbstractS3Client.js');
module.exports.FaultyS3Client = require('./lib/FaultyS3Client.js');
module.exports.KnoxS3Client = require('./lib/KnoxS3Client.js');
module.exports.KnoxS3ClientProvider = require('./lib/KnoxS3ClientProvider.js');
module.exports.Message = require('./lib/Message.js');