
['async', 'sync']
	.forEach((name) => setTimeout(() => require(`./${name}/main.js`)));
