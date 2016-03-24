
((module) => {
	'use strict';

	var joinPath = require('path').join;
	var mkdirSync = require('fs-force/mkdir-sync');
	var callback = require('../callback.js');

	const TEMP = joinPath(__dirname, 'temp');
	const TARGET = joinPath(__dirname, 'target');

	mkdirSync(TEMP);
	process.chdir(TEMP);

	var filelist;
	try {
		filelist = require('./temp/file-list.js').map((fname) => joinPath(TARGET, fname));
	} catch (error) {
		console.error(error);
		console.error(`Please create file \x1B[33mfile-list.js\x1B[0m inside directory \x1B[33mtemp\x1B[0m before run \x1B[33mnpm test\x1B[0m`);
		return;
	}

	console.log('Testing Async');

	var Watcher = require('fs-watcher/async');
	var watcher = new Watcher({
		storage: './storage.json',
		jsonspace: '\t'
	});
	watcher.watch(filelist, (changes) => {
		changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
	}).then(callback.onfulfilled, callback.onrejected);

})(module);
