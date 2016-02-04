'use strict';

const Bluebird = require('bluebird');
const jsforce = require('jsforce');
const merge = require('merge');

const DEFAULT_CONNECTION_CONFIG = {
  maxConnectionTime: 6 * 60 * 60 * 1000, // 6 hours
  username: null,
  password: null,
  connection: {},
};

// "Private" keys
const _maxConnectionTime = Symbol('maxConnectionTime');
const _connection = Symbol('connection');
const _connectionPromise = Symbol('connectionPromise');
const _initializedAt = Symbol('initializedAt');
const _config = Symbol('config');

/**
 * @class Connection
 * @classdesc A Salesforce connection object, responsible for managing
 * salesforce connection sessions
 */
class Connection {

  /**
   * Create a connection
   * @param {Object} config - The configuration object
   * @param {number} [config.maxConnectionTime=21600000] - The maximum amount
   * of time (in ms) that the connection should go on until it should be
   * refreshed. Defaults to 6 hours.
   * @param {string} config.username - The username
   * @param {string} config.password - The password
   * @param {Object} config.connection - The connection object to pass to the
   * jsforce Connection constructor.
   * @return {Connection} The connection object
   */
  constructor(config) {
    config = merge.recursive(true, DEFAULT_CONNECTION_CONFIG, config);

    this[_maxConnectionTime] = config.maxConnectionTime;
    this[_connection] = new jsforce.Connection(config.connection);
    this[_config] = config;

    this.invalidateConnection();
  }

  /**
   * @name Connection#getConnection
   * @function
   * @description Gets the current connection, or create a new one if the
   * current connection doesn't exist or is invalid
   * @returns {Promise} resolves to the raw jsforce connection object
   */
  getConnection() {
    if (this.hasValidConnection) return this[_connectionPromise];

    let username = this[_config].username;
    let password = this[_config].password;

    this[_initializedAt] = Date.now();

    this[_connectionPromise] = Bluebird.resolve()
      .then(() => this[_connection].login(username, password))
      .then(() => this[_connection])
      .catch((err) => {
        this.invalidateConnection();
        throw err;
      });

    return this[_connectionPromise];
  }

  /**
   * @name Connection#invalidateConnection
   * @function
   * @description Invalidates the current connection. The next time
   * getConnection is called, it will create a new salesforce connection
   * @returns {null} doesn't return anything
   */
  invalidateConnection() {
    this[_initializedAt] = null;
  }

  /**
   * @name Connection#_hasValidConnection
   * @member {boolean}
   * @private
   * @description returns whether or not the current connection is valid or not.
   */
  get hasValidConnection() {
    if (!this[_connectionPromise] || !this[_initializedAt]) return false;
    if (this.connectionLength > this[_maxConnectionTime]) return false;

    return true;
  }

  /**
   * @name Connection#connectionLength
   * @member {number}
   * @description returns the amount of time (in ms) that the current connection
   * has been alive
   */
  get connectionLength() {
    if (!this[_initializedAt]) return 0;
    return Date.now() - this[_initializedAt];
  }

}

module.exports = Connection;
