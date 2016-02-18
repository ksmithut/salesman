'use strict';

const Bluebird = require('bluebird');
const assert = require('./utils/assert');
const SalesmanError = require('./utils/error');
const Connection = require('./connection');
const Schema = require('./schema');
const Model = require('./model');

/**
 * @class Salesman
 * @classdesc A Salesforce connection pool instance that manages multiple
 * tentants and model/schema definitions.
 */

class Salesman {

  constructor() {
    this.models = {};
  }

  /**
   * @function Salesman#connect
   * @returns {Promise} Resolves when all connections have been esablished
   */
  connect(config) {
    if (this.connection) return Bluebird.reject(new SalesmanError('A connection has already been initialized'));

    Object.defineProperty(this, 'connection', {
      value: new Connection(config),
    });

    return this.connection.getConnection().return();
  }

  /**
   * @function Salesman#model
   * @param {string} name - The name of the model
   * @param {Schema} schema - The schema to convert into a model
   * @returns {Salesman} The salesman instance
   */
  model(name, schema) {
    assert(schema instanceof Schema, `Non-Schema passed to salesman.model: ${name}`);

    this.models[name] = new Model(schema, this);

    return this.models[name];
  }

  /**
   * @function Saleman#getModel
   * @param {string} modelName - The model name to retrieve
   * @returns {Promise} resolves to tenants module
   */
  getModel(modelName) {
    assert(this.models[modelName], `'${modelName}' is not a valid model`);

    return this.models[modelName];
  }

}

module.exports = Salesman;
