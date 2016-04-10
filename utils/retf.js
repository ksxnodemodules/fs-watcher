
((module) => {
    'use strict';

    var _returnf = (fn) => {
        let call = (...args) => fn(...args);
        setproto(call, fn);
        return call;
    };

    module.exports = _returnf(_returnf);

})(module);
