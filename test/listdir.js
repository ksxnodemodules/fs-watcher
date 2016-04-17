
((module) => {
	'use strict';

	var path = require('path');
	var readdirSync = require('fs').readdirSync;

	var resolvePath = path.resolve;
	var joinPath = path.join;

	var listdir = (dirname) => {
		try {
			return readdirSync(dirname).map((item) => resolvePath(joinPath(dirname, item)));
		} catch (error) {
			return [];
		}
	};

	module.exports = listdir;

})(module);
