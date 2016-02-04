'use strict';

const merge = require('merge');
const arrify = require('arrify');
const normalizeAttributes = require('./normalize-attributes');
const promiseSequence = require('../utils/promise-sequence');
const assert = require('../utils/assert');
const isFunction = require('../utils/is-function');
const objectUtils = require('../utils/object-utils');
const isObject = objectUtils.isObject;
const objectMap = objectUtils.objectMap;

// private properties
const _attributes = Symbol('attributes');
const _statics = Symbol('statics');
const _methods = Symbol('methods');
const _hooks = Symbol('methods');

// private methods
const _getHook = Symbol('getHook');

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
    objectMap(this[_statics], (value, key) => {
      if (isFunction(value)) value = value.bind(obj);
      if (Array.isArray(value) || isObject(value)) value = merge(true, value);
      obj[key] = value;
    });
  }

  extendInstance(obj) {
    objectMap(this[_methods], (value, key) => {
      obj[key] = value.bind(obj);
    });
  }

  [_getHook](name) {
    this[_hooks][name] = this[_hooks][name] || { pre: [], post: [] };
    return this[_hooks][name];
  }

  pre(name, method) {
    assert(isFunction(method), `Schema.pre: second argument is not a function`);
    this[_getHook](name).pre.push(method);
    return this;
  }

  post(name, method) {
    assert(isFunction(method), `Schema.post: second argument is not a function`);
    this[_getHook](name).post.push(method);
    return this;
  }

  callHook(name, value, fn, context) {
    let names = arrify(name).slice().reverse();
    let methods = names.reduce((hookMethods, hookName) => {
      let hooks = this[_getHook](hookName);

      return [].concat(hooks.pre, hookMethods, hooks.post);
    }, [ fn ]);

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
