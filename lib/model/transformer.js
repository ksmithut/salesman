'use strict';

const objectPath = require('object-path');
const set = objectPath.set;
const get = objectPath.get;

const _attributes = Symbol('attributes');
const _rawAttributes = Symbol('rawAttributes');

class Transformer {

  constructor(attributes, column) {
    this[_rawAttributes] = {};
    this[_attributes] = Object.keys(attributes).reduce((attrs, key) => {
      let val = column
        ? attributes[key][column]
        : attributes[key];

      attrs.push({ key, val });
      this[_rawAttributes][key] = val;
      return attrs;
    }, []);
  }

  format(input, fill) {
    fill = typeof fill === 'undefined' || fill;
    return this[_attributes].reduce((output, attr) => {
      let val = get(input, attr.val);

      if (fill || typeof val !== 'undefined') set(output, attr.val, get(input, attr.key, null));
      return output;
    }, {});
  }

  unformat(input, fill) {
    fill = typeof fill === 'undefined' || fill;
    return this[_attributes].reduce((output, attr) => {
      let val = get(input, attr.val);

      if (fill || typeof val !== 'undefined') set(output, attr.key, get(input, attr.val, null));
      return output;
    }, {});
  }

  formatKeys(input) {
    return Object.keys(input).reduce((output, key) => {
      let val = input[key];

      if (this[_rawAttributes][key]) {
        output[this[_rawAttributes][key]] = val;
      } else {
        let keyRegexStr = key
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.+');
        let keyRegex = new RegExp(`^${keyRegexStr}`);

        this[_attributes]
          .filter((attr) => keyRegex.test(attr.key))
          .forEach((attr) => {
            output[attr.val] = val;
          });
      }

      return output;
    }, {});
  }

}

module.exports = Transformer;
