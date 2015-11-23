Hierarchical configuration for modern node.js apps. loads :
* files
* environment variables
* command-line arguments
* plain objects
* dot-env


# TL;DR
Replacement to [nconf](https://github.com/indexzero/nconf) with extra features :

* :star: loads everything that nconf can load, and more :
  * :star2: loads from plain json, plain js files, node modules and AMD modules (i.e. you can add comments to your config and lint it with eslint/jshint)
  * load with a relative path
  * :sparkles: integrated support for patterned config (`config.json` -> `config.development.json` -> `config.development.local.json`) 
  * offers value expansion (from env vars + other values)
  * :sparkling_heart: integrated `.env` loading for modern devops
* :dizzy: clearer API : only one `.add(...)` function, which deep extends former key/values
* integrated %extension% in config values
* nconf-like access with customizable separator, or plain associative array access
* :soon: debug feature to know how config was built and where config entries come from

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
  * manually by calling `.add('ENV')`. simplyconfig will automatically expand keys, like `NODE__FOO__BAR=baz` giving the `foo.bar : 'baz'` key-value entry in config.
4. `.add('ARGV')`
5. `.add('config.json', {pattern: 'ENV+local'})` (see below for this convenient pattern)
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


## Real-life example



## extra

### files

### env

### args






# TOSORT

Real story
- duplicate
- comments
- nconf not clear
- allow relative file (avoid path manipulations)


1. allow to use .js for storing data (allows comments and linting)
2. keep config simple
3. extend / default
4. no surprise
5. auto-extend env vars


var simplyconfig = require('simplyconfig');

var config = simplyconfig.create()

	// parent
	.add('../../common/config')

	// us
	.add('./config.js', {pattern: 'env+local'})

	// env vars
	.add('env')

	// args
	.add('args');


module.exports = config.get(); // endpoint config : exports the raw data


create_config().extending(require(…)).with(…)


'use strict';

// TODO

priority
fallbacks

inherits
env
locale
local




default to development

symfony transforme automatiquement SYMFONY__POSTGRES__USER => %postgres.user%

