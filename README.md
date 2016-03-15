
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
	changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
}).then(() => console.log('finish'));
```

### Synchronous

```javascript
var WatcherSync = require('fs-watcher/sync');
var watcher = new WatcherSync({
	storage: './temp/storage.json'
});
for (let changes of watcher.watch(['./target/a.txt', './target/b.txt'])) {
	changes.forEach((item) => console.log(`${item.type} file "${item.name}"`));
}
console.log('finish');
```
