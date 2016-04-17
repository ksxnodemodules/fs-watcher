
((module) => {
    'use strict';

    const SPACES = Object.freeze(['\x20', '\t', '\n']);

    var space = (value) => {
        switch (typeof value) {
            case 'string':
                if ([...value].some((char) => SPACES.indexOf(char) === -1)) break;
            case 'undefined':
                return value;
            case 'number':
                return parseInt(value);
        }
        throw new TypeError(`${value} is invalid`);
    };

    module.exports = space;

})(module);
