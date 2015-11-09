// if node.js : use amdefine (add it with npm)
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
	'lodash'
],
function(_) {
	'use strict';

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
				if (! path_element)
					throw new Error('simplyconfig get/set invalid path "' + path + '" !');
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

			var path_elements = path.split(separator);

			for(var i = 0; i < path_elements.length; ++i) {
				var path_element = path_elements[i];
				if (! path_element)
					throw new Error('simplyconfig get/set invalid path "' + path + '" !');
				if (i === (path_elements.length - 1))
					object[path_element] = value;
				else
					object[path_element] = object[path_element] || {};
				object = object[path_element];
			}
		}
	};
});
