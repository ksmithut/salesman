'use strict';

const Bluebird = require('bluebird');
const merge = require('merge');
const objectPath = require('object-path');
const Transformer = require('./transformer');
const Query = require('./query');
const normalizeDescribe = require('./normalize-describe');
const objectUtils = require('../utils/object-utils');
const assert = require('../utils/assert');
const objectMap = objectUtils.objectMap;
const objectReduce = objectUtils.objectReduce;

const ID_FIELD = 'Id';

// private properties
const _tenant = Symbol('tenant');
const _refresh = Symbol('refresh');
const _definitionPromise = Symbol('definitionPromise');
const _attributes = Symbol('attributes');
const _transformer = Symbol('transformer');

// private methods
const _applyDescribe = Symbol('applyDescribe');

class Model {

  constructor(schema, tenant) {

    this[_tenant] = tenant;
    this[_refresh] = true;
    this[_definitionPromise] = null;
    this[_attributes] = schema.attributes;
    this[_transformer] = new Transformer(this[_attributes], 'column');

    Object.defineProperties(this, {
      schema: { value: schema },
      connection: { value: tenant.connection },
      objectName: { value: schema.objectName },
      transformer: { get: () => this[_transformer] },
    });

    // add the static methods to the model instance
    this.schema.extendStatic(this);
  }

  getModel(modelName) {
    console.log(this[_tenant].models);
    return this[_tenant].models[modelName];
  }

  callHook(name, value, fn, context) {
    return this.schema.callHook(name, value, fn, context);
  }

  sobject(objectName) {
    return this.connection.getConnection()
      .then((conn) => conn.sobject(objectName || this.objectName));
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

    if (!needRefresh && this[_definitionPromise]) return this[_definitionPromise];

    this[_definitionPromise] = this.describeRaw()
      .then((data) => this[_applyDescribe](data));

    return this[_definitionPromise];
  }

  describeSobject() {
    return Bluebird.props({
      describe: this.describe(),
      sobject: this.sobject(),
    });
  }

  [_applyDescribe](data) {
    let attrs = this.schema.attributes;
    let transformerAttrs = {};
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
      idField: null,
    };

    definition.idField = null;

    let promises = objectMap(attrs, (fieldDef, fieldPath) => {
      fieldDef = merge(true, fieldDef);

      // References are ignored on setup.
      if (fieldDef.ref) {
        let subModel = this.getModel(fieldDef.ref);
        let objectName = subModel.objectName;
        let relationship = data.childRelationships[objectName];

        assert(relationship && !relationship.deprecated, `${fieldDef.ref} is not a valid relationship on ${this.objectName}`);

        definition.relationships[fieldPath] = merge(true, relationship, fieldDef, { objectName, fieldPath });
        return null;
      }

      let columnPath = fieldDef.column.split('.');
      let length = columnPath.length;

      if (fieldDef.column === ID_FIELD) definition.idField = fieldPath;

      return Bluebird
        .reduce(columnPath, (tableMeta, path, i) => {
          let fieldUntilNow = columnPath.slice(0, i + 1).join('.');

          if (i === length - 1) {
            let field = tableMeta.fields.byName[path];

            assert(field, `${fieldUntilNow} is not an accessible field`);
            assert(!field.deprecated, `${fieldUntilNow} is deprecated`);

            // If it's a field with relationships,
            if (length > 1) {
              Object.assign(field, {
                creatable: false,
                updatable: false,
                required: false,
              });
            }
            return field;
          }

          let field = tableMeta.fields.byRelationship[path];

          assert(field, `${fieldUntilNow} is not an accessible relationship`);
          assert(!field.deprecated, `${fieldUntilNow} is deprecated`);
          // TODO support multiple field.referenceTos
          // Complications include but are not limited to:
          // - Merging in field definitions from multiple sources
          assert(field.referenceTo.length === 1, `${fieldUntilNow} has multiple reference. This is unsupported for now`);

          return this.describeRaw(field.referenceTo[0]);
        }, data)
        .catch((error) => ({ error }))
        .then((remoteField) => {
          let overrides = (length > 1)
            ? { creatable: false, updateable: false, required: false }
            : {};

          definition.fields[fieldPath] = merge.recursive(true, remoteField, fieldDef, overrides);

          if (!definition.fields[fieldPath].error) transformerAttrs[fieldPath] = definition.fields[fieldPath];
        });
    });

    return Bluebird
      .all(promises)
      .then(() => {
        this[_transformer] = new Transformer(transformerAttrs, 'column');
      })
      .return(definition);
  }

  create(obj) {
    // TODO support multiple creates?
    // complications:
    // - With mutliple create comes multiple responses. Some can succeed and
    //   some and fail. should we fail the entire promise if one of them fails?
    //   I don't think so, but also letting it go through can suggest that
    //   everything worked. Something to think about
    assert(!Array.isArray(obj), 'multiple creates are not supported at this time');

    return this.callHook([ 'save', 'create' ], obj, (modifiedObj) => {
      return this.describeSobject()
        .then((table) => {
          const describe = table.describe;
          const sobject = table.sobject;

          // TODO make error more HTTP friendly
          assert(describe.creatable, `Unable to create "${describe.label}"`);

          obj = objectReduce(describe.fields, (newObj, field, key) => {
            // TODO keep track of fields that have errors or aren't creatable so
            // that we can return them in some sort of response
            if (!field.creatable || field.deprecated || field.error) return newObj;

            newObj[field.column] = objectPath.get(modifiedObj, key, modifiedObj[key] || field.defaultValue);
            return newObj;
          }, {});

          return sobject.create(obj)
            .catch(Model.normalizeErrors);
        })
        .then((results) => {
          assert(results.success, results.errors);
          return results.id;
        });
    }, this);

  }

  find(query) {
    return new Query(this, query);
  }

  update(obj) {
    assert(!Array.isArray(obj), 'multiple updates are not supported at this time');

    return this.callHook([ 'save', 'update' ], obj, (modifiedObj) => {
      return this.describeSobject()
        .then((table) => {
          const describe = table.describe;
          const sobject = table.sobject;

          assert(describe.updatable, `Unable to update "${describe.label}"`);

          obj = objectReduce(describe.fields, (newObj, field, key) => {
            if (key !== describe.idField && !field.updatable || field.deprecated || field.error) return newObj;
            let value = objectPath.get(modifiedObj, key, modifiedObj[key]);

            if (typeof value === 'undefined') return newObj;
            newObj[field.column] = value;
            return newObj;
          }, {});

          assert(obj[ID_FIELD], 'Unable to update without an id');

          return sobject.update(obj)
            .catch(Model.normalizeErrors);
        })
        .then((results) => {
          assert(results.success, results.errors);
          return results.id;
        });
    }, this);
  }

  delete(id) {
    assert(!Array.isArray(id), 'multiple deletes are not supported at this time');

    return this.callHook([ 'delete' ], id, (modifiedId) => {
      return this.describeSobject()
        .then((table) => {
          const describe = table.describe;
          const sobject = table.sobject;

          assert(describe.deletable, `Unable to delete "${describe.label}"`);

          return sobject.destroy(modifiedId)
            .catch(Model.normalizeErrors);
        })
        .then((results) => {
          assert(results.success, results.errors);
          return results.id;
        });
    }, this);
  }

  static normalizeErrors(err) {
    // switch (err.name) {
    //   case 'REQUIRED_FIELD_MISSING':
    //     // TODO err.fields is an array of fields that are required
    //     break;
    // }
    throw err;
  }

}

module.exports = Model;
