'use strict';

const merge = require('merge');
const flatten = require('../utils/flatten');
const objectUtils = require('../utils/object-utils');
const objectReduce = objectUtils.objectReduce;
const objectMap = objectUtils.objectMap;

// const VALID_OPERATORS = [
//   '$like',
//   '$eq',
//   '$ne',
//   '$gt',
//   '$gte',
//   '$lt',
//   '$lte',
//   '$in',
//   '$nin',
// ];

module.exports = function normalizeQuery(query, definition) {
  query = merge.recursive({
    where: null,
    select: null,
    limit: null,
    sort: null,
    skip: null,
    include: null,
  }, query);

  if (!query.select) { query.select = defaultSelect(definition); }

  query.select = normalizeSelect(query.select, definition);
  query.where = normalizeWhere(query.where, definition);

  return query;
};

function defaultSelect(definition) {
  return Object.keys(definition.fields).reduce((select, fieldPath) => {
    select[fieldPath] = true;
    return select;
  }, {});
}

function normalizeSelect(select, definition) {
  select = select || {};

  if (typeof select === 'string') {
    select = select.replace(', ', ' ').split(' ');
  }

  if (Array.isArray(select)) {
    select = select.reduce((newSelect, key) => {
      newSelect[key] = true;
      return newSelect;
    }, {});
  }

  return objectReduce(flatten(select), (newSelect, val, key) => {
    if (definition.fields[key]) {
      newSelect[key] = val;
      return newSelect;
    }
    // Turn the key into a regex
    let keyRegexStr = key
      .replace('.', '\\.')
      .replace('*', '.*');
    let keyRegex = new RegExp(`^${keyRegexStr}`);

    objectMap(definition.fields, (defVal, defKey) => {
      if (!keyRegex.test(defKey)) { return; }
      newSelect[defKey] = val;
    });
    return newSelect;
  }, {});
}

function normalizeWhere(where, definition) {
  where = where || {};
  return flatten(where, (field) => {
    let keys = Object.keys(field);

    return keys.some((key) => key.charAt(0) === '$');
  });
}
