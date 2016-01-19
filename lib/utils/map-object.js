'use strict';

module.exports = function mapObject(obj, fn) {
  return Object.keys(obj).map((key, i) => fn(key, obj[key], i, obj));
};
