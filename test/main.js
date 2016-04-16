
((module) => {
	'use strict';

	var info = require('../package.json');

	console.log(
		`TESTING:\n\t\x1B[33mType:\x1B[0m NodeJS package\n\t\x1B[33mName:\x1B[0m ${info.name}\n\t\x1B[33mGit URL:\x1B[0m ${info.repository.url}`
	);

	['sync', 'async']
		.forEach((name) => setTimeout(() => require(`./${name}/main.js`)));

})(module);
