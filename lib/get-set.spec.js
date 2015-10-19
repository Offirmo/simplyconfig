var _ = require('lodash');
var get_set = require('./get-set');

describe('get-set', function () {

	describe('get()', function () {
		var get, test_data;

		beforeEach(function () {
			get = get_set.get;
			test_data = {
				id: 0,
				l1: {
					id: 1,
					l2: {
						id: 2,
						l3: {
							id: 3,
							l4: {
								id: 4,
								l5: {
									id: 5
								}
							}
						}
					}
				}
			}
		});

		it('should return undefined if object param is undefined', function () {
			expect(get(undefined, 'foo')).to.be.undefined;
		});

		it('should return the whole object if path param is undefined', function () {
			var test_data = {foo: 42};
			expect(get(test_data, undefined)).to.equal(test_data);
		});

		it('should throw if object param is neither undefined not an object', function () {
			expect(function () {
				get('whatever');
			}).to.throw();
		});

		it('should throw if path param is neither undefined not an string', function () {
			expect(function () {
				get({}, 42);
			}).to.throw();
		});

		it('should throw if separator param is neither undefined not an string', function () {
			expect(function () {
				get({}, 'foo', 42);
			}).to.throw();
		});

		_.forEach({
			'id': 0,
			'l1.id': 1,
			'l1.l2.id': 2,
			'l1.l2.l3.id': 3,
			'l1.l2.l3.l4.id': 4,
			'l1.l2.l3.l4.l5.id': 5
		}, function(expected_value, path) {
			it('should return the correct value for path "' + path + '"', function() {
				expect(get(test_data, path)).to.equal(expected_value);
			});
		});

		describe('with a non-default separator', function () {
			_.forEach({
				'id': 0,
				'l1:id': 1,
				'l1:l2:id': 2,
				'l1.l2.l3.id': undefined, // wrong path
				'l1:l2:l3.l4.id': undefined, // wrong path
				'l1:l2:l3:l4:l5:id': 5
			}, function(expected_value, path) {
				it('should return the correct value for path "' + path + '"', function() {
					expect(get(test_data, path, ':')).to.equal(expected_value);
				});
			});
		});

	});

});
