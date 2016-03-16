
((module) => {
	'use strict';

	var readdirSync = require('fs').readdirSync;

	var listdir = (dirname) => {
		try {
			return readdirSync(dirname);
		} catch (error) {
			return [];
		}
	};

	module.exports = listdir;

})(module);
