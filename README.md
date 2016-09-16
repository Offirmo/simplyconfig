Hierarchical configuration for modern node.js apps.


[![Build Status](https://travis-ci.org/Offirmo/simplyconfig.svg)](https://travis-ci.org/Offirmo/simplyconfig)
[![NPM version](https://badge.fury.io/js/simplyconfig.png)](http://badge.fury.io/js/simplyconfig)
[![Project status](http://img.shields.io/badge/project_status-highly_experimental-red.png)](http://offirmo.net/classifying-open-source-projects-status/)
[![license](http://img.shields.io/badge/license-public_domain-brightgreen.png)](http://unlicense.org/)
[![Gittip](http://img.shields.io/gittip/Offirmo.png)](https://www.gittip.com/Offirmo/)


# TL;DR
Replacement to [nconf](https://github.com/indexzero/nconf) with extra features :
* loads everything that nconf can load, but also plain json, plain js files, node modules and AMD modules (i.e. you can add comments to your config and lint it with eslint/jshint)
* clearer API : only one `.add(...)` function, which deep extends previously added key/values
* load files from a relative path
* nconf-like access with customizable separator, or plain associative array access
* integrated value expansion `%extension%` in config values
* integrated `.env` loading for modern devops
* integrated support for patterned config (`config.json` -> `config.development.json` -> `config.development.local.json`) 

![one_does_not](https://cloud.githubusercontent.com/assets/603503/10567810/30dedd02-760e-11e5-984e-075a60b58633.jpg)

# Use case

Config in a modern node app comes from different source :
* **config files**, usually an associative array, in JSON and under source control
* **[command-line arguments](https://en.wikipedia.org/wiki/Command-line_interface#Arguments)**, usually for quick overrides like `--debug-level=info`
* **[Environment variables](https://en.wikipedia.org/wiki/Environment_variable)** especially for secrets (passwords, API keys), since they MUST NOT be stored in source control
* **.env file**, used by devops as an alternative for passing environment variables. MUST NOT be under source control.

And config data is streamlined like that :

![easyconfig](https://cloud.githubusercontent.com/assets/603503/10567809/30dccf6c-760e-11e5-98c7-dfa095f4d5bc.png)

1. (nothing to do, node does it automatically)
2. `simplyconfig.dotenv.load()` (`simplyconfig.dotenv` being the [motdotla/dotenv](https://github.com/motdotla/dotenv) module, included for your convenience)
3. simplyconfig does it in 2 ways :
  * automatically by detecting and replacing %MY_ENV_VAR% in config values (can be disabled/customized, see below)
  * manually by calling `.add('ENV')`. simplyconfig will automatically expand keys, like `NODEJS__foo__bar=baz` giving the `foo.bar : 'baz'` key-value entry in config.
4. `.add('ARGV')`
5. `.add('config.json', {pattern: 'env+local'})` (see below for this convenient pattern)
6. `var config = require('config');` (see below for an example of what `config/index.js` should look like)


# Usage

## Introduction
Using simplyconfig is, as you can guess, easy. Just add key/values,
and each one takes precedence over the previous one (deep extend).

```javascript
var simplyconfig = require('simplyconfig');

var config = simplyconfig
	.create()
	.add({
		env: 'defaults',
		database: {
			host: 'localhost',
			port: 1234
		}
	})
	.add({
		env: 'prod',
		database: {
			host: 'database.foo.io',
		}
	});
	
console.log(config.get()); ->>
	{
		env: 'prod',
		database: {
			host: 'database.foo.io',
			port: 1234
		}
	}
```

Of course there is syntactic sugar for files :

```javascript
var simplyconfig = require('simplyconfig');

var config = simplyconfig
	.create()
	.add('../config/config.json')
	.add('../config/config.development.json');
	.add('../config/config.development.local.json');
```
or even better :
```javascript
var simplyconfig = require('simplyconfig');

var config = simplyconfig
	.create()
	.add({ NODE_ENV: process.env.NODE_ENV || 'development' });
	.add('../config/config.json', { pattern: 'env+local' });
```


## Real-life example

```javascript
'use strict';

var simplyconfig = require('simplyconfig');

/** Load .env into process.env
 */
simplyconfig.dotenv.load({ silent: true });

/** Ensure NODE_ENV is defined
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/** Load and expose configuration.
 */
module.exports = load();
module.exports.load = load;

/** Load configuration for a given environment.
 *
 * @param  {String} env Asked environment, defaults to process.env.NODE_ENV
 * @return {Object}     nconf-like configuration object
 */
function load(env) {
  var config = simplyconfig.create();

  // explicit early definition of NODE_ENV
  config.add({ NODE_ENV: env || process.env.NODE_ENV || 'development' });

  // files
  config.add('../../config/config.json', { pattern: 'env+local' });

  // env vars
  config.add('ENV');

  // args
  config.add('ARGV');

  return config;
}
```

## detailed usage

### immutability
simplyconfig tries hard at immutability, since configuration should not be a dynamic registry
modified everywhere in the code.

Hence :
* a clone of given data is made at insertion. If given object is modified later, it doesn't affect config
* a clone of the config data is returned on get(). If modified, returned object doesn't affect config


### top-level options
Separator for `get()` is `:` by default for nconf compatibility. You can change it :
```javascript
var config =
	easyconf.create({
		separator: '.'
	});

	var x = config.get('foo.bar.baz');
```

### files
Either format are accepted :
* json `config.add('config.json');`
* js `config.add('config.js');`

Patterned : A convenient way to hierarchize config is the following :
* `config.js` <-- safe default
* `config.production.js`, `config.development.js` <-- specialization for a given environment
* `config.development.local.js` <-- developper's local changes, this file should be in `.gitignore`
Each file taking precedence over previous one.

This patter is integrated in simplyconfig : `config.add('config.js', { pattern: 'env+local' });`

For reading the current environment, simplyconfig uses :
```javascript
var env = this.get('NODE_ENV') || process.env.NODE_ENV || 'development';
```

### env
`config.add('ENV');` will :
1. load all env vars at the root of the config (or under `options.root` if provided, see below).
1. expand env vars with key matching a pattern, like this : `NODEJS__foo__bar` being also added as `foo.bar`
1. values are expanded as usual

Default options :
```javascript
{
	whitelist: null,  <-- an array of restricted env vars to pick
	root: '',         <-- where env vars will be added in the config
	prefix: 'NODEJS', <-- prefix for deep env vars
	separator: '__'   <-- separator for deep env vars
}
```

### args
`config.add('ARGV');` will :
1 load and expand command-line arguments exactly like nconf does (using [optimist](https://www.npmjs.com/package/optimist))
1. values are expanded as usual


# TOREVIEW

* warnings for empty paths
* get/set with options
