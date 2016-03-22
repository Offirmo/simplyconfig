var path = require('path');
var Store = require('./store');

describe('Store', function () {

	var nominal_cases = [

		// direct object
		{
			title: 'an object',
			source: {
				foo: {
					bar: 42
				}
			},
			options: undefined,
			expected_data: {
				foo: {
					bar: 42
				}
			},
			expected_description: 'direct data'
		},

		// json file
		{
			title: 'a .json file referenced by absolute path',
			source: path.join(__dirname, '../tests/fixtures/case01_oldschool/config.json'),
			options: undefined,
			expected_data: {
				'defaultUrl': {
					'port': 9101,
					'protocol': 'http',
					'hostname': 'localhost'
				}
			},
			expected_description: 'direct file'
		},
		{
			title: 'a .json file referenced by relative path',
			source: '../tests/fixtures/case01_oldschool/config.json',
			options: undefined,
			expected_data: {
				'defaultUrl': {
					'port': 9101,
					'protocol': 'http',
					'hostname': 'localhost'
				}
			},
			expected_description: 'direct file'
		},

		// config as a node module
		{
			title: 'a node module referenced by absolute path',
			source: path.join(__dirname, '../tests/fixtures/case02_js_node/config.js'),
			options: undefined,
			expected_data: {
				'defaultUrl': {
					'port': 9101,
					'protocol': 'http',
					'hostname': 'localhost'
				}
			},
			expected_description: 'direct file'
		},
		{
			title: 'a node module referenced by relative path',
			source: '../tests/fixtures/case02_js_node/config.js',
			options: undefined,
			expected_data: {
				'defaultUrl': {
					'port': 9101,
					'protocol': 'http',
					'hostname': 'localhost'
				}
			},
			expected_description: 'direct file'
		},

		// config as a AMD module
		{
			title: 'an AMD module referenced by absolute path',
			source: path.join(__dirname, '../tests/fixtures/case03_js_amd/config.js'),
			options: undefined,
			expected_data: {
				'defaultUrl': {
					'port': 9101,
					'protocol': 'http',
					'hostname': 'localhost'
				}
			},
			expected_description: 'direct file'
		},
		{
			title: 'an AMD module referenced by relative path',
			source: '../tests/fixtures/case03_js_amd/config.js',
			options: undefined,
			expected_data: {
				'defaultUrl': {
					'port': 9101,
					'protocol': 'http',
					'hostname': 'localhost'
				}
			},
			expected_description: 'direct file'
		},
	];

	nominal_cases.forEach(function(testcase) {

		describe('with ' + testcase.title, function () {
			it('should handle it', function () {
				var store = new Store(testcase.source, testcase.options);

				expect(store.data, 'data').to.deep.equal(testcase.expected_data);
				expect(store.description, 'description').to.deep.equal(testcase.expected_description);
			});

			it('should be clonable', function () {
				var parent_store = new Store(testcase.source, testcase.options);
				var store = new Store(parent_store);

				expect(store.data).to.deep.equal(testcase.expected_data);
				expect(store.description).to.deep.equal(testcase.expected_description);
			});
		});

	});

	describe('on a missing file', function () {

		it('should report missing file by throwing', function () {
			function test_expression () {
				var store = new Store(
					'foo/bar'
				);
			}

			expect(test_expression).to.throw(/simplyconfig store : couldn’t find\/require the given file/);
		});

		it('when asked not to throw, should report missing file through an error property', function () {
			var store;
			function test_expression () {
				store = new Store(
					'foo/bar',
					{ nothrow: true }
				);
			}

			expect(test_expression).to.not.throw;
			test_expression();
			expect(store.error).to.exist;
			expect(store.error.message).to.match(/simplyconfig store : couldn’t find\/require the given file/);
		});

	});

});
