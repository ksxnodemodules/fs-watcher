
((module) => {
    'use strict';

    var setproto = Object.setPrototypeOf;

    var _returnf = (fn) => {
        var call = (...args) => fn(...args);
        setproto(call, fn);
        return call;
    };

    module.exports = _returnf(_returnf);

})(module);
