
((module) => {
    'use strict';

    function ChangeDetail(type, name, prevmtime, currmtime) {
		this.type = type;
		this.name = name;
		this.prevmtime = prevmtime;
		this.currmtime = currmtime;
		freeze(this);
	}

    module.exports = class extends ChangeDetail {};

})(module);
