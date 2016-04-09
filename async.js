
((module) => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var DeepIterable = require('x-iterable/deep-iterable');
	var bindFunction = require('simple-function-utils/bind').begin;
	var ChangeDetail = require('./utils/change-detail.js');
	var FSWPromise = require('./utils/promise');
	var createChangeDetail = require('./utils/create-change-detail.js');
	var resolvePathArray = require('./utils/resolve-path-array.js');
	var jsonSeperator = require('./utils/json-separator.js');

	var create = Object.create;
	var freeze = Object.freeze;
	var parseJSON = JSON.parse;
	var readFile = fs.readFile;
	var writeFile = fs.writeFile;
	var stat = fs.stat;
	var resolvePath = path.resolve;
	var parseJSON = JSON.parse;
	var stringJSON = JSON.stringify;

	var _throw = (error) => {throw error};

	var _throwif = (error) => error && _throw(error);

	var _requiretype = (value, type) =>
		typeof value === type ? value : _throw(new TypeError(`${value} is not a ${type}`));

	var _getfunc = (val, def) =>
		typeof val === 'function' ? val : def;

	var _returnf = (fn) => (...args) => fn(...args);

	var _getresolve = (resolve, argument) => {
		var result = bindFunction(resolve, argument);
		result.pure = result.resolve = resolve;
		return result;
	};

	var _getstore = (json) =>
		json ? parseJSON(json) : create(null);

	function Watcher(config) {

		var onload = _getfunc(config.onload, _throwif);
		var onstore = _getfunc(config.onstore, _throwif);
		var storagePath = resolvePath(config.storage);
		var storageObject = null;
		class LocalPromise extends FSWPromise {};
		class PrivatePromise extends LocalPromise {};

		var storagePromise = new PrivatePromise((resolve, reject) => {
			readFile(storagePath, (error, data) => {
				var callbackArguments = [null, this];
				if (error) {
					storageObject = create(null);
					resolve(); // You may wonder why not 'reject()',
								// it's because a file located at 'storagePath' may not exist in the beginning
				} else {
					try {
						storageObject = _getstore(String(data));
					} catch (error) {
						callbackArguments = [error, null];
						reject(error); // Now is the time to reject()
					};
					resolve();
				}
				done = true;
				onload(...callbackArguments);
			});
		});

		var done = false;

		var createdPromise = new Map();
		var allPromise = new Set();
		var writeStorage = () =>
			writeFile(storagePath, stringJSON(storageObject, undefined, jsonspace) + '\n', onstore);

		storagePromise.onfulfill(() => PrivatePromise.all(allPromise).onfulfill(writeStorage));

		var watch = (dependencies, onchange) => {

			if (done) {
				throw new Error('This Watcher is no longer usable');
			}

			_requiretype(onchange, 'function');
			dependencies = resolvePathArray(dependencies);

			var main = (resolve, reject) =>
				storagePromise.onfulfill(() => watchObject(dependencies, resolve, reject));

			var watchObject = (dependencies, resolve, reject) => {
				createSubPromise(dependencies).then((changes) => {
					changes.length && onchange(changes, _getresolve(resolve, changes), reject);
				}, reject);
			};

			var createSubPromise = (dependency) => {
				let res = createdPromise.get(dependency);
				if (res instanceof PrivatePromise) {
					return res;
				}
				let mkResult = (callback) => {
					var result = new PrivatePromise(callback);
					createdPromise.set(dependency, result);
					return result;
				};
				switch (typeof dependency) {
					case 'string':
						let subPromiseCallback = (resolve, reject) =>
							stat(dependency, createStatCallback(dependency, resolve, reject));
						return mkResult(subPromiseCallback);
					case 'function':
						return new PrivatePromise(dependency);
					case 'object':
						if (!dependency) {
							break;
						}
						if (dependency instanceof PrivatePromise) {
							let subPromiseCallback = (resolve, reject) =>
								new PrivatePromise(dependency).onfulfill(resolve, reject);
							return new PrivatePromise(subPromiseCallback);
						}
						if (typeof dependency[Symbol.iterator] === 'function') {
							let promise = [...dependency]
								.map(createSubPromise)
								.map((promise) => new PrivatePromise((...decide) => promise.onfinish(...decide)))
							;
							let getResolveValue = (changes) =>
								[...new DeepIterable(changes, (element) => !(element instanceof ChangeDetail)).filter(Boolean)];
							let subPromiseCallback = (resolve, reject) =>
								PrivatePromise.all(promise).onfinish((changes) => resolve(getResolveValue(changes)), reject);
							return new PrivatePromise(subPromiseCallback);
						}
				}
				throw new TypeError(`${dependency} is not a valid Dependency`);
			}

			var createStatCallback = (fname, resolve) =>
				(error, info) => resolve(createSubPromiseResolve(fname, error, info));

			var createSubPromiseResolve = (...args) => createChangeDetail(storageObject, ...args);

			var result = new PrivatePromise(main);
			allPromise.add(result);
			return result;

		};

		var space = (value) => jsonspace = jsonSeperator(value);
		var jsonspace = space(config.jsonspace);

		return {
			'watch': _returnf(watch),
			'space': _returnf(space),
			'done': () => done,
			'LocalPromise': LocalPromise,
			'__proto__': this
		};

	}

	module.exports = class extends Watcher {};

})(module);
