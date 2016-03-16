
((module) => {
	'use strict';

	var joinPath = require('path').join;
	var listdir = require('../listdir.js');

	process.chdir(joinPath(__dirname, 'temp'));

	console.log('Testing Async');

	var Watcher = require('fs-watcher/async');
	var watcher = new Watcher({
		storage: './storage.json'
	});
	watcher.watch(listdir('target'), (changes) => {
		changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
	}).then(() => console.log('finish'));

})(module);
