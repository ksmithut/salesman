'use strict';

const Bluebird = require('bluebird');

/**
 * @function promiseSequence
 * @param {function[]} functions - The array of functions to call in sequence
 * @param {Mixed} value - The value to pass through to all of the functions
 * @param {Mixed} context - The context in which to call of the functions
 * @returns {Promise} Returns a promise which resolves to the value (possibly
 * modified by the middleware functions).
 */
module.exports = function promiseSequence(functions, value, context) {
  return Bluebird.reduce(functions, (val, method) => {
    return Bluebird
      .resolve(method.call(context, val))
      .then((returnedValue) => {
        return typeof returnedValue === 'undefined' ? val : returnedValue;
      });
  }, value);
};
