
((module) => {
	'use strict';

	var joinPath = require('path').join;
	var mkdirSync = require('fs-force/mkdir-sync');
	var callback = require('../callback.js');

	const TEMP = joinPath(__dirname, 'temp');
	const TARGETA = joinPath(TEMP, 'target-a');
	const TARGETB = joinPath(TEMP, 'target-b');
	const CALLBACK = Object.freeze([callback.onfulfilled, callback.onrejected]);

	[TEMP, TARGETA, TARGETB].forEach((dir) => mkdirSync(dir));
	process.chdir(TEMP);

	var filelistA, filelistB;
	try {
		let filelist = require('./temp/file-list.js');
		let createCallback = (target) =>
			(fname) => joinPath(target, fname);
		filelistA = filelist.a.map(createCallback(TARGETA));
		filelistB = filelist.b.map(createCallback(TARGETB));
	} catch (error) {
		console.error(error);
		console.error(`Please create file \x1B[33mfile-list.js\x1B[0m inside directory \x1B[33mtemp\x1B[0m before run \x1B[33mnpm test\x1B[0m`);
		return;
	}

	require('../title.js')('ASYNC');

	var Watcher = require('fs-watcher/async');
	var watcher = new Watcher({
		storage: './storage.json',
		jsonspace: '\t'
	});

	var message = (changes) =>
		changes.forEach((item) => console.log(item));

	var onchange = (changes, resolve) => {
		message(changes);
		resolve();
	};

	var promiseA = watcher.watch(filelistA, onchange).onfinish(...CALLBACK);

	watcher.watch([...filelistB, promiseA], onchange).onfinish(...CALLBACK);

})(module);
