
((module) => {
    'use strict';

    var ChangeDetail = require('./change-detail.js');

    var create = (storage, fname, error, info) => {
        let prevmtime = storage[fname];
        if (prevmtime) {
            if (error || info.isDirectory()) {
                delete storage[fname];
                return new ChangeDetail('delete', fname, prevmtime, null);
            }
            let currmtime = info.mtime.getTime();
            if (currmtime > prevmtime) {
                storage[fname] = currmtime;
                return new ChangeDetail('update', fname, prevmtime, currmtime);
            }
        } else if (info && info.isFile()) {
            let currmtime = storage[fname] = info.mtime.getTime();
            return new ChangeDetail('create', fname, null, currmtime);
        }
    };

    module.exports = create;

})(module);
