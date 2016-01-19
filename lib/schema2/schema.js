'use strict';

const assert = require('../utils/assert');
const merge = require('merge');
const normalizeAttributes = require('./normalize-attributes');
const isFunction = require('../utils/is-function');
const isObject = require('../utils/is-object');
const mapObject = require('../utils/map-object');

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
    assert(isFunction(method), `Schema.method: second argument is not a function`);
    this[_methods][name] = method;
    return this;
  }

  static(name, val) {
    this[_statics][name] = val;
    return this;
  }

  extendStatic(obj) {
    mapObject(this[_statics], (key, value) => {
      if (isFunction(value)) { value = value.bind(obj); }
      if (Array.isArray(value) || isObject(value)) { value = merge(true, value); }
      obj[key] = value;
    });
  }

  extendInstance(obj) {
    mapObject(this[_methods], (key, value) => {
      obj[key] = value.bind(obj);
    });
  }
}

module.exports = Schema;
