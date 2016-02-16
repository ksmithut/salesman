'use strict';

const Bluebird = require('bluebird');
const objectPath = require('object-path');
const flatten = require('../utils/flatten');
const assert = require('../utils/assert');
const objectify = require('../utils/objectify');
const objectUtils = require('../utils/object-utils');
const isObject = objectUtils.isObject;
const objectMap = objectUtils.objectMap;

const _model = Symbol('model');
const _query = Symbol('query');
const _subQueries = Symbol('subQueries');

class Query {

  constructor(model, query) {
    this[_model] = model;
    this[_query] = {
      select: null,
      where: null,
      limit: null,
      sort: {},
      skip: 0,
      include: {},
    };
    this[_subQueries] = [];

    if (query) {
      if (query.sort) this.sort(query.sort);
      if (query.limit) this.limit(query.limit);
      if (query.skip) this.skip(query.skip);
      if (query.select) this.select(query.select);
      if (query.where) this.where(query.where);
      if (query.include) this.include(query.include);
    }
  }

  sort(val) {
    if (typeof val === 'string') val = objectify(val, 1, -1);

    assert(isObject(val), 'Query.sort: you must pass a string or an object');

    val = flatten(val);

    this[_query].sort = Object.assign({}, this[_query].sort, val);

    return this;
  }

  limit(val) {
    assert(typeof val === 'number', 'Query.limit: you must pass a number');
    assert(val > 0, 'Query.limit: you must pass a number greater than 0');

    this[_query].limit = val;

    return this;
  }

  skip(val) {
    assert(typeof val === 'number', 'Query.skip: you must pass a number');
    assert(val >= 0, 'Query.skip: you must pass a number greater than or equal to 0');

    this[_query].skip = val;

    return this;
  }

  select(val) {
    if (typeof val === 'string') val = objectify(val, 1, 0);

    assert(isObject(val), 'Query.select: you must pass a string or an object');

    val = flatten(val);

    this[_query].select = Object.assign({}, this[_query].select, val);

    return this;
  }

  where(val) {
    assert(isObject(val), 'Query.where: you must bass an object');

    val = flatten(val, (fieldVal) => {
      return Object.keys(fieldVal).some((key) => key.charAt(0) === '$');
    });

    this[_query].where = Object.assign({}, this[_query].where, val);

    return this;
  }

  include(includes, subQuery) {
    if (typeof includes === 'string') includes = { [includes]: subQuery || {} };

    assert(isObject(includes), 'Query.include: you must pass a string or an object');

    let model = this[_model];

    let modelDescribe = model.describe();

    objectMap(includes, (queryDefinition, field) => {
      let getSubQuery = modelDescribe.then((describe) => {
        let relationship = describe.relationships[field];

        assert(relationship, `${field} is not a valid relationship`);
        let subModel = model.getModel(relationship.ref);
        let query = new Query(subModel, queryDefinition);

        query.relationship = relationship;
        query.model = subModel;
        return query;
      });

      this[_subQueries].push(getSubQuery);
    });

    this[_query].include = Object.assign({}, this[_query].include, includes);

    return this;
  }

  subQuery(sobject) {
    let query = this[_query];
    let model = this[_model];

    if (query.select === null) this.select('*');

    let sort = query.sort && model.transformer.formatKeys(query.sort);
    let select = query.select && model.transformer.formatKeys(query.select);
    let where = query.where && model.transformer.formatKeys(query.where);
    let limit = query.limit;
    let skip = query.skip;

    sobject = sobject
      .select(select)
      .where(where)
      .limit(limit)
      .skip(skip)
      .sort(sort);

    return Bluebird
      .all(this[_subQueries])
      .reduce((prev, subQuery) => {
        prev.sobject = prev.sobject.include(subQuery.relationship.relationshipName);
        return subQuery.subQuery(prev.sobject).then((data) => {
          return { sobject: data.sobject.end() };
        });
      }, { sobject });
  }

  formatResult(rows) {
    let model = this[_model];
    let single = false;

    if (!Array.isArray(rows)) {
      single = true;
      rows = [ rows ];
    }

    return Bluebird
      .all(this[_subQueries])
      .then((subQueries) => {
        let rowPromises = rows.map((row) => {
          let formattedRow = model.transformer.unformat(row, false);

          let subQueryPromises = subQueries.map((subQuery) => {
            let fieldPath = subQuery.relationship.fieldPath;
            let relationshipName = subQuery.relationship.relationshipName;

            return subQuery.formatResult(row[relationshipName].records)
              .then((subRows) => {
                objectPath.set(formattedRow, fieldPath, subRows);
                return formattedRow;
              });
          });

          return Bluebird.all(subQueryPromises).return(formattedRow);
        });

        return Bluebird.all(rowPromises);
      })
      .then((formattedRows) => {
        return single ? formattedRows[0] : formattedRows;
      });
  }

  exec() {
    let model = this[_model];

    return model.describeSobject()
      .then((table) => this.subQuery(table.sobject))
      .then((data) => {
        return data.sobject
          .exec({ autoFetch: true })
          .then((rows) => this.formatResult(rows, data.subQueries));
      });
  }

}

module.exports = Query;
