'use strict';

const assert = require('assert');

module.exports = exports = function salemanAssert(condition, message) {
  assert(condition, `salesman: ${message}`);
};

class SalesmanError extends Error {

  constructor(message) {
    super(`salesman: ${message}`);
    Error.captureStackTrace(this, this.constructor);
    this.message = `salesman: ${message}`;
  }

  get name() {
    return this.constructor.name;
  }

}

exports.SalesmanError = SalesmanError;
