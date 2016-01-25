'use strict';

const merge = require('merge');

module.exports = function createQuery(query, definition) {
  query = merge.recursive({
    where: null,
    select: null,
    limit: null,
    sort: null,
    skip: null,
    include: null,
  }, query);

  if (!query.select) { query.select = defaultSelect(definition); }

  query.select = normalizeSelect(query.select, definition);
  query.where = normalizeWhere(query.where, definition);
  query.include = normalizeInclude(query.include, definition);

  return query;
};

function defaultSelect(definition) {
  return Object.keys(definition.fields).reduce((select, fieldPath) => {
    select[fieldPath] = true;
    return select;
  }, {});
}

function normalizeSelect(select, definition) {
  select = select || {};
  return Object.keys(select).reduce((newSelect, field) => {
    newSelect[definition.fields[field].column] = select[field];
    return newSelect;
  }, {});
}

function normalizeWhere(where, definition) {
  where = where || {};
  return Object.keys(where).reduce((newWhere, field) => {
    newWhere[definition.fields[field].column] = where[field];
    return newWhere;
  }, {});
}

function normalizeInclude(include, definition) {
  // TODO not supported yet
  return {};
}
