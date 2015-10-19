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

		// environmentalist spec file
		//< Note : FOO_API_KEY & BAR_API_KEY env vars should have been set before calling ths test file !
		// (see npm test in package.json)
		{
			title: 'an environmentalist spec file referenced by absolute path',
			source: path.join(__dirname, '../tests/fixtures/environmentalist_ok/environmentalist.json'),
			options: undefined,
			expected_data: {
				FOO_API_KEY: '27A13',
				BAR_API_KEY: 'A312',
				bar_api_key: 'A312', // alias of BAR_API_KEY
				NODE_ENV: undefined,
				env: undefined // alias of NODE_ENV
			},
			expected_description: 'environmentalist spec and corresponding env vars'
		},
		{
			title: 'an environmentalist spec file referenced by relative path',
			source: '../tests/fixtures/environmentalist_ok/environmentalist.json',
			options: undefined,
			expected_data: {
				FOO_API_KEY: '27A13',
				BAR_API_KEY: 'A312',
				bar_api_key: 'A312', // alias of BAR_API_KEY
				NODE_ENV: undefined,
				env: undefined // alias of NODE_ENV
			},
			expected_description: 'environmentalist spec and corresponding env vars'
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


	describe('with environmentalist spec file', function () {

		it('should report missing env vars by throwing', function () {
			function test_expression () {
				var store = new Store(
					'../tests/fixtures/environmentalist_nok/environmentalist.json'
				);
			}

			expect(test_expression).to.throw('easyconf store : Missing required env vars !');
		});

		it('when asked not to throw, should report missing env vars through an error property', function () {
			var store;
			function test_expression () {
				store = new Store(
					'../tests/fixtures/environmentalist_nok/environmentalist.json',
					{ nothrow: true }
				);
			}

			expect(test_expression).to.not.throw;
			test_expression();
			expect(store.error).to.exist;
			expect(store.error.message).to.equal('easyconf store : Missing required env vars !');
		});

	});


	describe('on a missing file', function () {

		it('should report missing file by throwing', function () {
			function test_expression () {
				var store = new Store(
					'foo/bar'
				);
			}

			expect(test_expression).to.throw(/easyconf store : couldn’t find the given file/);
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
			expect(store.error.message).to.match(/easyconf store : couldn’t find the given file/);
		});

	});

});
