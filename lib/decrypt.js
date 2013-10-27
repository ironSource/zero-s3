var crypto = require('crypto');

module.exports = function decrypt(encryptedData) {

	var decipher = crypto.createDecipher('aes128', 'secret');

	var u = decipher.update(encryptedData, 'base64', 'utf8');

	return u + decipher.final('utf8');
}