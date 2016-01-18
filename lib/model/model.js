'use strict';

const Bluebird = require('bluebird');
const Transformer = require('./transformer');

const RECORD_TYPE_FIELD = 'RecordTypeId';

// "Private" keys
const _schema = Symbol('schema');
const _tenant = Symbol('tenant');
const _connection = Symbol('connection');
const _callHook = Symbol('callHook');
const _sobject = Symbol('sobject');
const _transformer = Symbol('transformer');
const _normalizeDescribe = Symbol('normalizeDescribe');
const _normalizeField = Symbol('normalizeField');

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
   * @param {Object} tenant - The connection object for the model.
   * @returns {Model} the new model object
   */
  constructor(schema, tenant) {
    this[_schema] = {
      tableName: schema.tableName,
      attributes: schema.attributes,
      hooks: schema.hooks,
      methods: schema.methods,
      statics: schema.statics,
    };
    this[_connection] = tenant.connection;
    this[_tenant] = tenant;

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
   * @function Model#_callHook
   * @private
   * @param {string} name
   */
  [_callHook](name) {
    let hooks = this[_schema].hooks[name] || { pre: [], post: [] };

    // TODO finish method
    return hooks;
  }

  /**
   * @function Model#_sobject
   * @private
   */
  [_sobject]() {
    return this[_connection].getConnection()
      .then((conn) => conn.sobject(this.tableName));
  }

  /**
   * @function Model#describe
   * @param {Object} [options] - The options object
   * @param {boolean} [options.raw=false] - Whether or not to get the raw
   * salesforce describe object back
   * @param {boolean} [options.clearCache=false] - Whether or not to clear the
   * describe cache
   * @returns {Promise} resolves to describe object
   */
  describe(options) {
    options = Object.assign({
      raw: false,
      clearCache: false,
    }, options);

    return this[_sobject]()
      .then((sobject) => {
        if (options.clearCache) { sobject.describe$.clear(); }
        return Bluebird.fromCallback((cb) => sobject.describe$(cb));
      })
      .then((data) => this[_normalizeDescribe](data));
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

  /**
   * @function Model#_normalizeDescribe
   * @private
   * @param {Object} data
   * @returns {Object}
   */
  [_normalizeDescribe](data) {
    let describe = {
      creatable: data.createable,
      deletable: data.deletable,
      updatable: data.updateable,
      deprecated: data.deprecatedAndHidden,
      keyPrefix: data.keyPrefix,
      label: data.label,
      labelPlural: data.labelPlural,
    };

    describe.childRelationships = data.childRelationships.reduce((children, relationship) => {
      children[relationship.childSObject] = {
        deprecated: relationship.deprecatedAndHidden,
        field: relationship.field,
        name: relationship.relationshipName,
      };
      return children;
    }, {});

    describe.fields = data.fields.reduce((fields, field) => {
      field = Model[_normalizeField](field);
      fields.byName[field.name] = field;
      if (field.relationshipName) {
        fields.byRelationship[field.relationshipName] = field;
      }
      return fields;
    }, { byName: {}, byRelationship: {} });

    let recordTypeField = describe.fields.byName[RECORD_TYPE_FIELD];

    if (recordTypeField) {
      recordTypeField.picklistValues = data.recordTypeInfos.reduce((picklist, recordType) => {
        if (!recordType.available) { return picklist; }
        if (recordType.defaultRecordTypeMapping) {
          recordTypeField.defaultValue = recordType.recordTypeId;
        }

        picklist.push({
          value: recordType.recordTypeId,
          label: recordType.name,
          validFor: null,
        });
        return picklist;
      }, []);
    }

    return describe;
  }

  /**
   * @function Model._normalizeField
   * @private
   * @param {Object} field
   * @returns {Object}
   */
  static [_normalizeField](field) {
    let newField = {
      creatable: field.createable,
      // controllerName: field.controllerName,
      defaultValue: field.defaultValue,
      defaultedOnCreate: field.defaultedOnCreate,
      // dependentPicklist: field.dependentPicklist,
      deprecated: field.deprecatedAndHidden,
      label: field.label,
      name: field.name,
      required: !field.nillable,
      relationshipName: field.relationshipName,
      restrictedPicklist: field.restrictedPicklist,
      type: field.type,
      updatable: field.updateable,
    };

    // TODO account for dependentPicklists.
    // We have the controllerName from the field definition, so we know which
    // field is the dependent picklist, but in the picklistValues, the validFor
    // gives an ID of some sort, and we couldn't find a way to link the validFor
    // values to the other picklist's values.

    newField.picklistValues = field.picklistValues.reduce((values, value) => {
      if (!value.active) { return values; }
      if (value.defaultValue) { newField.defaultValue = value.value; }
      return {
        value: value.value,
        label: value.label,
        validFor: value.validFor,
      };
    }, []);

    return newField;
  }

}

module.exports = Model;
