// if node.js : use amdefine (add it with npm)
if (typeof define !== 'function') { var define = require('amdefine')(module); }

/** deep get/set
 * strongly inspired by :
 * *
 * * https://github.com/mariocasciaro/object-path
 */
define([
	'lodash'
],
function(_) {
	'use strict';

	function is_positive_integer(str) {
		// thank you http://stackoverflow.com/a/175787/587407
		return (str !== '' && !isNaN(str));
	}

	return {
		get: function (object, path, separator) {
			// Undef params are allowed, the aim of this lib is to be permissive.
			// However, clear invocation errors should be reported to ease troubleshooting.
			// Order of below tests matters.
			if (typeof object === 'undefined')
				return undefined;
			if (typeof object !== 'object')
				throw new Error('simplyconfig get/set get() object is not an object !');
			if (typeof separator === 'undefined')
				separator = '.'; // sane default
			if (typeof separator !== 'string')
				throw new Error('simplyconfig get/set get() separator is not a string !');
			if (typeof path === 'undefined')
				return object; // the whole object, considering path = nothing => root
			if (path === '')
				return object; // idem
			if (typeof path !== 'string')
				throw new Error('simplyconfig get/set get() path is not a string !');

			var path_elements = path.split(separator);

			for(var i = 0; i < path_elements.length; ++i) {
				var path_element = path_elements[i];
				if (! path_element) {
					// compatibility with nconf : allow empty segments.
					// But I add a log since it's most likely a bug
					// TOREVIEW
					//console.warn('simplyconfig get : suspicious path using an empty segment "' + path + '"');
				}
				if (! object.hasOwnProperty(path_element)) return undefined; // ends here

				object = object[path_element];
			}

			return object;
		},
		set: function (object, path, value, separator) {
			// the aim of this lib is to be permissive.
			// However, clear invocation errors should be reported to ease troubleshooting.
			// Order of below tests matters.
			if (typeof object !== 'object')
				throw new Error('simplyconfig get/set set() object is not an object !');
			if (typeof separator === 'undefined')
				separator = '.'; // sane default
			if (typeof separator !== 'string')
				throw new Error('simplyconfig get/set set() separator is not a string !');
			if (! path)
				throw new Error('simplyconfig get/set set() with blank path : cant replace oneself !');
			if (typeof path !== 'string')
				throw new Error('simplyconfig get/set set() path is not a string !');

			var path_segments = path.split(separator);

			var length = path_segments.length;
			_.forEach(path_segments, function(path_segment, index) {
				if (! path_segment) {
					// compatibility with nconf : allow empty segments.
					// But I add a log since it's most likely a bug :
					// XXX TOREVIEW
					//console.warn('simplyconfig set : suspicious path using an empty segment "' + path + '"');
				}

				if (index === (path_segments.length - 1)) {// last one
					object[path_segment] = value;
					return;
				}

				if(_.isUndefined(object[path_segment])) {
					// create it as an object or an array, depending on
					// what the next segment cue us.
					var next_path_segment = path_segments[index + 1];
					if(is_positive_integer(next_path_segment))
						object[path_segment] = [];
					else
						object[path_segment] = {};
				}

				object = object[path_segment];
			});
		}
	};
});
