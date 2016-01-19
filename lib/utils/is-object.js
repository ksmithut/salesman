'use strict';

module.exports = function isObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
};
