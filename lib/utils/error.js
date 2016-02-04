'use strict';

module.exports = class SalesmanError extends Error {

  constructor(message) {
    super(`salesman: ${message}`);
    Error.captureStackTrace(this, this.constructor);
    this.message = `salesman: ${message}`;
  }

  get name() {
    return this.constructor.name;
  }

};
