var child = require('child_process');

module.exports = function (what, args) {
	return child.fork(what, process.argv.slice(3).concat(args),  { cwd: process.cwd() });
}