
// if node.js : use amdefine (add it with npm)
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
	'lodash',
	'./get-set'
],
function(_, get_set) {
	'use strict';

	return function traverse_associative_array(o, process) {
		// http://stackoverflow.com/a/722732/587407
		for (var i in o) {
			process.apply(this,[i, o[i]]);
			if (o[i] !== null && typeof(o[i]) == 'object') {
				// going on step down in the object tree
				traverse_associative_array(o[i], process);
			}
		}
	};
});
