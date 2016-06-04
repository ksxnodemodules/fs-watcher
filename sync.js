
((module) => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var jtry = require('just-try');
	var DeepIterable = require('x-iterable/deep-iterable');
	var retf = require('./utils/retf.js');
	var getmkhandle = require('./utils/mkhandle-sync.js');
	var createChangeDetail = require('./utils/create-change-detail.js');
	var resolvePathArray = require('./utils/resolve-path-array.js');
	var jsonSeperator = require('./utils/json-separator.js');
	var FSWArray = require('./utils/fsw-array.js');

	var create = Object.create;
	var freeze = Object.freeze;
	var readFileSync = fs.readFileSync;
	var writeFileSync = fs.writeFileSync;
	var statSync = fs.statSync;
	var resolvePath = path.resolve;
	var createTryCatchTuple = jtry.tuple;
	var parseJSON = JSON.parse;
	var stringJSON = JSON.stringify;
	class ActionListSuper extends FSWArray.ActionList {}
	class ChangeDetailListSuper extends FSWArray.ChangeDetailList {}

	var _throw = (error) => {throw error};

	var _throwif = (error) => error && _throw(error);

	var _requiretype = (value, type) =>
		typeof value === type ? value : _throw(new TypeError(`${value} is not a ${type}`));

	var _getstore = (json) =>
		json ? parseJSON(json) : create(null);

	const HANDLEANYWAY = getmkhandle.HANDLEANYWAY;

	function WatcherSync({
		onload = _throwif,
		onstore = _throwif,
		mkhandle = HANDLEANYWAY,
		storage,
		jsonspace
	}) {

		var storagePath = resolvePath(storage);
		var storageObject = jtry(() => String(readFileSync(storagePath)), () => create(null), parseJSON);
		class ActionList extends ActionListSuper {}
		class ChangeDetailList extends ChangeDetailListSuper {}

		var acts = new ActionList();

		var watch = (dependencies, handle) => {

			_requiretype(handle, 'function');
			handle = mkhandle(handle);
			dependencies = resolvePathArray(dependencies);

			var changes = new ChangeDetailList();

			var main = () => {
				for (let dependency of dependencies) {
					switch (typeof dependency) {
						case 'string':
						case 'number':
							let trytuple = createTryCatchTuple(() => statSync(dependency));
							let changedetail = createChangeDetail(storageObject, dependency, ...trytuple);
							changedetail && changes.push(changedetail);
							break;
						case 'object':
							if (dependency instanceof ChangeDetailList) {
								changes.push(...dependency);
								break;
							}
						default:
							throw new TypeError(`${dependency} is not a valid Dependency`);
					}
				}
				handle(changes);
			};

			acts.push(main);
			return changes;

		};

		watch.ActionList = ActionList;
		watch.ChangeDetailList = ChangeDetailList;

		var space = (value) => jsonspace = jsonSeperator(value);
		jsonspace = space(config.jsonspace);

		var end = () => {
			acts.forEach((func) => func());
			writeFileSync(storagePath, stringJSON(storageObject, undefined, jsonspace) + '\n');
		};

		return {
			'watch': retf(watch),
			'space': retf(space),
			'end': retf(end),
			'__proto__': null
		};

	}

	module.exports = class extends WatcherSync {};

})(module);
