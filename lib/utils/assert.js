'use strict';

const assert = require('assert');

module.exports = function salemanAssert(condition, message) {
  assert(condition, `salesman: ${message}`);
};
