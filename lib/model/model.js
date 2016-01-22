'use strict';

const Bluebird = require('bluebird');
const merge = require('merge');
const normalizeDescribe = require('./normalize-describe');
const mapObject = require('../utils/map-object');
const assert = require('../utils/assert');

// private properties
const _tenant = Symbol('tenant');
const _refresh = Symbol('refresh');
const _definitionPromise = Symbol('definitionPromise');

// private methods
const _applyDescribe = Symbol('applyDescribe');

class Model {

  constructor(schema, tenant) {

    this[_tenant] = tenant;
    this[_refresh] = true;
    this[_definitionPromise] = null;

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

  sobject(objectName) {
    return this.connection.getConnection()
      .then((conn) => conn.sobject(objectName || this.schema.objectName));
  }

  describeRaw(objectName) {
    return this.sobject(objectName)
      .then((sobject) => Bluebird.fromCallback((cb) => sobject.describe$(cb)))
      .then(normalizeDescribe);
  }

  clearCache() {
    return this.sobject().then((sobject) => {
      sobject.describe$.clear();
      this[_refresh] = true;
      return sobject;
    });
  }

  describe() {
    let needRefresh = this[_refresh];

    this[_refresh] = false;

    if (!needRefresh && this[_definitionPromise]) {
      return this[_definitionPromise];
    }

    this[_definitionPromise] = this.describeRaw()
      .then((data) => this[_applyDescribe](data));

    return this[_definitionPromise];
  }

  [_applyDescribe](data) {
    let attrs = this.schema.attributes;

    let definition = {
      creatable: data.creatable,
      deletable: data.deletable,
      updatable: data.updatable,
      deprecated: data.deprecated,
      keyPrefix: data.keyPrefix,
      label: data.label,
      labelPlural: data.labelPlural,
      relationships: {},
      fields: {},
    };

    let promises = mapObject(attrs, (fieldPath, fieldDef) => {
      fieldDef = merge(true, fieldDef);

      if (fieldDef.ref) {
        let model = this.tenants.models[fieldDef.ref];

        assert(model, `${this.schema.objectName}.${fieldPath}: ${fieldDef.ref} is not a registered model`);
        definition.relationships[fieldDef.ref] = merge(true, fieldDef, { model });
        return null;
      }

      let columnPath = fieldDef.column.split('.');
      let length = columnPath.length;

      return Bluebird
        .reduce(columnPath, (tableMetas, path, i) => {
          let fieldUntilNow = columnPath.slice(0, i + 1).join('.');

          return Bluebird.map(tableMetas, (tableMeta) => {
            if (i === length - 1) {
              let field = tableMeta.fields.byName[path];

              assert(field, `${fieldUntilNow} is not an accessible field`);
              assert(!field.deprecated, `${fieldUntilNow} is deprecated`);

              if (length > 1) {
                field.creatable = false;
                field.updatable = false;
                field.required = false;
              }
              return field;
            }

            let field = tableMeta.fields.byRelationship[path];

            assert(field, `${fieldUntilNow} is not an accessible relationship`);

            return Bluebird.map(field.referenceTo, (objectName) => {
              return this.describeRaw(objectName);
            });
          });

        }, [ data ])
        .catch((error) => ({ error }))
        .then((remoteField) => {
          definition.fields[fieldPath] = merge.recursive(true, remoteField, fieldDef);
        });
    });

    return Bluebird.all(promises).return(definition);
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
