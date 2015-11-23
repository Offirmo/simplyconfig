var _ = require('lodash');
var traverse = require('./traverse');

describe('traverse', function () {

	it('should call function on each final leaf', function () {
		var o = {
			foo: 'bar',
			arr: [1, 2, {
				deep: [ 'down' ]
			}],
			subo: {
				foo2: 'bar2'
			}
		};

		var called = [];
		traverse(o, function(value, replace) {
			//console.log(value);
			called.push(value);
		});

		expect(called).to.deep.equal([
			'bar',
			1,
			2,
			'down',
			'bar2'
		]);
	});

	it('should allow to modify each final leaf', function () {
		var o = {
			foo: 'bar',
			arr: [1, 2, {
				deep: [ 'down' ]
			}],
			subo: {
				foo2: 'bar2'
			}
		};

		var i = 100;
		traverse(o, function(value, replace) {
			//console.log(value);
			replace(i++);
		});

		expect(o).to.deep.equal({
			foo: 100,
			arr: [101, 102, {
				deep: [ 103 ]
			}],
			subo: {
				foo2: 104
			}
		});
	});

});
