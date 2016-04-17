
((module) => {
    'use strict';

    var resolvePath = require('path').resolve;

    var callback = (fname) =>
        typeof fname === 'string' ? resolvePath(fname) : fname;

    var resolvePathArray = (array) => array.map(callback);

    module.exports = resolvePathArray;

})(module);
