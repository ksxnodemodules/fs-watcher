
((module) => {
	'use strict';

	var joinPath = require('path').join;
	var readdirSync = require('fs').readdirSync;

	var listdir = (dirname) => {
		try {
			return readdirSync(dirname).map((item) => joinPath(dirname, item));
		} catch (error) {
			return [];
		}
	};

	module.exports = listdir;

})(module);
