// if node.js : use amdefine (add it with npm)
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
	'lodash',
	'path',
	'callsite'
],
function(_, path, callsite) {
	'use strict';

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
			// most likely a file
			//console.log('working on file :', this.source, this.options.calldir);

			// harmonize path
			var target_absolute_path = this.source;
			if(! path.isAbsolute(target_absolute_path)) {
				var caller_site = callsite()[2 + (this.options.callsite_shift || 0)];
				var calldir = this.options.calldir || path.dirname(caller_site.getFileName());
				target_absolute_path = path.join( calldir, target_absolute_path );
			}
			this.file_full_path = target_absolute_path;

			if(path.basename(target_absolute_path) === 'environmentalist.json')
				this._load_from_env();
			else
				this._load_from_file();
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
		var data = non_throwing_require(this.file_full_path);
		if(data === null) {
			var err = new Error('easyconf store : couldn’t find the given file "' + this.file_full_path + '" !');
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

	////////////////////////////////////

	Store.prototype._load_from_another_store = function(store) {
		// copy final data only
		this.description    = store.description;
		this.data           = store.data;
		this.file_full_path = store.file_full_path;
	};

	return Store;
});
