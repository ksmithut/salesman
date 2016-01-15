'use strict';

const merge = require('merge');
const objectPath = require('object-path');

const DEFAULT_CONFIG = {
  columnKey: 'column',
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
   * @param {Object} [config] - The config object
   * @param {string} [config.columnKey='column'] - The column key to use to get
   * @param {Mixed} [config.defaultValue=null] - The default value to place on
   * object properties when the source object doesn't have a value. This should
   * be `null` or `undefined`
   * @returns {Transformer} the new transformer object
   */
  constructor(attributes, config) {
    this[_attributes] = merge(true, attributes);
    this[_config] = merge.recursive(true, DEFAULT_CONFIG, config);
  }

  /**
   * @function Transformer#format
   * @param {Object} obj - The object to format
   * @param {boolean} unformat - if set to true, it will do the opposite of
   * formatting, taking an object who's keys are the column definitions, and
   * turn them around to the key paths.
   * @returns {Object} the formatted object
   */
  format(obj, unformat) {
    let defaultValue = this[_config].defaultValue;
    let columnKey = this[_config].columnKey;

    return Object.keys(this[_attributes]).reduce((newObj, key) => {
      let column = this[_attributes][key][columnKey];
      let setKey = key;
      let getKey = column;

      if (unformat) {
        setKey = column;
        getKey = key;
      }

      objectPath.set(newObj, setKey, objectPath.get(obj, getKey, defaultValue));
      return newObj;
    }, {});
  }

  /**
   * @function Transformer#unformat
   * @param {Object} obj - The object to unformat
   * @returns {Object} the unformatted object
   */
  unformat(obj) {
    return this.format(obj, true);
  }

}

module.exports = Transformer;
