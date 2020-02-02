'use strict';
module.exports = function pause (howLong) {
	return new Promise(resolve => setTimeout(resolve, howLong));
};

