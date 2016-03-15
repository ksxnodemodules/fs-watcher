
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

		var storage = resolvePath(config.storage);

		var watch = (files, callback) => {
			return new Promise(createPromiseCallback(files, callback));
			Promise.all(files.map((fname) => createSubPromise(fname, previous)));
		};

		var createPromiseCallback = (...args) =>
			(...subargs) => readFile(storage, createReadFileCallback(...args, ...subargs));

		var createReadFileCallback = (files, ...promise) =>
			(...previous) => Promise.all(files.map(createMapCallback(...promise, createPrevious(...previous))));

		var createMapCallback = (callback, resolve, reject, previous) => {};

		var createPrevious = (error, data) =>
			error ? create(null) : parseJSON(String(data));

		var createSubPromise = (fname, previous) =>
			new Promise(createSubPromiseCallback(resolvePath(fname), previous));

		var createSubPromiseCallback = (fname, previous) =>
			(...args) => fstat(fname, createStatCallback(fname, previous[fname], ...args));

		var createStatCallback = (fname, previous, resolve) =>
			(...args) => resolve(createSubPromiseResolve(fname, previous, ...args));

		var createSubPromiseResolve = (fname, previous, error, info) => {
			if (previous) {
				if (error) {
					return new ChangeDetail('delete', fname);
				}
				if (info.mtime.getTime() > previous) {
					return new ChangeDetail('update', fname);
				}
			} else if (!error) {
				return new ChangeDetail('create', fname);
			}
		};

		return {
			'watch': watch,
			'__proto__': this
		};

	}

	module.exports = class extends Watcher {};

	function ChangeDetail(type, name) {
		this.type = type;
		this.name = name;
		freeze(this);
	}

})(module);
