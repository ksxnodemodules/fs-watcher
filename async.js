
((module) => {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	var freeze = Object.freeze;
	var parseJSON = JSON.parse;
	var readFile = fs.readFile;
	var writeFile = fs.writeFile;
	var fstat = fs.fstat;
	var resolvePath = path.resolve;

	const DEFAULT_ONSTORE = (error) => {
		if (error) throw error;
	};

	var _getfunc = (val, def) =>
		typeof val === 'function' ? val : def;

	var _returnf = (fn) => (...args) => fn(...args);

	function Watcher(config) {

		var storagePath = resolvePath(config.storage);
		var storageObject = null;

		var watch = (files, callback, onstore) => {

			files = files.map((fname) => resolvePath(fname));

			var stop = false;

			var main = (resolve, reject) => {
				readFile(storage, (error, data) => {
					storageObject = error ? create(null) : parseJSON(String(data));
					watchObject(files, resolve, reject).then(() => stop || resolve());
				});
			};

			var watchObject = (files, resolve, reject) => {
				createWatchObjectPromise(files)
					.then((changes) => callback(changes, createStopFunction(resolve), createStopFunction(reject)))
					.then((changes) => stop || nextCall(changes))
				;
			};

			var nextCall = (changes) => {

			};

			var createWatchObjectPromise = (files) =>
				Promise.all(files.map(createSubPromise));

			var createStopFunction = (decide) => _returnf((...args) => {
				stop = true;
				decide(...args);
			});

			var createSubPromise = (fname) =>
				new Promise((resolve, reject) => fstat(fname, createStatCallback(fname, resolve, reject)));

			var createStatCallback = (fname, resolve) =>
				(error, info) => resolve(createSubPromiseResolve(fname, error, info));

			var createSubPromiseResolve = (fname, error, info) => {
				let prevmtime = storageObject[fname];
				if (storageObject) {
					if (error) {
						delete storageObject[fname];
						return new ChangeDetail('delete', fname, prevmtime, null);
					}
					let currmtime = info.mtime.getTime();
					if (currmtime > prevmtime) {
						storageObject[fname] = currmtime;
						return new ChangeDetail('update', fname, prevmtime, currmtime);
					}
				} else if (info) {
					let currmtime = storageObject[fname] = info.mtime.getTime();
					return new ChangeDetail('create', fname, null, currmtime);
				}
			};

			var writeStorage = () =>
				writeFile(storagePath, JSON.stringify(storageObject), _getfunc(onstore, DEFAULT_ONSTORE));

			return new Promise(main).then(writeStorage);

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

		// var createSubPromiseResolve = (fname, previous, error, info) => {
		// 	let prevmtime = previous[fname];
		// 	if (previous) {
		// 		if (error) {
		// 			delete previous[fname];
		// 			return new ChangeDetail('delete', fname, prevmtime, null);
		// 		}
		// 		let currmtime = info.mtime.getTime();
		// 		if (currmtime > previous) {
		// 			previous[fname] = currmtime;
		// 			return new ChangeDetail('update', fname, prevmtime, currmtime);
		// 		}
		// 	} else if (info) {
		// 		let currmtime = previous[fname] = info.mtime.getTime();
		// 		return new ChangeDetail('create', fname, null, currmtime);
		// 	}
		// };

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
