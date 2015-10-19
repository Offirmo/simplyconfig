Hierarchical configuration for modern node.js apps. Batteries included : json & js files, dot-env, environment variables, command-line arguments… Replacement to [nconf](https://github.com/indexzero/nconf).

![one_does_not](https://cloud.githubusercontent.com/assets/603503/10567810/30dedd02-760e-11e5-984e-075a60b58633.jpg)

TL;DR
=====
* :soon: does everything that nconf does :star:
* clearer API : only one `.add(...)` function , which deep extends former key/values :dizzy:
* suuport config files as plain json, plain js, node modules and AMD modules :star2:
* integrated support for patterned config (config.json -> config.development.json -> config.development.local.json) :sparkles:
* :soon: integrated %extension% in config values
* integrated `.env` loading :sparkling_heart:
* allow nconf-like access, but with customizable separator, or plain associative array access
* :soon: debug feature to know how config was built and where config entries come from


Use case
========
Config in a modern node app comes from different source :
* **config files**, usually an associative array, included in source control
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
4. `.add('ARGS')`
5. `.add('config.json', {pattern: 'ENV+local'})` (see below for this convenient pattern)
6. `require('config');` (see below for an example of what config should look like)


Usage
=======
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
	.add({
		...
	})
	.add('../config/config.json')
	.add('../config/config.production.json');
```


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
	.add('../../../environmentalist.json')

	// args
	.add('../../../environmentalist.json');


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
