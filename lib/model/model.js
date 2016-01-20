'use strict';

const Bluebird = require('bluebird');
const merge = require('merge');

const RECORD_TYPE_FIELD = 'RecordTypeId';

// "Private" keys
const _tenant = Symbol('tenant');
const _transformer = Symbol('transformer');

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

  describe() {

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
