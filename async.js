
((module) => {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	var freeze = Object.freeze;
	var parseJSON = JSON.parse;
	var readFile = fs.readFile;
	var fstat = fs.fstat;
	var resolvePath = path.resolve;

	function Watcher(config) {

		var storagePath = resolvePath(config.storage);
		var storageObject = null;

		var watch = (files, callback) => {

			var main = (resolve, reject) =>
				watchPath(files, callback).then(resolve, reject);

			return new Promise(main);

		};

		// var watch = (files, callback) =>
		// 	new Promise((resolve, reject) => watchPath(files, callback).then(resolve, reject));

		// var watchPath = (files, callback) =>
		// 	new Promise((resolve, reject) => readFile(storagePath, createReadFileCallback(files, callback, resolve, reject)));

		// var createReadFileCallback = (files, callback, resolve, reject) => (error, data) => {
		// 	createStorageObject(error, data);
		// 	watchObject(files, callback).then(resolve, reject);
		// };

		// var watch = (files, callback) => {
		// 	return new Promise(createPromiseCallback(files, callback)); // <-- Continue from here...
		// };

		// var watch = (files, callback) => {
		// 	return new Promise((resolve, reject) => watchFile(files, callback).then(resolve, reject)); // <-- Continue from here...
		// }

		// var watchFile = (files, callback) =>
		// 	new Promise((resolve, reject) => readFile(storage, (error, data) => watchObject(createPrevious(error, data)).then(resolve, reject)));

		// var watchObject = (previous) =>

		// var createPromiseCallback = (...args) =>
		// 	(...subargs) => readFile(storage, createReadFileCallback(...args, ...subargs));

		// var createReadFileCallback = (files, ...promise) =>
		// 	(...previous) => createFileCheckPromise(files, ...previous).then(createCallbackCaller(...promise));

		// var createFileCheckPromise = (files, ...previous) =>
		// 	Promise.all(files.map(createMapCallback(createPrevious(...previous))));

		// ////////////////////////////////////

		// var createCallbackCaller = (...args) =>
		// 	(changes) => repeatCallback(changes.filter(Boolean), ...args);

		// var createMapCallback = (previous) =>
		// 	(fname) => createSubPromise(fname, previous);

		// var createPrevious = (error, data) =>
		// 	error ? create(null) : parseJSON(String(data));

		// var repeatCallback = (changes, callback, resolve, reject) => {
		// 	var stop = false;
		// 	var subresolve = (...args) => {
		// 		stop = true;
		// 		resolve(...args);
		// 	};
		// 	var subreject = (...args) => {
		// 		stop = true;
		// 		reject(...args);
		// 	};
		// 	if (changes.length) {
		// 		callback(changes, subresolve, subreject);
		// 		return stop || watch(files, callback);
		// 	}
		// 	resolve();
		// };

		// var createSubPromise = (fname, previous) =>
		// 	new Promise(createSubPromiseCallback(resolvePath(fname), previous));

		// var createSubPromiseCallback = (fname, previous) =>
		// 	(...args) => fstat(fname, createStatCallback(fname, previous, ...args));

		// var createStatCallback = (fname, previous, resolve) =>
		// 	(...args) => resolve(createSubPromiseResolve(fname, previous, ...args));

		var createSubPromiseResolve = (fname, previous, error, info) => {
			let prevmtime = previous[fname];
			if (previous) {
				if (error) {
					delete previous[fname];
					return new ChangeDetail('delete', fname, prevmtime, null);
				}
				let currmtime = info.mtime.getTime();
				if (currmtime > previous) {
					previous[fname] = currmtime;
					return new ChangeDetail('update', fname, prevmtime, currmtime);
				}
			} else if (info) {
				let currmtime = previous[fname] = info.mtime.getTime();
				return new ChangeDetail('create', fname, null, currmtime);
			}
		};

		return {
			'watch': watch,
			'__proto__': this
		};

	}

	module.exports = class extends Watcher {};

	function ChangeDetail(type, name, prevmtime, currmtime) {
		this.type = type;
		this.name = name;
		this.prevmtime = prevmtime;
		this.currmtime = currmtime;
	}

})(module);
