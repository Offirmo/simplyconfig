// if node.js : use amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
	'lodash',
	'./get-set',
	'path',
	'callsite',
	'./store'
],
function(_, get_set, path, callsite, Store) {
	'use strict';
	var get = get_set.get;

	function Easyconf(options) {
		options = options || {};

		this._I_AM_AN_EASYCONF = true; // marker to break recursion
		this.separator = options.separator || ':';
		this._stores = [];
		this._aggregated = {};
	}

	////////////////////////////////////
	Easyconf.prototype.get = function(propertyPath) {
		return get(this._aggregated, propertyPath, this.separator);
	};

	Easyconf.prototype.explain = function() {
		this._stores.forEach(function(store, index) {
			store.explain('#' + index);
		});
	};

	////////////////////////////////////
	Easyconf.prototype.add = function(source, options) {
		options = options || {};

		if(source instanceof Easyconf) {
			this._add_easyconf(source);
		}
		else {
			var store = new Store(source, {callsite_shift: 1});
			if(store.data._I_AM_AN_EASYCONF === true) {
				this._add_easyconf(store.data);
			}
			else {
				this._add_store(store);
				if (options.pattern)
					this._add_pattern_variants(store, options);
			}
		}

		return this;
	};

	Easyconf.prototype._add_easyconf = function (easyconf) {
		// copy stores one by one
		easyconf._stores.forEach(function(store) {
			this._add_store(new Store(store.data)); // copy constructor
		}, this);
	};

	Easyconf.prototype._add_pattern_variants = function(store, options) {

		// common processings
		if (! store.file_full_path)
			throw new Error('easyconf : patterned source can only be file-based !');
		// get file extension
		var extension = path.extname(store.file_full_path);
		// get the base path (without extension)
		var path_radix = store.file_full_path.slice(0, -extension.length);

		switch(options.pattern) {
			case 'env+local':
				// get env
				var env = this.get('env') || process.env.NODE_ENV || 'development';
				//console.log('detecting env from easyconf (env,proc,final)', this.get('env'), process.env.NODE_ENV, env);

				// load the candidates
				// level 1 : env
				var level1_candidate = path_radix + '.' + env + extension;
				var level1_store = new Store(level1_candidate, { callsite_shift: 2, nothrow: true });
				//if(level1_store.error) console.warn('easyconf : couldn’t find the given file "' + level1_candidate + '" : ' + level1_store.error.message);
				if(! level1_store.error) this._add_store( level1_store );

				// level 2 : env + local
				var level2_candidate = path_radix + '.' + env + '.local' + extension;
				var level2_store = new Store(level2_candidate, { callsite_shift: 2, nothrow: true });
				//if(level2_store.error) console.warn('easyconf : couldn’t find the given file "' + level2_candidate + '" : ' + level2_store.error.message);
				if(! level2_store.error) this._add_store( level2_store );

				break;

			default:
				throw new Error('easyconf : unknown pattern "' + this.options.pattern + '" !');
		}
	 };

	////////////////////////////////////
	Easyconf.prototype._add_store = function(store) {
		if (! _.isObject(store.data)) throw new Error('easyconf internal error [_addStore] !');

		this._stores.push(store);

		//console.log('adding conf data', store.data);
		this._aggregated = _.defaultsDeep({}, store.data, this._aggregated);
	};


	return {
		create: function (options) {
			return new Easyconf(options);
		}
	};
});
