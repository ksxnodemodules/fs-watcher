
((module) => {
    'use strict';

    var freeze = Object.freeze;
    var getallkeys = Object.getOwnPropertyNames;
    var def = Object.defineProperty;

    const HANDLE = freeze({
        'HANDLEANYWAY': (handle) => (...args) => handle(...args),
        'HANDLEIFCHANGE': (handle) => (changes) => changes.length && handle(changes),
        'HANDLEIFNOCHANGE': (handle) => (changes) => changes.length || handle(changes),
        '__proto__': null
    });

    var mkdesc = (value) => ({
        'value': value,
        'writable': false,
        'enumerable': false,
        'configurable': false,
        '__proto__': null
    });

    module.exports = freeze({
        'HANDLE': HANDLE,
        'apply': (target) => getallkeys(HANDLE).forEach((fname) => def(target, fname, mkdesc(HANDLE[fname]))),
        '__proto__': HANDLE
    });

})(module);
