'use strict';

module.exports = function objectify(str, positiveValue, negativeValue) {
  positiveValue = positiveValue || 1;
  negativeValue = negativeValue || 0;
  return str
    .replace(/([, ]+)/g, ' ')
    .trim()
    .split(' ')
    .reduce((obj, field) => {
      let value = positiveValue;

      if (field.charAt(0) === '-') {
        value = negativeValue;
        field = field.substr(1);
      }

      obj[field] = value;
      return obj;
    }, {});
};
