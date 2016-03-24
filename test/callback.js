
((module) => {
    'use strict';

    var onfulfilled = () => console.log('\x1B[36mReturned\x1B[0m');

    var onrejected = (error) => {
        console.error('Failed');
        console.error(error);
    };

    module.exports = {
        'onfulfilled': onfulfilled,
        'onrejected': onrejected,
        '__proto__': null
    };

})(module);
