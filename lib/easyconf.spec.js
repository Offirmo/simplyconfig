var path = require('path');
var easyconf = require('./easyconf');

describe('easyconf', function () {

	describe('read', function () {

		describe('get()', function () {

			describe('with no key', function () {

				it('should return the whole aggregated config', function () {
					var config = easyconf.create()
					.add({
						foo: 42
					})
					.add({
						bar: 7
					});

					expect(config.get()).to.deep.equal({
						bar: 7,
						foo: 42
					});
				});

				it('should work on an empty config', function () {
					var config = easyconf.create();

					expect(config.get()).to.deep.equal({});
				});

			});

			describe('with a simple key', function () {

				it('should work on an empty config', function () {
					var config = easyconf.create();

					expect(config.get('foo')).to.be.undefined;
				});

				it('should correctly access an initialized entry', function () {
					var config = easyconf.create()
						.add({
							foo: 42
						});

					expect(config.get('foo')).to.equal(42);
				});

				it('should correctly access an uninitialized entry', function () {
					var config = easyconf.create()
						.add({
							foo: 42
						});

					expect(config.get('bar')).to.be.undefined;
				});
			});

			describe('with a deep key', function () {

				context('with default separator', function () {
					it('should work on an empty config', function () {
						var config = easyconf.create();

						expect(config.get('foo:bar:baz')).to.be.undefined;
					});

					it('should correctly access an initialized entry', function () {
						var config = easyconf.create()
							.add({
								foo: {
									bar: {
										baz: 33
									}
								}
							});

						expect(config.get('foo:bar:baz')).to.equal(33);
					});

					it('should correctly access an uninitialized entry', function () {
						var config = easyconf.create()
							.add({
								foo: {}
							});

						expect(config.get('foo:bar:baz')).to.be.undefined;
					});
				});

				context('with an alternate separator', function () {
					it('should work on an empty config', function () {
						var config = easyconf.create({
							separator: '.'
						});

						expect(config.get('foo.bar.baz')).to.be.undefined;
					});

					it('should correctly access an initialized entry', function () {
						var config = easyconf.create({
							separator: '.'
						})
						.add({
							foo: {
								bar: {
									baz: 33
								}
							}
						});

						expect(config.get('foo.bar.baz')).to.equal(33);
					});

					it('should correctly access an uninitialized entry', function () {
						var config = easyconf.create({
							separator: '.'
						})
						.add({
							foo: {}
						});

						expect(config.get('foo.bar.baz')).to.be.undefined;
					});
				});

			});

		});

	});

	describe('write', function () {

		describe('add()', function () {

			describe('with objects', function () {

				it('should accept an object', function () {
					var test_data = {
						foo: {
							bar: 42
						}
					};
					var config = easyconf
						.create()
						.add(test_data);

					expect(config.get()).to.deep.equal(test_data);

					expect(config.get('foo')).to.deep.equal(test_data.foo);
					expect(config.get('foo')).to.not.equal(test_data.foo); // not the same object, was copied
				});

				it('should accept another instance of easyconf', function () {
					var test_data = {
						foo: {
							bar: 42
						}
					};

					var config_parent = easyconf
						.create()
						.add(test_data);

					var config_child = easyconf
						.create()
						.add(config_parent);

					expect(config_child.get()).to.deep.equal(test_data);
				});

				it('when accepting another instance of easyconf, should import stores 1 by 1', function () {
					var test_data = {
						foo: {
							bar: 42
						}
					};
					var test_data2 = {
						foo: {
							bar: 33
						}
					};

					var config_parent = easyconf
						.create()
						.add(test_data)
						.add('../tests/fixtures/case01_oldschool/config.json');

					var config_child = easyconf
						.create()
						.add(config_parent)
						.add(test_data2);

					expect(config_child.get()).to.deep.equal({
						foo: {
							bar: 33
						},
						'defaultUrl': {
							'port': 9101,
							'protocol': 'http',
							'hostname': 'localhost'
						}
					});

					// inspect internals
					expect(config_child._stores, 'stores count').to.have.length(3);
					expect(config_child._stores[0].data, 'inherited store #1')
						.to.deep.equal(config_parent._stores[0].data);
					expect(config_child._stores[1].data, 'inherited store #2')
						.to.deep.equal(config_parent._stores[1].data);
				});
			});

			describe('with files', function () {

				describe('with config as .json', function () {

					it('should be able to load it with full path', function () {
						var config = easyconf
							.create()
							.add(path.join(
								__dirname,
								'../tests/fixtures/case01_oldschool/config.json'
							));

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
					});

					it('should be able to load it with relative path', function () {
						var config = easyconf
							.create()
							.add('../tests/fixtures/case01_oldschool/config.json');

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
					});

					it('should be able to load it with a env+local pattern - case 1 "development" by default', function () {
						var config = easyconf
							.create()
							.add('../tests/fixtures/case01_oldschool/config.json', {pattern: 'env+local'});

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 8101,
								'protocol': 'http',
								'hostname': '192.168.3.1'
							}
						});
					});

					it('should be able to load it with a env+local pattern - case 2 "development" explicit', function () {
						var config = easyconf
							.create()
							.add({
								env: 'development'
							})
							.add('../tests/fixtures/case01_oldschool/config.json', {pattern: 'env+local'});

						expect(config.get()).to.deep.equal({
							env: 'development',
							'defaultUrl': {
								'port': 8101,
								'protocol': 'http',
								'hostname': '192.168.3.1'
							}
						});
					});

					it('should be able to load it with a env+local pattern - case 3 "production" explicit', function () {
						var config = easyconf
							.create()
							.add({
								env: 'production'
							})
							.add('../tests/fixtures/case01_oldschool/config.json', {pattern: 'env+local'});

						expect(config.get()).to.deep.equal({
							env: 'production',
							'defaultUrl': {
								'port': 9101,
								'protocol': 'https',
								'hostname': 'acme.eu'
							}
						});
					});
				});

				describe('with config as a node module', function () {
					it('should be able to load it with full path', function () {
						var config = easyconf
							.create()
							.add(path.join(
								__dirname,
								'../tests/fixtures/case02_js_node/config.js'
							));

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
					});

					it('should be able to load it from an intermediate module', function () {
						var config = require('../tests/fixtures/case04_js_node_intermediate_config');

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 8101,
								'protocol': 'http',
								'hostname': '192.168.3.1'
							}
						});
					});

					it('should recognize an exported easyconf and add it as such', function () {
						var config = easyconf
							.create()
							.add('../tests/fixtures/case04_js_node_intermediate_config');

						var temp = config.get();
						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 8101,
								'protocol': 'http',
								'hostname': '192.168.3.1'
							}
						});
					});
				});

				describe('with config as an AMD module', function () {
					it('should be able to load it with full path', function () {
						var config = easyconf
							.create()
							.add(path.join(
								__dirname,
								'../tests/fixtures/case03_js_amd/config.js'
							));

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
					});

					it('should be able to load it with relative path', function () {
						var config = easyconf
							.create()
							.add('../tests/fixtures/case03_js_amd/config.js');

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
					});
				});
			});

			describe('with env', function () {

				it('should add env vars to the config root, except if path-ed', function () {
					var config = easyconf
						.create()
						.add('env');

					expect(config.get('PATH'), 'PATH')
						.to.exist;
					expect(config.get('NODEJS__server__port'), 'NODEJS__server__port')
						.to.not.exist; // since it's obviously a path to a config key
					expect(config.get('FOO_API_KEY'), 'FOO_API_KEY')
						.to.equal('27A13');
					expect(config.get('BAR_API_KEY'), 'BAR_API_KEY')
						.to.equal('A312');
				});

				it('should allow to place loaded env vars', function () {
					var config = easyconf
						.create()
						.add('env', { root: 'foo:bar' });

					// none should exist at root
					expect(config.get('PATH'))
						.to.not.exist;
					expect(config.get('NODEJS__server__port'))
						.to.not.exist;
					expect(config.get('FOO_API_KEY'))
						.to.not.exist;
					expect(config.get('BAR_API_KEY'))
						.to.not.exist;

					// but should exist
					expect(config.get('foo:bar:PATH'), 'foo:bar:PATH')
						.to.exist;
					expect(config.get('foo:bar:NODEJS__server__port'), 'foo:bar:NODEJS__server__port')
						.to.not.exist; // since it's obviously a path to a config key
					expect(config.get('foo:bar:FOO_API_KEY'), 'foo:bar:FOO_API_KEY')
						.to.equal('27A13');
					expect(config.get('foo:bar:BAR_API_KEY'), 'foo:bar:BAR_API_KEY')
						.to.equal('A312');
				});

				it('should allow to whitelist loaded env vars', function () {
					var config = easyconf
						.create()
						.add('env', { whitelist: [ 'PATH', 'BAR_API_KEY' ] });

					expect(config.get('PATH')).to.exist;
					expect(config.get('FOO_API_KEY')).to.not.exist; ///< important
					expect(config.get('BAR_API_KEY')).to.equal('A312');
				});

				describe('expansion of specially formatted env vars to proper config values', function () {

					it('should work', function () {
						var config = easyconf
							.create()
							.add('env');

						expect(config.get('server')).to.deep.equal({
							port: '1234'
						});
						expect(config.get('NODEJS__server__port')).to.not.exist; // since matched as special value
						expect(config.get('FOO__server__port')).to.equal('2345'); // didn't match
						expect(config.get('NODEJSxxxserverxxxport')).to.equal('3456'); // didn't match
					});

					it('should allow a custom separator', function () {
						var config = easyconf
							.create()
							.add('env', {
								separator: 'xxx'
							});

						expect(config.get('server')).to.deep.equal({
							port: '3456'
						});
						expect(config.get('NODEJSxxxserverxxxport')).to.not.exist; // since matched as special value
						expect(config.get('NODEJS__server__port')).to.equal('1234'); // didn't match
						expect(config.get('FOO__server__port')).to.equal('2345'); // didn't match
					});

					it('should allow a custom prefix', function () {
						var config = easyconf
							.create()
							.add('env', {
								prefix: 'FOO'
							});

						expect(config.get('server')).to.deep.equal({
							port: '2345'
						});
						expect(config.get('FOO__server__port')).to.not.exist; // since matched as special value
						expect(config.get('NODEJS__server__port')).to.equal('1234'); // didn't match
						expect(config.get('NODEJSxxxserverxxxport')).to.equal('3456'); // didn't match
					});

				});

				it('should allow all features at once', function () {
					var config = easyconf
						.create({ separator: '*' })
						.add('env', {
							root: 'foo*bar',
							whitelist: [ 'PATH', 'BAR_API_KEY' ]
						});

					expect(config.get('PATH')).to.not.exist;
					expect(config.get('FOO_API_KEY')).to.not.exist;
					expect(config.get('BAR_API_KEY')).to.not.exist;

					expect(config.get('foo*bar*PATH')).to.exist;
					expect(config.get('foo*bar*FOO_API_KEY')).to.not.exist;
					expect(config.get('foo*bar*BAR_API_KEY')).to.equal('A312');
				});

			});

			describe('store management', function () {

				it('should add a new store and properly deep extend previous stores', function () {
					var config = easyconf
					.create()
					.add({
						key1: {
							foo: 'bar'
						},
						key1R: {
							foo: 'bar'
						},
						deep: {
							very_deep: {
								key1: {
									bar: 'baz'
								},
								key1R: {
									bar: 'baz'
								}
							}
						}
					})
					.add({
						key2: 42,
						key2R: 42,
						deep: {
							very_deep: {
								key2: 33,
								key2R: 33,
							}
						}
					})
					.add({
						key1R: 'foo',
						key2R: {
							hello: 'world'
						},
						deep: {
							very_deep: {
								key1R: 333,
								key2R: {
									nuoc: 'mam'
								}
							}
						}
					});

					expect(config.get()).to.deep.equal({
						key1: {
							foo: 'bar'
						},
						key1R: 'foo',
						key2: 42,
						key2R: {
							hello: 'world'
						},
						deep: {
							very_deep: {
								key1: {
									bar: 'baz'
								},
								key1R: 333,
								key2: 33,
								key2R: {
									nuoc: 'mam'
								}
							}
						}
					});
				});
			});

			describe.only('values expansion', function () {

				it('should not match single %', function () {
					var config = easyconf
						.create()
						.add({
							foo: 'TVA 5%'
						});

					expect(config.get()).to.deep.equal({
						foo: 'TVA 5%'
					});
				});

				context('when %key% can be resolved', function () {

					// REM : those tests should be run with preset env vars
					it('should correctly replace a %key% referencing an env var', function () {
						var config = easyconf
							.create()
							.add({
								foo: '%FOO_API_KEY%',
								bar: {
									value: '%BAR_API_KEY%-%FOO_API_KEY%'
								},
								// and inside an array
								arr: [{
									value: '%BAR_API_KEY%-%FOO_API_KEY%'
								}]
							});

						expect(config.get()).to.deep.equal({
							foo: '27A13',
							bar: {
								value: 'A312-27A13'
							},
							arr: [{
								value: 'A312-27A13'
							}]
						});
					});

					it('should correctly replace a %key% referencing a previously existing key', function () {
						var config = easyconf
							.create()
							.add({
								foo: 'schtroumpf',
								bar: {
									value: 42
								}
							})
							.add({
								refs: {
									foo: '%foo%',
									foo_bar: '%foo% - %bar.value%',
									arr: [{
										foo_bar: '%foo% - %bar.value%'
									}]
								}
							});

						expect(config.get()).to.deep.equal({
							foo: 'schtroumpf',
							bar: {
								value: 42
							},
							refs: {
								foo: 'schtroumpf',
								foo_bar: 'schtroumpf - 42',
								arr: [{
									foo_bar: 'schtroumpf - 42'
								}]
							}
						});
					});

					it('should correctly replace a %key% referencing a key in the same store store', function () {
						var config = easyconf
							.create()
							.add({
								foo: 'schtroumpf',
								bar: {
									value: 42
								},
								refs: {
									foo: '%foo%',
									bar_value: '%bar.value%',
									arr: [{
										foo_bar: '%foo% - %bar.value%'
									}]
								}
							});

						expect(config.get()).to.deep.equal({
							foo: 'schtroumpf',
							bar: {
								value: 42
							},
							refs: {
								foo: 'schtroumpf',
								bar_value: '42',
								arr: [{
									foo_bar: 'schtroumpf - 42'
								}]
							}
						});
					});

					it('should not chain-replace a %key% referencing another expandable value', function () {
						var config = easyconf
							.create()
							.add({
								foo: 'schtroumpf',
								bar: {
									value: 42
								},
								refs: {
									foo: '%foo%',
									foo_foo: '%refs.foo%'
								}
							});

						expect(config.get()).to.deep.equal({
							foo: 'schtroumpf',
							bar: {
								value: 42
							},
							refs: {
								foo: 'schtroumpf',
								foo_foo: '%foo%', // was not chain-replaced. This is too much a smell.
							}
						});
					});

					it('should correctly replace multiple %key% in the same value', function () {
						var config = easyconf
							.create()
							.add({
								foo: 'schtroumpf',
								bar: {
									value: 42
								},
								refs: {
									complex: 'toto:%foo%+%bar.value%.end'
								}
							});

						expect(config.get()).to.deep.equal({
							foo: 'schtroumpf',
							bar: {
								value: 42
							},
							refs: {
								complex: 'toto:schtroumpf+42.end'
							}
						});
					});

					it('should avoid loops', function () {
						var config = easyconf
							.create()
							.add({
								foo: {
									bar: '%foo.bar%'
								}
							});

						expect(config.get()).to.deep.equal({
							foo: {
								bar: '%foo.bar%' // no replacement
							}
						});
					});
				});

				context('when %key% cant be resolved', function () {

					it('should replace %key% by undefined if value = "%key%" only', function () {
						var config = easyconf
							.create()
							.add({
								foo: {
									bar: 42,
									arr: [{
										bar: 42
									}]
								}
							})
							.add({
								foo: {
									bar: '%baz%',
									arr: [{
										bar: '%baz%'
									}]
								}
							});

						expect(config.get()).to.deep.equal({
							foo: {
								bar: 42,
								arr: [{
									bar: 42
								}]
							}
						});
					});

					it('should leave %key% if value != "%key%" only', function () {
						var config = easyconf
							.create()
							.add({
								foo: {
									bar: 42,
									arr: [{
										bar: 42
									}]
								}
							})
							.add({
								foo: {
									bar: 'http://%baz%',
									arr: [{
										bar: 'http://%baz%',
									}]
								}
							});

						expect(config.get()).to.deep.equal({
							foo: {
								bar: 'http://%baz%',
								arr: [{
									bar: 'http://%baz%',
								}]
							}
						});
					});

				});

			});

		});
	});
});
