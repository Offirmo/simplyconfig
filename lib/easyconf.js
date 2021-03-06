// if node.js : use amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
	'path',
	'lodash',
	'callsite',
	'./traverse',
	'./get-set',
	'./store'
],
function(path, _, callsite, traverse, get_set, Store) {
	'use strict';

	var get = get_set.get;

	var VALUE_EXPANSION_REGEXP = /%(.*?)%/g;

	function Easyconf(options) {
		options = options || {};

		this._I_AM_AN_EASYCONF = true; // marker to break recursion
		this.separator = options.separator || ':';
		this.autodetect_es2015 = _.isBoolean(options.autodetect_es2015) ? options.autodetect_es2015 : false;
		this._stores = [];
		this._aggregated = {};
	}

	////////////////////////////////////
	Easyconf.prototype.get = function(propertyPath) {
		return _.cloneDeep(
			get(this._aggregated, propertyPath, this.separator)
		);
	};

	Easyconf.prototype.explain = function() {
		this._stores.forEach(function(store, index) {
			store.explain('#' + index);
		});
	};

	////////////////////////////////////
	Easyconf.prototype.add = function(source, options) {
		options = options || {};
		if (!_.isObject(options))
			throw new Error('simplyconfig add() bad usage : options !');
		options._callsite_shift = 1;
		options._separator = this.separator;
		options._autodetect_es2015 = this.autodetect_es2015;

		if(source instanceof Easyconf) {
			this._add_easyconf(source);
		}
		else {
			// creates, which includes auto-loading
			var store = new Store(source, options);

			if (store.data._I_AM_AN_EASYCONF === true) {
				this._add_easyconf(store.data);
			}
			else {
				this._add_store(store);
				if (options.pattern)
					this._add_pattern_variants(store);
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

	Easyconf.prototype._add_pattern_variants = function(store) {

		// common processings
		if (! store.file_full_path)
			throw new Error('simplyconfig : patterned source can only be file-based !');
		// get file extension
		var extension = path.extname(store.file_full_path);
		// get the base path (without extension)
		var path_radix = store.file_full_path.slice(0, -extension.length);

		switch(store.options.pattern) {
			case 'env+local':
				// get env
				var env = this.get('NODE_ENV') || process.env.NODE_ENV || 'development';
				//console.log('detecting env from easyconf (env,proc,final)', this.get('env'), process.env.NODE_ENV, env);

				var options = {};
				options._callsite_shift = 2; // one more
				options.nothrow = true; // since the file is optional
				options._separator = this.separator; // inherit
				options._autodetect_es2015 = this.autodetect_es2015; // inherit

				// load the candidates
				// level 1 : env
				var level1_candidate = path_radix + '.' + env + extension;
				var level1_store = new Store(level1_candidate, options);
				//if(level1_store.error) console.warn('easyconf : couldn’t find the given file "' + level1_candidate + '" : ' + level1_store.error.message);
				if(! level1_store.error) this._add_store( level1_store );

				// level 2 : env + local
				var level2_candidate = path_radix + '.' + env + '.local' + extension;
				var level2_store = new Store(level2_candidate, options);
				//if(level2_store.error) console.warn('easyconf : couldn’t find the given file "' + level2_candidate + '" : ' + level2_store.error.message);
				if(! level2_store.error) this._add_store( level2_store );

				break;

			default:
				throw new Error('simplyconfig : unknown pattern "' + store.options.pattern + '" !');
		}
	 };

	////////////////////////////////////

	// simpler alias for add()
	// not recommended, but for nconf compatibility
	Easyconf.prototype.set = function(path, value) {
		var data = {};
		get_set.set(data, path, value, this.separator);
		return this.add(data);
	};

	////////////////////////////////////
	Easyconf.prototype._add_store = function(store) {
		if (! _.isObject(store.data)) throw new Error('simplyconfig internal error [_addStore] !');

		this._stores.push(store);
		this._aggregate_new_data(store.data);
	};

	Easyconf.prototype._aggregate_new_data = function(data) {
		//console.log('aggregating', data, 'into', this._aggregated);

		if (! _.isObject(data)) throw new Error('simplyconfig internal error [_aggregate_new_data] !');

		//console.log('aggregating data', data);
		var previous_data = this._aggregated;
		var unexpanded_data = _.cloneDeep(data);
		var expanded_data = _.cloneDeep(data);
		traverse(expanded_data, function(value, replace) {
			//console.log('traversing ' + value);
			if (!_.isString(value)) return;

			var expanded_value = value;
			var rg = new RegExp(VALUE_EXPANSION_REGEXP);
			var matches = [];

			// pre-match to avoid infinite loops when not replacing
			var done;
			do {
				done = true;
				var match = rg.exec(expanded_value);
				if (match) {
					matches.push(match);
					done = false;
				}
			}
			while (! done);

			_.forEach(matches, function (match) {
				var matched = match[0];
				var key = match[1];
				var expanded = '';
				//console.log(matched, key, process.env[key], get(unexpanded_data, key), get(previous_data, key));

				var found = true;
				find: {
					expanded = get(unexpanded_data, key);
					if (! _.isUndefined(expanded)) break find;

					expanded = get(previous_data, key);
					if (! _.isUndefined(expanded)) break find;

					expanded = process.env[key];
					if (! _.isUndefined(expanded)) break find;

					found = false;
				}
				//console.log('expanded', expanded_value, expanded, matched);
				if (! found) {
					if (expanded_value === matched)
						expanded_value = undefined;
				}
				else
					expanded_value = expanded_value.replace(matched, expanded);
			});

			//console.log('FINAL', value, expanded_value);
			replace(expanded_value);
		});

		this._aggregated = _.defaultsDeep({}, expanded_data, this._aggregated);
		//console.log('\n\nxxx new aggregated :', this._aggregated);
	};


	///////////////////////////////

	return {
		create: function (options) {
			return new Easyconf(options);
		}
	};
});
