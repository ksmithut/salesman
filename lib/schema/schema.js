'use strict';

const assert = require('assert');
const merge = require('merge');

const COLUMN_KEY = 'column';
const DEFAULT_CONFIG = {
  columnKey: COLUMN_KEY,
};

// "Private" keys
const _attributes = Symbol('attributes');
const _hooks = Symbol('hooks');
const _methods = Symbol('methods');
const _statics = Symbol('statics');

/**
 * @class Schema
 * @classdesc A Schema definition. This is used to set up what will be the
 * model. This will primarily be a static definition that is to be referred to
 * whenever the model gets changed.
 */
class Schema {

  /**
   * Creates a new Schema
   * @param {Object} attributes - The fields to be mapped out to the salesforce
   * object properties.
   * @param {Object} [config] - Additional configuration
   * @param {string} [config.columnKey='column'] - The key to use to determine
   * the column name
   * @returns {Schema} the new schema object
   */
  constructor(attributes, config) {
    config = merge.recursive(true, DEFAULT_CONFIG, config);
    attributes = merge(true, attributes);

    this[_attributes] = Schema.normalizeAttributes(attributes, config);
    this[_hooks] = {};
    this[_methods] = {};
    this[_statics] = {};
  }

  /**
   * @name Schema#path
   * @function
   * @description Allows you get get/set the configuration for a specific field
   * @param {string} fieldPath - The fieldPath to be retrieved/set
   * @param {Object} [definition] - If not passed, the function will act as a
   * getter. This must be an object when used in the path definition.
   * @returns {Object} The new full path definition
   */
  path(fieldPath, definition) {
    let attributes = this[_attributes];
    let field = attributes[fieldPath];

    if (typeof definition === 'undefined') { return field ? merge(true, field) : null; }

    assert(definition && typeof definition === 'object' && !Array.isArray(definition), `salesman: invalid field definition in schema.path() call. Must pass an object, given: ${definition}`);

    if (field) {
      assert(!definition.hasOwnProperty(COLUMN_KEY), `salesman: you cannot override the '${COLUMN_KEY}' property of an already defined field: ${fieldPath}`);
      merge.recursive(field, definition);
      return merge(true, field);
    }

    let newDefinition = Schema.normalizeField(fieldPath, definition);

    assert(newDefinition, `salesman: invalid field definition given in schema.path() call: ${fieldPath}`);

    // Check to make sure that we're not setting over an existing path.
    // e.g. if someone calls `schema.path('foo')`, when there is already a
    // path `foo.bar`, that should fail.
    Object.keys(attributes).forEach((key) => {
      assert(fieldPath.indexOf(key) !== 0, `salesman: invalid path: ${key} cannot be extended to ${fieldPath}`);
      assert(key.indexOf(fieldPath) !== 0, `salesman: invalid path: ${key} cannot be reduced to ${fieldPath}`);
    });

    this[_attributes][fieldPath] = newDefinition;

    return merge(true, this[_attributes][fieldPath]);
  }

  /**
   * @name Schema#method
   * @function
   * @description Adds an instance methods to the schema
   * @param {string} methodName - The method name
   * @param {function} method - The actual function to add
   * @returns {Schema} The schema object
   */
  method(methodName, method) {
    assert(typeof method === 'function', `salesman: invalid method: ${methodName} is not a function`);

    this[_methods][methodName] = method;

    return this;
  }

  /**
   * @name Schema#static
   * @function
   * @description Adds an instance methods to the schema
   * @param {string} methodName - The method name
   * @param {function} method - The actual function to add
   * @returns {Schema} The schema object
   */
  static(methodName, method) {
    assert(typeof method === 'function', `salesman: invalid static method: ${methodName} is not a function`);

    this[_statics][methodName] = method;

    return this;
  }

  /**
   * @name Schema#pre
   * @function
   * @description Attaches a pre hook to the given hook name.
   * @param {string} hookName - The hook name to tie into
   * @param {function} hookMethod - The hook method to put on the stack of hooks
   * @returns {Schema} The schema object
   */
  pre(hookName, hookMethod) {
    assert(typeof hookMethod === 'function', `salesman: invalid hook method given in pre '${hookName}'`);

    this[_hooks][hookName] = this[_hooks][hookName] || { pre: [], post: [] };
    this[_hooks][hookName].pre.push(hookMethod);

    return this;
  }

  /**
   * @name Schema#post
   * @function
   * @description Attaches a pre hook to the given hook name.
   * @param {string} hookName - The hook name to tie into
   * @param {function} hookMethod - The hook method to put on the stack of hooks
   * @returns {Schema} The schema object
   */
  post(hookName, hookMethod) {
    assert(typeof hookMethod === 'function', `salesman: invalid hook method given in post '${hookName}'`);

    this[_hooks][hookName] = this[_hooks][hookName] || { pre: [], post: [] };
    this[_hooks][hookName].post.push(hookMethod);

    return this;
  }

  /**
   * @name Schema#attributes
   * @description The attributes object of the schema
   * @member {Object}
   */
  get attributes() {
    return merge(true, this[_attributes]);
  }

  /**
   * @name Schema#hooks
   * @description The hooks object of the schema
   * @member {Object}
   */
  get hooks() {
    return merge(true, this[_hooks]);
  }

  /**
   * @name Schema#methods
   * @description The methods object of the schema
   * @member {Object}
   */
  get methods() {
    return merge(true, this[_methods]);
  }

  /**
   * @name Schema#statics
   * @description The static methods object of the schema
   * @member {Object}
   */
  get statics() {
    return merge(true, this[_statics]);
  }

  /**
   * @name Schema.normalizeAttributes
   * @function
   * @description Normalizes attribute defnitions
   * @param {Object} attributes - The attributes to normalize
   * @param {Object} config - The configuration for the normalization
   * @param {string} [config.columnKey] - The key to use for columns
   * @param {string} [prefix] - The prefix to use for keys. It's is only used
   * for recursion.
   * @returns {Object} the normalized attributes
   */
  static normalizeAttributes(attributes, config, prefix) {
    config = config || {};
    prefix = prefix || '';

    let definition = {};

    Object.keys(attributes).forEach((key) => {
      let val = attributes[key];
      let field = Schema.normalizeField(key, val, config.columnKey);

      let properties = field
        ? { [prefix + key]: field }
        : Schema.normalizeAttributes(val, config, prefix + key + '.');

      Object.assign(definition, properties);
    });

    return definition;
  }

  /**
   * @name Schema.normalizeField
   * @function
   * @description Normalizes a field definition
   * @param {string} key - The key of the field path
   * @param {mixed} val - The possible field definition
   * @param {string} [columnKey='column'] - The column key to use to see if a
   * column exists
   * @returns {(boolean|Object)} - Returns false if it is not a field definition
   * or returns the normalized field definition as an object.
   */
  static normalizeField(key, val, columnKey) {
    columnKey = columnKey || COLUMN_KEY;

    if (val === true) {
      val = { [columnKey]: key };
    } else if (typeof val === 'string') {
      val = { [columnKey]: val };
    }

    assert(val && typeof val === 'object' && !Array.isArray(val), `salesman: '${key}' has an invalid definition`);

    if (!val[columnKey]) { return false; }

    if (columnKey !== COLUMN_KEY) {
      val.column = val[columnKey];
      delete val[columnKey];
    }

    return merge(true, val);
  }

}

module.exports = Schema;
