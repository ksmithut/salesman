'use strict';

const flatten = require('../utils/flatten');
const assert = require('../utils/assert');
const objectify = require('../utils/objectify');
const objectUtils = require('../utils/object-utils');
const isObject = objectUtils.isObject;

const _model = Symbol('model');
const _query = Symbol('query');

class Query {

  constructor(model, query) {
    this[_model] = model;
    this[_query] = {
      select: null,
      where: null,
      limit: null,
      sort: {},
      skip: 0,
      includes: {},
    };

    if (query) {
      if (query.sort) this.sort(query.sort);
      if (query.limit) this.limit(query.limit);
      if (query.skip) this.skip(query.skip);
      if (query.select) this.select(query.select);
      if (query.where) this.where(query.where);
      if (query.includes) this.includes(query.includes);

      return query.exec();
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

  includes() {
    // TODO
    return this;
  }

  exec() {
    let model = this[_model];
    let query = this[_query];

    return model.describeSobject()
      .then((table) => {
        const describe = table.describe;
        const sobject = table.sobject;

        let sort = query.sort && model.transformer.formatKeys(query.sort);
        let select = query.select && model.transformer.formatKeys(query.select);
        let where = query.where && model.transformer.formatKeys(query.where);
        let limit = query.limit;
        let skip = query.skip;

        return sobject
          .select(select)
          .where(where)
          .limit(limit)
          .skip(skip)
          .sort(sort);
      })
      .map((row) => model.transformer.unformat(row, false));
  }

}

module.exports = Query;
