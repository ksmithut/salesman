'use strict';

const Transformer = require('./transformer');

// "Private" keys
const _schema = Symbol('schema');
const _connection = Symbol('connection');
const _callHook = Symbol('callHook');
const _sobject = Symbol('sobject');
const _transformer = Symbol('transformer');

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
      tableName: schema.tableName,
      attributes: schema.attributes,
      hooks: schema.hooks,
      methods: schema.methods,
      statics: schema.statics,
    };
    this[_connection] = connection;

    // add the static methods to the model instance
    Object.keys(this[_schema].statics).forEach((methodName) => {
      this[methodName] = this[_schema].statics[methodName].bind(this);
    });

    // Initialize transformer
    this[_transformer] = new Transformer(this[_schema.attributes]);
  }

  /**
   *
   */
  get tableName() {
    return this[_schema].tableName;
  }

  /**
   *
   */
  [_callHook](name) {
    let hooks = this[_schema].hooks[name] || { pre: [], post: [] };

  }

  /**
   *
   */
  [_sobject]() {
    return this[_connection].getConnection()
      .then((conn) => conn.sobject(this.tableName));
  }

  /**
   *
   */
  describe() {
    return this[_sobject]()
      .then((sobject) => sobject.describe$());
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
