'use strict';

const merge = require('merge');
const assert = require('../utils/assert');
const flatten = require('../utils/flatten');
const objectUtils = require('../utils/object-utils');
const isObject = objectUtils.isObject;

const DEFAULT_CONFIG = {
  columnKey: 'column',
  refKey: 'ref',
};

/**
 * @function Schema.normalizeAttributes
 */
function normalizeAttributes(attributes, config) {
  config = merge(true, DEFAULT_CONFIG, config);

  return flatten(attributes, (field, prefix) => {
    return normalizeField(prefix, field, config);
  });
}

function normalizeField(key, value, config) {
  let columnKey = config.columnKey;
  let refKey = config.refKey;

  // If the field is true, make the key the column.
  // If the field is a string, make the string value the column.
  if (value === true) value = { [columnKey]: key };
  else if (typeof value === 'string') value = { [columnKey]: value };

  // If it's not an object, it's not a valid definition
  assert(isObject(value), `'${key}' has an invalid definition`);

  // there is no column or ref, it's not a field definition
  if (!value[columnKey] && !value[refKey]) return false;

  // convert '$column' to 'column'
  if (value[columnKey] && columnKey !== DEFAULT_CONFIG.columnKey) {
    value[DEFAULT_CONFIG.columnKey] = value[columnKey];
    delete value[columnKey];
  }

  // convert '$ref' to 'ref'
  if (value[refKey] && refKey !== DEFAULT_CONFIG.refKey) {
    value[DEFAULT_CONFIG.refKey] = value[refKey];
    delete value[refKey];
  }

  return merge(true, value);
}

module.exports = normalizeAttributes;
