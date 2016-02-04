'use strict';

const objectUtils = require('./object-utils');
const isObject = objectUtils.isObject;
const objectReduce = objectUtils.objectReduce;

function flatten(obj, isLeaf, prefix) {
  prefix = prefix || '';
  isLeaf = isLeaf || cannotNest;

  return objectReduce(obj, (attrs, value, key) => {
    let subPrefix = ''.concat(prefix, key);
    let reachedLeaf = isLeaf(value, subPrefix);

    if (isObject(reachedLeaf)) {
      value = reachedLeaf;
      reachedLeaf = true;
    }

    let subObj = reachedLeaf || cannotNest(value)
      ? { [subPrefix]: value }
      : flatten(value, isLeaf, `${subPrefix}.`);

    return Object.assign(attrs, subObj);
  }, {});
}

function cannotNest(value) {
  return !(isObject(value) || Array.isArray(value));
}

module.exports = flatten;
