'use strict';

const assert = require('../utils/assert');
const merge = require('merge');
const normalizeAttributes = require('./normalize-attributes');
const promiseSequence = require('./promise-sequence');
const isFunction = require('../utils/is-function');
const isObject = require('../utils/is-object');
const mapObject = require('../utils/map-object');

// private properties
const _attributes = Symbol('attributes');
const _statics = Symbol('statics');
const _methods = Symbol('methods');
const _hooks = Symbol('methods');

// private methods
const _initHookName = Symbol('initHookName');

class Schema {

  constructor(objectName, attributes, config) {
    attributes = merge(true, attributes);
    config = merge(true, config);

    this[_attributes] = normalizeAttributes(attributes, config);
    this[_statics] = {};
    this[_methods] = {};
    this[_hooks] = {};

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

  [_initHookName](name) {
    if (!this[_hooks][name]) {
      this[_hooks][name] = { pre: [], post: [] };
    }
  }

  pre(name, method) {
    assert(isFunction(method), `Schema.pre: second argument is not a function`);
    this[_initHookName](name);
    this[_hooks][name].pre.push(method);
    return this;
  }

  post(name, method) {
    assert(isFunction(method), `Schema.post: second argument is not a function`);
    this[_initHookName](name);
    this[_hooks][name].post.push(method);
    return this;
  }

  callHook(name, value, fn, context) {
    this[_initHookName](name);
    let methods = [].concat(
      this[_hooks][name].pre,
      fn,
      this[_hooks][name].post
    );

    return promiseSequence(methods, value, context);
  }

  plugin(pluginFunc, config) {
    assert(isFunction(pluginFunc), `Schema.plugin: first argument is not a plugin`);
    config = isObject(pluginFunc.defaultConfig)
      ? merge.recursive(true, pluginFunc.defaultConfig, config)
      : config;

    pluginFunc(this, config);
    return this;
  }

}

module.exports = Schema;
