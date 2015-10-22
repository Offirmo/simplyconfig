var _ = require('lodash');
var traverse = require('./traverse');

describe.only('traverse', function () {

	it('should call function on each leaf', function () {
		var o = {
			foo:"bar",
			arr: [1, 2, 3],
			subo: {
				foo2:"bar2"
			}
		};

		traverse(o, function(key, value, get_set) {
			console.log(value);
		});

	});

});
