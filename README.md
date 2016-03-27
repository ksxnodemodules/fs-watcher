
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
watcher.watch(['./target/a.txt', './target/b.txt'], (changes) => {
	changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
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
