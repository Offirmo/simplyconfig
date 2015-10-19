// if node.js : use amdefine (add it with npm)
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define({
	'defaultUrl': {
		'port': 9101,
		'protocol': 'http',
		'hostname': 'localhost'
	}
});
