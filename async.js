
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
					watchObject(files, resolve, reject);
				});
			};

			var watchObject = (files, resolve, reject) => {
				createWatchObjectPromise(files)
					.then((changes) => callback(changes, createStopFunction(resolve), createStopFunction(reject)))
					.then((changes) => stop || repeat(changes, resolve, reject))
				;
			};

			var repeat = (changes, resolve, reject) => {
				if (changes.length) {
					setTimeout(() => watchObject(changes.map((detail) => detail.name), resolve, reject));
				} else {
					stop = true;
					resolve();
				}
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
		freeze(this);
	}

})(module);
