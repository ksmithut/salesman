'use strict';

const Bluebird = require('bluebird');
const merge = require('merge');
const normalizeDescribe = require('./normalize-describe');

// "Private" keys
const _tenant = Symbol('tenant');

class Model {

  constructor(schema, tenant) {

    this[_tenant] = tenant;

    Object.defineProperties(this, {
      schema: { value: schema },
      connection: { value: tenant.connection },
    });

    // add the static methods to the model instance
    this.schema.extendStatic(this);
  }

  get tableName() {
    return this.schema.tableName;
  }

  callHook(name, value, fn, context) {
    return this.schema.callHook(name, value, fn, context);
  }

  sobject(tableName) {
    return this.connection.getConnection()
      .then((conn) => conn.sobject(tableName || this.tableName));
  }

  describeRaw(tableName) {
    return this.sobject(tableName)
      .then((sobject) => Bluebird.fromCallback((cb) => sobject.describe$(cb)))
      .then(normalizeDescribe);
  }

  create() {

  }

  find() {

  }

  update() {

  }

  delete() {

  }

}

module.exports = Model;
