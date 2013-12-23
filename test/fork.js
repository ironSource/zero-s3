var child = require('child_process');

module.exports = function (what, cwd, args) {
	console.log('fork: ', what, cwd, args);
	return child.fork(what, process.argv.slice(3).concat(args),  { cwd: cwd });
}