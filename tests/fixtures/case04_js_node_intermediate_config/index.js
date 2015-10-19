'use strict';

var easyconf = require('../../../lib/easyconf');

var config = easyconf.create().add('../case01_oldschool/config.json', {pattern: 'env+local'});

module.exports = config;
