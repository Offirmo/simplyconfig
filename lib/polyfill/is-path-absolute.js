'use strict';

var path = require('path');

module.exports = path.isAbsolute || function is_path_absolute(path) {
	if (! path) return false;

	return (path[0] === '/'); // sorry windows
};
