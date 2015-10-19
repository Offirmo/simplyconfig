// this file exists only to be in a different path than easyconf
// to *really* test the auto-relative path feature.

var path = require('path');
var easyconf = require('../lib/easyconf');

describe('easyconf from another path', function () {

	describe('write', function () {

		describe('add()', function () {

			describe('with files', function () {
				describe('with config as .json', function () {
					it('should be able to load it with relative path', function () {
						var config = easyconf.create();
						config.add('./fixtures/case01_oldschool/config.json');

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
					});
				});

				describe('with config as a node module', function () {
					it('should be able to load it with relative path', function () {
						var config = easyconf
							.create()
							.add('./fixtures/case02_js_node/config.js');

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
					});
				});

				describe('with config as an AMD module', function () {
					it('should be able to load it with relative path', function () {
						var config = easyconf
							.create()
							.add('./fixtures/case03_js_amd/config.js');

						expect(config.get()).to.deep.equal({
							'defaultUrl': {
								'port': 9101,
								'protocol': 'http',
								'hostname': 'localhost'
							}
						});
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
			});

		});
	});

});
