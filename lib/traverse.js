/** object deep-traversal lib.
 * Note : inspired from "npm traverse" which is too slow.
 * This version should be simpler and faster.
 * also inspired from http://stackoverflow.com/a/722732/587407
 *
 * Note : Does NOT handle loops
 * Note : Does NOT traverse newly added subtrees (should not happen, not designed for that)
 */

// if node.js : use amdefine (add it with npm)
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
	'lodash',
	'./get-set'
],
function(_, get_set) {
	'use strict';

	/** deep-traverse given object, and call given processingFunc for each *non-traversable* value
	 */
	function traverse_associative_array(object, processingFunc) {
		_.forOwn(object, function (value, key, object) {
			if (_.isObject(value)) {
				// going on step down in the object tree
				traverse_associative_array(value, processingFunc);
			}
			else if (_.isArray(value)) {
				// going on step down in the object tree
				traverse_array(value, processingFunc);
			}
			else {
				var replaceFunc = function replace(newVal) {
					object[key] = newVal;
				};
				processingFunc.call(this, value, replaceFunc);
			}
		});
	}

	/** deep-traverse given array, and call given processingFunc for each *non-traversable* value
	 */
	function traverse_array(array, processingFunc) {
		_.forEach(array, function (value, index, array) {
			if (_.isObject(value)) {
				// going on step down in the object tree
				traverse_associative_array(value, processingFunc);
			}
			else if (_.isArray(value)) {
				// going on step down in the object tree
				traverse_array(value, processingFunc);
			}
			else {
				var replaceFunc = function replace(newVal) {
					array[index] = newVal;
				};
				processingFunc.call(this, value, replaceFunc);
			}
		});
	}

	return traverse_associative_array;
});
