
# fs-watcher

## Requirements

 * Node >= 5.0.0, with flag `--es-staging`

## Examples

```javascript
var watch = require('fs-watcher');
watch('./target.txt', './compare.txt')
	.on('change', () => {
		// thinking more...
	});
```
