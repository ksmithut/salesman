'use strict';

const assert = require('assert');
const merge = require('merge');
const isObject = require('../utils/is-object');

const DEFAULT_CONFIG = {
  columnKey: 'column',
  refKey: 'ref',
};

/**
 * @function Schema.normalizeAttributes
 */
function normalizeAttributes(attributes, config, prefix) {
  prefix = prefix || '';
  return Object.keys(attributes).reduce((attrs, key) => {
    let value = attributes[key];
    let subPrefix = prefix + key;
    let field = normalizeField(subPrefix, value, config);
    // If field is truthy, make an object keyed by the prefix
    // otherwise, recurse to normalizeAttributes
    let properties = field
      ? { [subPrefix]: field }
      : normalizeAttributes(value, config, `${subPrefix}.`);

    return Object.assign(attrs, properties);
  }, {});
}

/**
 * @function Schema.normalizeField
 */
function normalizeField(key, value, config) {
  config = merge(true, DEFAULT_CONFIG, config);

  let columnKey = config.columnKey;
  let refKey = config.refKey;

  // If the field is true, make the key the column.
  // If the field is a string, make the string value the column.
  if (value === true) {
    value = { [columnKey]: key };
  } else if (typeof value === 'string') {
    value = { [columnKey]: value };
  }

  // If it's not an object, it's not a valid definition
  assert(isObject(value), `salesman: '${key}' has an invalid definition`);

  // there is no column or ref, it's not a field definition
  if (!value[columnKey] && !value[refKey]) { return false; }

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

  return merge(true, value, {});
}

module.exports = normalizeAttributes;
