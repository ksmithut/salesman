'use strict';

const Bluebird = require('bluebird');
const merge = require('merge');
const normalizeQuery = require('./normalize-query');
const objectUtils = require('../utils/object-utils');
const objectReduce = objectUtils.objectReduce;

const _model = Symbol('model');

const _modifyQuery = Symbol('modifyQuery');

module.exports = class Query {

  constructor(model) {
    this[_model] = model;
  }

  query(queryObject) {
    queryObject = queryObject || {};
    queryObject.includes = queryObject.includes || queryObject.include || null;

    if (queryObject.select) this.select(queryObject.select);
    if (queryObject.where) this.where(queryObject.where);
    if (queryObject.limit) this.limit(queryObject.limit);
    if (queryObject.sort) this.sort(queryObject.sort);
    if (queryObject.skip) this.skip(queryObject.skip);
    if (queryObject.includes) this.includes(queryObject.includes);

    return this;
  }

  [_modifyQuery](fieldName, input, override) {
    this[fieldName] = override
      ? input
      : merge.recursive(true, this[fieldName], override);
    return this;
  }

  select(select, override) {
    return this[_modifyQuery]('select', select, override);
  }

  where(where, override) {
    return this[_modifyQuery]('where', where, override);
  }

  limit(limit) {
    return this[_modifyQuery]('limit', limit, true);
  }

  sort(sort) {
    return this[_modifyQuery]('sort', sort, true);
  }

  skip(skip) {
    return this[_modifyQuery]('skip', skip, true);
  }

  include(include) {
    this.includes = (this.includes || []).concat(include);
    return this;
  }

  exec(cb) {
    return Bluebird
      .all([
        this[_model].describe(),
        this[_model].sobject(),
      ])
      .spread((describe, sobject) => {
        let normalizedQuery = normalizeQuery(this, describe);

        console.log(describe);

        let select = objectReduce(normalizedQuery.select, (transformedSelect, val, key) => {
          console.log(val);
        }, {});

        return Bluebird.resolve();
      })
      .asCallback(cb);
  }

}
