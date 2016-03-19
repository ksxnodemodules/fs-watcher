
((module) => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var DeepIterable = require('x-iterable/deep-iterable');

	var create = Object.create;
	var freeze = Object.freeze;
	var parseJSON = JSON.parse;
	var readFile = fs.readFile;
	var writeFile = fs.writeFile;
	var fstat = fs.fstat;
	var resolvePath = path.resolve;

	const DEFAULT_ONSTORE = (error) => error && _throw(error);

	var _throw = (error) => {throw error};

	var _throwif = (error) => error && _throw(error);

	var _requiretype = (value, type) =>
		typeof value === type ? value : _throw(new TypeError(`${value} is not a ${type}`));

	var _getfunc = (val, def) =>
		typeof val === 'function' ? val : def;

	var _returnf = (fn) => (...args) => fn(...args);

	function Watcher(config, callback) {

		callback = _getfunc(callback, _throwif);

		var storagePath = resolvePath(config.storage);
		var storageObject = null;

		var storagePromise = new Promise((resolve, reject) => {
			readFile(storagePath, (error, data) => {
				var callbackArguments = [null, this];
				if (error) {
					storageObject = create(null);
					resolve(); // You may wonder why not 'reject()',
								// it's because a file located at 'storagePath' may not exist in the beginning
				} else {
					try {
						storageObject = JSON.parse(String(data));
					} catch (error) {
						callbackArguments = [error, null];
						reject(error); // Now is the time to reject()
					};
					resolve();
				}
				watchImmedialy = true;
				callback(...callbackArguments);
			});
		});

		var watchImmedialy = false;

		var allPromises = create(null);

		var watch = (files, onchange, onstore) => {

			_requiretype(onchange, 'function');
			files = files.map((fname) => resolvePath(fname));

			var stop = false;

			var main = (resolve, reject) =>
				howToWatch(() => watchObject(files, createStopFunction(resolve), createStopFunction(reject)));

			var howToWatch = (watch) =>
				watchImmedialy ? watch() : storagePromise.then(watch);

			var createStopFunction = (decide) => _returnf((...args) => {
				stop = true;
				decide(...args);
			});

			var watchObject = (files, ...promise) => {
				createWatchObjectPromise(files).then((changes) => {
					if (changes.length) {
						onchange(changes, ...promise);
						stop || repeat(changes, ...promise);
					} else {
						resolve();
					}
				});
			};

			var repeat = (changes, resolve, reject) =>
				watchObject(getFiles(changes), resolve, reject);

			var getFiles = (changes) => changes.map((detail) => detail.name);

			var createWatchObjectPromise = (files) =>
				Promise.all(files.map(createSubPromise));

			var createSubPromise = (material) => {
				switch (typeof material) {
					case 'string':
						let promise = allPromises[material];
						if (!promise) {
							let subPromiseCallback = (resolve, reject) => fstat(material, createStatCallback(material, resolve, reject));
							promise = allPromises[material] = new Promise(subPromiseCallback);
						}
						return promise;
					case 'function':
						return new Promise(material);
					case 'object':
						let promise = new DeepIterable(material, (element) => !(element instanceof Promise))
							.map((promise) => new Promise((...decide) => promise.then(...decide)));
						return Promise.all(promise);
				}
			}

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
			'watch': _returnf(watch),
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
