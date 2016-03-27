
((module) => {
    'use strict';

    var fs = require('fs');
	var path = require('path');
	var DeepIterable = require('x-iterable/deep-iterable');
    var ChangeDetail = require('./utils/change-detail.js');

	var create = Object.create;
	var freeze = Object.freeze;
	var parseJSON = JSON.parse;
	var readFileSync = fs.readFileSync;
	var writeFileSync = fs.writeFileSync;
	var statSync = fs.statSync;
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

    function WatcherSync(config) {
        var onload = _getfunc(config.onload, _throwif);
		var onstore = _getfunc(config.onstore, _throwif);
		var storagePath = resolvePath(config.storage);
		var storageObject = parseJSON(String(readFileSync(storagePath)));
        // writeFileSync(storagePath, stringJSON(storagePath) + '\n');
    }

    module.exports = class extends WatcherSync {};

})(module);
