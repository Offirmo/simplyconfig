// node-only file

var easyconf = require('./lib/easyconf');

var dotenv = require('dotenv');
dotenv.config({silent: true});

module.exports = easyconf;
module.exports.dotenv = dotenv;
