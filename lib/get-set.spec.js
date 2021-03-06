var _ = require('lodash');
var get_set = require('./get-set');

describe('get-set', function () {
	var get = get_set.get;
	var set = get_set.set;

	describe('get()', function () {
		var test_data;

		beforeEach(function () {
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

		it('should return the whole object if path param is empty', function () {
			var test_data = {foo: 42};
			expect(get(test_data, '')).to.equal(test_data);
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

		it('should throw if path is malformed', function () {
			expect(function () {
				get({}, 'foo..bar');
			}).to.not.throw();

			var o = {
				foo: {
					'': {
						bar: 42
					}
				}
			};

			expect(get(o, 'foo..bar')).to.equal(42);
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

		// very convenient
		it('should handle arrays seemlessly', function () {
			var o1 = {
				foo: [
					,
					{
						bar: 42
					}
				]
			};
			expect(get(o1, 'foo.1.bar')).to.equal(42);

			expect(get(o1, 'foo.1.2')).to.be.undefined;
		});
	});

	describe('set()', function () {

		it('should throw if object param is not an object', function () {
			expect(function () {
				set('whatever');
			}).to.throw();
		});

		it('should throw if path param is not a string', function () {
			expect(function () {
				set({}, 42);
			}).to.throw();
		});

		it('should throw if path param is empty', function () {
			expect(function () {
				set({}, '', 42);
			}).to.throw();
		});

		it('should throw if separator param is neither undefined not an string', function () {
			expect(function () {
				set({}, 'foo', 42, 33);
			}).to.throw();
		});

		// compatibility with nconf
		it('should handle empty path segments', function () {
			expect(function () {
				set({}, 'foo..bar', 42);
			}).to.not.throw();

			var o = {};
			set(o, 'foo..bar', 42);

			expect(o).to.deep.equals({
				foo: {
					'': {
						bar: 42
					}
				}
			});
		});

		// very convenient
		it('should handle integer segments as array indexes', function () {
			var o1 = {};
			set(o1, 'foo.1.bar', 42);
			expect(o1, 'nominal case').to.deep.equal({
				foo: [
					, // array with hole
					{
						bar: 42
					}
				]
			});
			expect(o1.foo[1].bar, 'nominal case bis').to.equal(42);

			// check that "numberish" are not mistaken as indexes
			var o2 = {};
			set(o2, 'foo.1b..bar', 42);
			expect(o2, 'tricky case').to.deep.equal({
				foo: {
					'1b': {
						'': {
							bar: 42
						}
					}
				}
			})

		});

		_.forEach({
			'id': 0,
			'l1.id': 1,
			'l1.l2.id': 2,
			'l1.l2.l3.id': 3,
			'l1.l2.l3.l4.id': 4,
			'l1.l2.l3.l4.l5.id': 5
		}, function(value, path) {
			it('should set correctly for path "' + path + '"', function() {
				var data = {
					foo: {
						bar: 42
					},
					l1: {
						l2: {
							gloups: 'gnokman'
						}
					}
				};
				set(data, path, value);
				expect(get(data, path)).to.equal(value);
				// check it has not broken other data
				expect(get(data, 'foo.bar')).to.equal(42); // no shared path
				expect(get(data, 'l1.l2.gloups')).to.equal('gnokman'); // shared path
			});
		});
	})
});
