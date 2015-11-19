'use strict';


module.exports = {
	check: check_environmentalist
};


function check_environmentalist() {

}


///////////////////////////////

Store.prototype._load_from_env = function() {
		throw new Error('Load from environmentalist spec is no longer supported !');
		var required_missing = false; // missing required entries, empty so far
		var data = {};
		var environmentalist_spec = non_throwing_require(this.file_full_path);

		environmentalist_spec.forEach(function(env_var_spec) {
			data[env_var_spec.name] = process.env[env_var_spec.name];

			if(env_var_spec.easyconf_alias) {
				data[env_var_spec.easyconf_alias] = data[env_var_spec.name];
			}

			// NO we don't use the "default" environmentalist field
			// since it's not how it works.

			if(env_var_spec.required && _.isUndefined(data[env_var_spec.name])) {
				console.warn('* Missing env var "' + env_var_spec.name + '" (' + env_var_spec.description + '), please define it : export ' + env_var_spec.name + '=...');
				required_missing = true;
			}
		});

		if(required_missing) {
			var err = new Error('easyconf store : Missing required env vars !');
			if (! this.options.nothrow)
				throw err;
			else {
				this.error = err;
				return;
			}
		}

		this.data = data;
		this.description = 'environmentalist spec and corresponding env vars';
	};





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





				//< Note : FOO_API_KEY & BAR_API_KEY env vars should have been set before calling ths test file !
				// (see npm test in package.json)
				describe('with environmentalist spec file', function () {
					it('should be able to load it with full path', function () {
						var config = easyconf.create();
						config.add(path.join(
								__dirname,
								'../tests/fixtures/environmentalist_ok/environmentalist.json'
							));

						var temp = config.get();
						expect(config.get()).to.deep.equal({
							FOO_API_KEY: '27A13',
							BAR_API_KEY: 'A312',
							bar_api_key: 'A312' // alias of BAR_API_KEY
						});
					});

					it('should be able to load it with relative path', function () {
						var config = easyconf
							.create()
							.add('../tests/fixtures/environmentalist_ok/environmentalist.json');

						expect(config.get()).to.deep.equal({
							FOO_API_KEY: '27A13',
							BAR_API_KEY: 'A312',
							bar_api_key: 'A312' // alias of BAR_API_KEY
						});
					});

					it('should report missing env vars and throw', function () {
						function test_expression () {
							var config = easyconf
								.create()
								.add('../tests/fixtures/environmentalist_nok/environmentalist.json');
						}

						expect(test_expression).to.throw('easyconf store : Missing required env vars !');
					});

					it('should report missing env vars but not throw if asked not to', function () {
						function test_expression () {
							var config = easyconf
								.create()
								.add('../tests/fixtures/environmentalist_nok/environmentalist.json', {nothrow: true});
						}

						expect(test_expression).to.not.throw;
					});

				});





				describe('with environmentalist spec file', function () {
					it('should be able to load it with relative path', function () {
						var config = easyconf
							.create()
							.add('./fixtures/environmentalist_ok/environmentalist.json');

						expect(config.get()).to.deep.equal({
							FOO_API_KEY: '27A13',
							BAR_API_KEY: 'A312',
							bar_api_key: 'A312' // alias of BAR_API_KEY
						});
					});
				});


