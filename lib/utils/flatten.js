'use strict';

const objectUtils = require('./object-utils');
const isObject = objectUtils.isObject;
const objectReduce = objectUtils.objectReduce;

function flatten(obj, isLeaf, prefix) {
  if (!canNest(obj)) {
    prefix = prefix.substr(0, prefix.length - 1);
    return { [prefix]: obj };
  }

  prefix = prefix || '';
  isLeaf = isLeaf || canNest;
  return objectReduce(obj, (attrs, value, key) => {
    let subPrefix = ''.concat(prefix, key);
    let reachedLeaf = isLeaf(value, subPrefix);

    if (isObject(reachedLeaf)) {
      value = reachedLeaf;
      reachedLeaf = true;
    }

    let subObj = reachedLeaf
      ? { [subPrefix]: value }
      : flatten(value, isLeaf, `${subPrefix}.`);

    return Object.assign(attrs, subObj);
  }, {});
}

function canNest(value) {
  return isObject(value) || Array.isArray(value);
}

module.exports = flatten;
