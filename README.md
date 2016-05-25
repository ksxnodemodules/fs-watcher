
# fs-watcher

[![dependencies status](https://david-dm.org/ksxnodemodules/fs-watcher.svg)](https://david-dm.org/ksxnodemodules/fs-watcher#info=dependencies)
[![devDependencies status](https://david-dm.org/ksxnodemodules/fs-watcher/dev-status.svg)](https://david-dm.org/ksxnodemodules/fs-watcher#info=devDependencies)

## Requirements

 * Node >= 6.0.0

## Examples

### Asynchronous

```javascript
var Watcher = require('fs-watcher/async');
var watcher = new Watcher({
	storage: './temp/storage.json'
});
watcher.watch(['./target/a.txt', './target/b.txt'], (changes, resolve) => {
	changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
    resolve(); // or resolve.pure(changes)
}).onfinish((changes) => console.log('Finish', changes));
```

### Synchronous

```javascript
var WatcherSync = require('fs-watcher/sync');
var watcher = new WatcherSync({
	storage: './temp/storage.json'
});
var changes = watcher.watch(['./target/a.txt', './target/b.txt'], (changes) => {
    changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
});
watcher.end();
console.log('Finish', changes);
```
