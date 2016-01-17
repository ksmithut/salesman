'use strict';

const Schema = require('./lib/schema');
const Salesman = require('./lib/salesman');

const salesman = new Salesman();

module.exports = exports = salesman;

exports.Schema = Schema;
exports.Salesman = Salesman;
