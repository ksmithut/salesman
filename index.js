'use strict';

var Schema = require('./lib/schema');
var Salesman = require('./lib/salesman');

module.exports = exports = new Salesman();

exports.Schema = Schema;
exports.Salesman = Salesman;
