
((module) => {
    'use strict';

    var joinPath = require('path').join;
    var rm = require('fs-force/delete-sync');

    const TARGET = joinPath('temp', 'storage.json');

    ['async', 'sync']
        .forEach((name) => console.log(`cleaning ${name}`, rm(joinPath(__dirname, name, TARGET)).action));

})(module);
