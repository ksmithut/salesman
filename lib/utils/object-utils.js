'use strict';

exports.isObject = (obj) => {
  return obj && obj.toString() === '[object Object]';
};

exports.objectMap = (obj, fn) => {
  return Object.keys(obj).map((key) => fn(obj[key], key, obj));
};

exports.objectReduce = (obj, fn, firstVal) => {
  let keys = Object.keys(obj);
  let reduce = keys.reduce.bind(keys, (prev, key) => {
    return fn(prev, obj[key], key, obj);
  });

  if (typeof firstVal === 'undefined') return reduce();
  return reduce(firstVal);
};

exports.objectValues = (obj) => Object.keys(obj).map((key) => obj[key]);

