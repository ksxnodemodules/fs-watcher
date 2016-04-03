
((module) => {
    'use strict';

    var fs = require('fs');
	var path = require('path');
    var createTryCatchTuple = require('just-try').tuple;
	var DeepIterable = require('x-iterable/deep-iterable');
    var createChangeDetail = require('./utils/create-change-detail.js');
    var resolvePathArray = require('./utils/resolve-path-array.js');
    var FSWArray = require('./utils/fsw-array.js');

	var create = Object.create;
	var freeze = Object.freeze;
	var parseJSON = JSON.parse;
	var readFileSync = fs.readFileSync;
	var writeFileSync = fs.writeFileSync;
	var statSync = fs.statSync;
	var resolvePath = path.resolve;
	var parseJSON = JSON.parse;
	var stringJSON = JSON.stringify;
    class ActionListSuper extends FSWArray.ActionList {}
    class ChangeDetailListSuper extends FSWArray.ChangeDetailList {}

    var _throw = (error) => {throw error};

	var _throwif = (error) => error && _throw(error);

	var _requiretype = (value, type) =>
		typeof value === type ? value : _throw(new TypeError(`${value} is not a ${type}`));

	var _getfunc = (val, def) =>
		typeof val === 'function' ? val : def;

	var _returnf = (fn) => (...args) => fn(...args);

	var _getstore = (json) =>
		json ? parseJSON(json) : create(null);

    function WatcherSync(config) {

        var onload = _getfunc(config.onload, _throwif);
		var onstore = _getfunc(config.onstore, _throwif);
		var storagePath = resolvePath(config.storage);
		var storageObject = parseJSON(String(readFileSync(storagePath)));
        class ActionList extends ActionListSuper {}
        class ChangeDetailList extends ChangeDetailListSuper {}

        var acts = new ActionList();

        var watch = (dependencies, onchange) => {

            _requiretype(onchange, 'function');
			dependencies = resolvePathArray(dependencies);

            var changes = new ChangeDetailList();

            var main = () => {
                for (let dependency of dependencies) {
                    switch (typeof dependency) {
                        case 'string':
                        case 'number':
                            let trytuple = createTryCatchTuple(() => statSync(dependency));
                            let changedetail = createChangeDetail(storageObject, dependency, ...trytuple);
                            changes.push(changedetail);
                            break;
                        case 'object':
                            if (dependency instanceof ChangeDetailList) {
                                changes.push(...dependency);
                                break;
                            }
                            // do not break here
                        default:
                            throw new TypeError(`${dependency} is not a valid Dependency`);
                    }
                }
                changes.length && onchange(changes);
            };

            acts.push(main);
            return changes;

        };

        watch.ActionList = ActionList;
        watch.ChangeDetailList = ChangeDetailList;

        var space = (value) => {
        	switch (typeof value) {
        		case 'undefined':
        		case 'string':
        			return jsonspace = value;
        		case 'number':
        			return jsonspace = parseInt(value);
        	}
        	throw new TypeError(`${value} is invalid`);
        };
        var jsonspace = space(config.jsonspace);

        var end = () => {
            acts.forEach((func) => func());
            writeFileSync(storagePath, stringJSON(storageObject, undefined, jsonspace)) + '\n';
        };

        return {
            'watch': _returnf(watch),
            'space': _returnf(space),
            'end': _returnf(end),
            '__proto__': null
        };

    }

    module.exports = class extends WatcherSync {};

})(module);
