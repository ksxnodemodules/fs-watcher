
# Spit fs-watcher to fs-watcher-sync and fs-watcher-async

fs-watcher would be a dependent of fs-watcher-sync and fs-watcher-async

# Support [glob syntax](https://en.wikipedia.org/wiki/Glob_%28programming%29)

If a `dependencies`'s element is a glob, watch all files that match the glob

# Support directories

If a `dependencies`'s element is a path to a directory, watch all files and directories inside that directory
