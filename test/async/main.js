
((module) => {
	'use strict';

	var joinPath = require('path').join;
	var mkdirSync = require('fs-force/mkdir-sync');
	var listdir = require('../listdir.js');
	var callback = require('../callback.js');

	var cwd = joinPath(__dirname, 'temp');
	mkdirSync(cwd);
	process.chdir(cwd);

	console.log('Testing Async');

	var Watcher = require('fs-watcher/async');
	var watcher = new Watcher({
		storage: './storage.json',
		jsonspace: '\t'
	});
	watcher.watch(listdir('target'), (changes) => {
		changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
	}).then(callback.onfulfilled, callback.onrejected);

})(module);
