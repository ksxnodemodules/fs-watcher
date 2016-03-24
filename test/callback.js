
((module) => {
    'use strict';

    var onfulfilled = () => console.log('Returned');

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
