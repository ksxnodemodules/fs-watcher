
((module) => {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	var freeze = Object.freeze;
	var readFile = fs.readFile;
	var fstat = fs.fstat;
	var resolvePath = path.resolve;

	function Watcher(config) {

		var storage = config.storage;

		var watch = (files, callback) => {
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
