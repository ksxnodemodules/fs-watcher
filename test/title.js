

((module) => {
    'use strict';

    const _x35 = '_'.repeat(35);

    module.exports = (tname) =>
        console.log(`\x1B[36m${_x35}\nTESTING${tname ? '\x20' + tname : ''}:\x1B[0m`);


})(module);
