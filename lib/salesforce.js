'use strict';

const assert = require('assert');
const merge = require('merge');
const Connection = require('./connection');

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
 * @class Salesforce
 * @classdesc A Salesforce connection pool instance that manages multiple
 * tentants and model/schema definitions.
 */

class Salesforce {

  constructor() {
    this[_init] = new Promise((resolve, reject) => {
      this[_initCb] = (err) => {
        if (err) { return reject(err); }
        resolve();
      };
    });

    this[_models] = {};
  }

  /**
   * @function Salesforce#connect
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
      return Promise.reject(new Error('salesman: A connection has already been initialized'));
    }

    config = merge.recursive(true, DEFAULT_CONFIG, config);

    // Initialize the tenants
    this[_tenants] = Object.keys(config.tenants).reduce((tenants, key) => {
      let tenantConfig = merge.recursive(true, config.defaults, config.tenant[key]);

      tenants[key] = new Connection(tenantConfig);
      return tenants;
    }, {});

    // Promise to resolve all of the tenants
    this[_configurePromise] = Promise.resolve()
      .then(() => {
        // Make sure that the default tenant exists
        assert(this[_tenants][config.defaultTenant], `salesman: '${config.defaultTenant}' is not a valid tenant`);
        this[_defaultTenant] = config.defaultTenant;
      })
      // Make an initial connection to the salesforce tenants
      .all(Object.keys(this[_tenants]).map((key) => {
        return this[_tenants][key].getConnection();
      }))
      .then(() => this[_initCb]())
      .catch(this[_initCb]);

    return this[_configurePromise];
  }

  /**
   * @function Salesforce#getTenant
   * @param {string} [tenant] - The tenant key to use to get the connection
   * @returns {Promise} Resolves to the connection object of the given tenant.
   */
  getTenant(tenant) {
    return this[_init].then(() => {
      return this[_tenants][tenant] || this[_tenants][this[_defaultTenant]];
    });
  }

  /**
   * @function Salesforce#model
   * @param {string} name - The name of the model
  model(name, schema) {

  }

}

module.exports = Salesforce;
