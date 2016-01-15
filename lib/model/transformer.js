'use strict';

const merge = require('merge');
const objectPath = require('object-path');

const DEFAULT_CONFIG = {
  defaultValue: null,
};

// "Private" keys
const _attributes = Symbol('attributes');
const _config = Symbol('config');

/**
 * @class Transformer
 * @classdesc A Transformer defnition. This is used to transform data from the
 * user defined model to the salesforce model, and back again.
 */
class Transformer {

  /**
   * Creates a new Transformer
   * @param {Object} attributes - The attributes whos keys are full property
   * paths to nested keys
   * @returns {Transformer} the new transformer object
   */
  constructor(attributes, config) {
    this[_attributes] = merge(true, attributes);
    this[_config] = merge.recursive(true, DEFAULT_CONFIG, config);
  }

  /**
   *
   */
  format(obj) {
    let defaultValue = this[_config].defaultValue;

    return Object.keys(this[_attributes]).reduce((newObj, key) => {
      let column = this[_attributes][key];

      objectPath.set(newObj, column, objectPath.get(obj, key, defaultValue));
      return newObj;
    }, {});
  }

  /**
   *
   */
  unformat(obj) {
    let defaultValue = this[_config].defaultValue;

    return Object.keys(this[_attributes]).reduce((newObj, key) => {
      let column = this[_attributes][key];

      objectPath.set(newObj, key, objectPath.get(obj, column, defaultValue));
      return newObj;
    }, {});
  }

}

module.exports = Transformer;
