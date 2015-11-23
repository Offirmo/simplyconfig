// if node.js : use amdefine (add it with npm)
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
	'path',
	'lodash',
	'optimist',
	'callsite',
	'./polyfills/is-path-absolute',
	'./get-set'
],
function(path, _, optimist, callsite, is_path_absolute, get_set) {
	'use strict';

	var get = get_set.get;
	var set = get_set.set;

	function non_throwing_require(file_path) {
		try {
			return require(file_path);
		}
		catch(e) {
			if(e.code !== 'MODULE_NOT_FOUND')
				console.error('easyconf require error for "' + file_path + '" :', e);
			return null;
		}
	}

	function Store(source, options) {
		// save params
		this.source = source;
		this.options = options || {};

		this.description = ''; //< debugging description of this store

		// final data
		this.data = {}; //< final data
		this.file_full_path = null; //< optional, full resolved path of file read (if .source was a file)

		this.load();
	}

	Store.prototype.explain = function(name) {
		console.log('store ' + name + ' ' + this.description + (this.file_full_path || ''));
		console.log('store ' + name, this.data);
	};

	Store.prototype.load = function() {
		if(this.source instanceof Store) {
			// copy construct
			this._load_from_another_store(this.source);
		}
		else if(_.isObject(this.source)) {
			this._load_from_object(); // direct
		}
		else if(_.isString(this.source)) {
			// file or special pattern

			switch (this.source) {
				case 'ARGV':
					this._load_from_argv();
					break;
				case 'ENV':
					this._load_from_env();
					break;
				default:
					//console.log('working on file :', this.source, this.options.calldir);
					this._load_from_file();
					break;
			}
		}
		else {
			throw new Error('easyconf store load() : unrecognized source !');
		}
	};

	////////////////////////////////////
	Store.prototype._load_from_object = function() {
		// direct, with a copy
		this.data = _.cloneDeep(this.source);
		this.description = 'direct data';
	};

	Store.prototype._load_from_file = function() {

		// harmonize path
		var target_absolute_path = this.source;
		if(! is_path_absolute(target_absolute_path)) {
			this.options._callsite_shift = this.options._callsite_shift || 0;
			// shift =
			// +1 constructor
			// +1 load
			// +1 load from file
			// +n explicitly given by caller
			var caller_site = callsite()[3 + this.options._callsite_shift];
			var calldir = this.options.calldir || path.dirname(caller_site.getFileName());
			target_absolute_path = path.join( calldir, target_absolute_path );
		}
		this.file_full_path = target_absolute_path;

		var data = non_throwing_require(this.file_full_path);
		if(data === null) {
			var err = new Error('easyconf store : couldn’t find the given file "' +
				this.file_full_path + '" !');
			if (! this.options.nothrow)
				throw err;
			else {
				this.error = err;
				return;
			}
		}

		if(data instanceof Store) {
			this._load_from_another_store(data);
			return;
		}

		this.data = _.cloneDeep(data);
		this.description = 'direct file';
	};

	Store.prototype._load_from_env = function() {
		this.data = {};
		this.description = 'env vars';
		var options = _.defaultsDeep(this.options, {
			whitelist: null,
			root: '',
			prefix: 'NODEJS',
			separator: '__'
			// REM _separator is the config global separator
		});

		if (options.root)
			set(this.data, options.root, {}, options._separator);
		var data_root = get(this.data, options.root, options._separator);

		_.forEach(process.env, function (value, key) {
			var splited = key.split(options.separator);

			if (splited.length > 1 && splited[0] === options.prefix) {
				// direct options via env vars bypass whitelist
				// this is expected : too cumbersome to whitelist all pathes
				splited.shift();
				var path = splited.join(options._separator);
				set(data_root, path, value, options._separator);
				return; // no need to add it to root
			}

			if (options.whitelist && ! _.includes(options.whitelist, key)) {
				return; // not in whitelist
			}

			data_root[key] = value;
		});
	};

	Store.prototype._load_from_argv = function() {
		var options = _.defaultsDeep(this.options, {
			// (none)
			// REM _separator is the config global separator
		});
		this.data = {};
		this.description = 'command-line arguments';

		var argv = optimist(process.argv.slice(2)).argv;
		if (! argv) return;

		delete argv._; // used by optimist to store special infos, filter it
		this.data = argv;
	};

	////////////////////////////////////

	Store.prototype._load_from_another_store = function(store) {
		// copy final data only
		this.description    = store.description;
		this.data           = store.data;
		this.file_full_path = store.file_full_path;
	};

	return Store;
});
