'use strict';

const assert = require('assert');
const merge = require('merge');
const normalizeAttributes = require('./normalize-attributes');
const isFunction = require('../utils/is-function');

// private properties
const _attributes = Symbol('attributes');
const _statics = Symbol('statics');
const _methods = Symbol('methods');

class Schema {

  constructor(objectName, attributes, config) {
    attributes = merge(true, attributes);
    config = merge(true, config);

    this[_attributes] = normalizeAttributes(attributes, config);
    this[_statics] = {};
    this[_methods] = {};

    Object.defineProperties(this, {
      objectName: { value: objectName },
    });
  }

  get attributes() { return merge(true, this[_attributes]); }

  method(name, method) {
    assert(isFunction(method), `method is not a function`);
    this[_methods][name] = method;
  }

  static(name, val) {
    this[_statics][name] = val;
  }

  extendStatic(obj) {
    return Object.assign(obj, this[_statics]);
  }

  extendInstance(obj) {
    return Object.assign(obj, this[_methods]);
  }
}

module.exports = Schema;
