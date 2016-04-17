
((module) => {
    'use strict';

    class FSWArray extends Array {}
    FSWArray.ActionList = class extends FSWArray {};
    FSWArray.ChangeDetailList = class extends FSWArray {};
    module.exports = FSWArray;

})(module);
