'use strict';

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
const _hasValidConnection = Symbol('hasValidConnection');
const _initializedAt = Symbol('initializedAt');
const _config = Symbol('config');

/**
 * @class Connection
 * @class A Salesforce connection object, responsible for managing salesforce
 * connection sessions
 */

class Connection {

  constructor(config) {
    config = merge.recursive(true, DEFAULT_CONNECTION_CONFIG, config);

    this[_maxConnectionTime] = config.maxConnectionTime;
    this[_connection] = new jsforce.Connection(config.connection);
    this[_config] = config;
    this[_initializedAt] = null;
  }

  getConnection() {
    if (this[_hasValidConnection]) { return this[_connectionPromise]; }

    let username = this[_config].username;
    let password = this[_config].password;

    this[_initializedAt] = Date.now();

    this[_connectionPromise] = Promise.resolve()
      .then(() => this[_connection].login(username, password))
      .then(() => this[_connection]);

    return this[_connectionPromise];
  }

  get [_hasValidConnection]() {
    if (!this[_connectionPromise]) { return false; }
    if (!this[_initializedAt]) { return false; }
    if (!this[_initializedAt] + this[_maxConnectionTime] < Date.now()) { return false; }

    return true;
  }

  get connectionLength() {
    return Date.now() - this[_initializedAt];
  }

}

module.exports = Connection;
