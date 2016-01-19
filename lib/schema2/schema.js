'use strict';

const merge = require('merge');
const normalizeAttributes = require('./normalize-attributes');

// private properties
const _objectName = Symbol('objectName');
const _attributes = Symbol('attributes');

class Schema {

  constructor(objectName, attributes, config) {
    attributes = merge(true, attributes);
    config = merge(true, config);

    this[_objectName] = objectName;
    this[_attributes] = normalizeAttributes(attributes, config);
  }

  get objectName() { return this[_objectName]; }
  get attributes() { return merge(true, this[_attributes]); }

}

module.exports = Schema;
