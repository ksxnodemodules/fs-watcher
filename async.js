
((module) => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var ExtendedPromise = require('extended-promise');
	var DeepIterable = require('x-iterable/deep-iterable');

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

	var _getstore = (json) =>
		json ? parseJSON(json) : create(null);

	function Watcher(config) {

		var onload = _getfunc(config.onload, _throwif);
		var onstore = _getfunc(config.onstore, _throwif);
		var storagePath = resolvePath(config.storage);
		var storageObject = null;

		var storagePromise = new ExtendedPromise((resolve, reject) => {
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

		var allPromise = new Set();
		var writeStorage = () =>
			writeFile(storagePath, stringJSON(storageObject, undefined, jsonspace), onstore);

		storagePromise.onfulfill(() => ExtendedPromise.all(allPromise).onfulfill(writeStorage));

		var watch = (dependencies, onchange) => {

			if (done) {
				throw new Error('This Watcher is no longer usable');
			}

			_requiretype(onchange, 'function');
			dependencies = dependencies.map((fname) => typeof fname === 'string' ? resolvePath(fname) : fname);

			var main = (resolve, reject) =>
				storagePromise.onfulfill(() => watchObject(dependencies, resolve, reject));

			var watchObject = (dependencies, resolve, reject) => {
				createSubPromise(dependencies).then((changes) => {
					changes.length && onchange(changes, resolve, reject);
					resolve(changes);
				}, reject);
			};

			var createSubPromise = (dependency) => {
				switch (typeof dependency) {
					case 'string':
						let subPromiseCallback = (resolve, reject) =>
							stat(dependency, createStatCallback(dependency, resolve, reject));
					 	return new ExtendedPromise(subPromiseCallback);
					case 'function':
						return new ExtendedPromise(dependency);
					case 'object':
						if (!dependency) {
							break;
						}
						if (dependency instanceof Promise) {
							let subPromiseCallback = (resolve, reject) =>
								new ExtendedPromise(dependency).onfulfill(resolve, reject);
							return new ExtendedPromise(subPromiseCallback);
						}
						if (typeof dependency[Symbol.iterator] === 'function') {
							let promise = [...dependency]
								.map(createSubPromise)
								.map((promise) => new ExtendedPromise((...decide) => promise.onfinish(...decide)))
							;
							let getResolveValue = (changes) =>
								[...new DeepIterable(changes, (element) => !(element instanceof ChangeDetail)).filter(Boolean)];
							let subPromiseCallback = (resolve, reject) =>
								ExtendedPromise.all(promise).onfinish((changes) => resolve(getResolveValue(changes)), reject);
							return new ExtendedPromise(subPromiseCallback);
						}
				}
				throw new TypeError(`${dependency} is not a valid Dependency`);
			}

			var createStatCallback = (fname, resolve) =>
				(error, info) => resolve(createSubPromiseResolve(fname, error, info));

			var createSubPromiseResolve = (fname, error, info) => {
				let prevmtime = storageObject[fname];
				if (prevmtime) {
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

			var result = new ExtendedPromise(main);
			allPromise.add(result);
			return result;

		};

		var space = (value) => {
			switch (typeof value) {
				case 'undefined':
				case 'string':
					return jsonspace = value;
				case 'number':
					return jsonspace = parseInt(value);
			}
			throw new TypeError(`${value} is invalide`);
		};
		var jsonspace = space(config.jsonspace);

		return {
			'watch': _returnf(watch),
			'space': _returnf(space),
			'done': () => done,
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
