
# fs-watcher

## Requirements

 * Node >= 5.0.0, with flag `--es-staging`

## Examples

### Asynchronous

```javascript
var Watcher = require('fs-watcher/async');
var watcher = new Watcher({
	storage: './temp/storage.json'
});
watcher.watch(['./target/a.txt', './target/b.txt'], (changes, resolve) => {
	change.forEach((item) => console.log(`${item.type} file "${item.name}"`));
	resolve(changes.length ? 'repeat' : 'next');
}).then(() => console.log('finish'));
```

### Synchronous

```javascript
var WatcherSync = require('fs-watcher/sync');
var watcher = new WatcherSync({
	storage: './temp/storage.json'
});
var changes;
var target = ['./target/a.txt', './target/b.txt'];
do {
	changes = watcher.watch(target);
	changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
} while (changes.length);
console.log('finish');
```
