'use strict';

const Bluebird = require('bluebird');
const assert = require('assert');
const merge = require('merge');
const Connection = require('./connection');
const Schema = require('./schema');
const Model = require('./model');

const DEFAULT_CONFIG = {
  defaultTenant: null,
  defaults: {},
  tenants: {},
};

// "Private" Keys
const _tenants = Symbol('tenants');
const _init = Symbol('init');
const _initCb = Symbol('initCb');
const _configurePromise = Symbol('configurePromise');
const _defaultTenant = Symbol('defaultTenant');
const _models = Symbol('models');

/**
 * @class Salesman
 * @classdesc A Salesforce connection pool instance that manages multiple
 * tentants and model/schema definitions.
 */

class Salesman {

  constructor() {
    this[_init] = Bluebird.fromCallback((cb) => this[_initCb] = cb);

    this[_models] = {};
  }

  /**
   * @function Salesman#connect
   * @param {Object} config -
   * @param {Object} config.tenants - An object hash containing the tenant
   * information. Each key is the tenant name, and the properties are the
   * connection options as accepted by the Connection module.
   * @param {string} config.defaultTenant - The default tenant to use if no tenant is
   * given in the getConnection method
   * @param {string} config.defaults - The default connection options to use.
   * @returns {Promise} Resolves when all connections have been esablished
   */
  connect(config) {
    if (this[_configurePromise]) {
      return Bluebird.reject(new Error('salesman: A connection has already been initialized'));
    }

    config = merge.recursive(true, DEFAULT_CONFIG, config);

    // Initialize the tenants
    this[_tenants] = Object.keys(config.tenants).reduce((tenants, key) => {
      let tenantConfig = merge.recursive(true, config.defaults, config.tenants[key]);

      tenants[key] = {
        connection: new Connection(tenantConfig),
        models: {},
      };

      return tenants;
    }, {});

    assert(this[_tenants][config.defaultTenant], `salesman: '${config.defaultTenant}' is not a valid tenant`);

    this[_defaultTenant] = config.defaultTenant;

    // Promise to resolve all of the tenants
    this[_configurePromise] = Bluebird
      // Make an initial connection to the salesforce tenants
      .all(Object.keys(this[_tenants]).map((key) => {
        return this[_tenants][key].connection.getConnection();
      }))
      .then(() => this[_initCb]())
      .catch(this[_initCb]);

    return this[_configurePromise];
  }

  /**
   * @function Salesman#getTenant
   * @param {string} [tenantName] - The tenant key to use to get the connection
   * @returns {Object} return tenant, which has a connection and set of models.
   */
  getTenant(tenantName) {
    return this[_tenants][tenantName] || this[_tenants][this[_defaultTenant]];
  }

  /**
   * @function Salesman#model
   * @param {string} name - The name of the model
   * @param {Schema} schema - The schema to convert into a model
   * @returns {Salesman} The salesman instance
   */
  model(name, schema) {
    assert(schema instanceof Schema, `salesman: Non-Schema passed to salesman.model: ${name}`);

    let schemaExport = schema.export;

    Object.keys(this[_tenants]).forEach((tenantKey) => {
      let tenant = this[_tenants][tenantKey];

      tenant.models[name] = new Model(schemaExport, tenant.connection);
    });

    return this;
  }

  /**
   * @function Saleman#getModel
   * @param {string} modelName - The model name to retrieve
   * @param {string} [tenantName] - The tenant to grab
   * @returns {Promise} resolves to tenants module
   */
  getModel(modelName, tenantName) {
    let tenant = this.getTenant(tenantName);

    assert(tenant.models[modelName], `salesman: '${modelName}' is not a valid model`);

    return tenant.models[modelName];
  }

}

module.exports = Salesman;
