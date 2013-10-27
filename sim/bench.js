var EventEmitter = require('events').EventEmitter;

function calcDiff(diff) {
	return diff[0] * 1e9 + diff[1];
}

var SIZE, counter = 1000000;
var emitter = new EventEmitter();

var fnAccumulator = 0;
var fnDate = 0;

var ilAccumulator = 0;
var ilDate = 0;

function onEvent(time, dateTime) {
	fnAccumulator += calcDiff(process.hrtime(time));
	fnDate += Date.now() - dateTime;
}

emitter.on('inlineEvent', function(time, dateTime) {
	ilAccumulator += calcDiff(process.hrtime(time));
	ilDate += Date.now() - dateTime;
});

emitter.on('functionEvent', onEvent);

function emit() {
	if (counter-- === 0) {
		done();
		return;
	}
	emitter.emit('functionEvent', process.hrtime(), Date.now());
	emitter.emit('inlineEvent', process.hrtime(), Date.now());
	process.nextTick(dod);
}

function dod() {
	process.nextTick(emit)
}

emit();

function done() {

console.log('function: %s %s, inline: %s %s', fnAccumulator / SIZE, fnDate / SIZE, ilAccumulator / SIZE, ilDate / SIZE);
}
