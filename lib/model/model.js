'use strict';

// "Private" keys
const _schema = Symbol('schema');

/**
 * @class Model
 * @classdesc A Model definition. This consumes a Schema and implements it with
 * any number of salesforce.
 */
class Model {

  /**
   * Creates a new Model
   * @param {Object} schema - The schema object
   * @param {Object} schema.attributes - The schema's attributes
   * @param {Object} schema.hooks - The hook methods to tie into the model
   * @param {Object} schema.methods - The methods to attach to each instance
   * @param {Object} schema.statics - The static methods to attach to the model
   * @param {Object} connection - The connection object for the model.
   * @returns {Model} the new model object
   */
  constructor(schema, connection) {
    this[_schema] = {
      attributes: schema.attributes,
      hooks: schema.hooks,
      methods: schema.methods,
      statics: schema.statics,
    };

    // TODO add the static methods to the model instance
  }

  /**
   * @function Model#create
   * @returns {Promise}
   */
  create() {

  }

  /**
   * @function Model#find
   * @returns {Promise}
   */
  find() {

  }

  /**
   * @function Model#update
   * @returns {Promise}
   */
  update() {

  }

  /**
   * @function Model#delete
   * @returns {Promise}
   */
  delete() {

  }

}

module.exports = Model;
