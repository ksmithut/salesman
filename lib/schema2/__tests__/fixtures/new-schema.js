'use strict';

const Schema = require('../../schema');

module.exports = function(name, attrs, config) {
  name = name || 'Lead';
  attrs = attrs || {
    id: true,
    contact: {
      firstName: 'FirstName',
      lastName: 'LastName',
    },
    address: {
      street: 'Street',
      city: 'City',
      zip: 'PostalCode',
      state: 'State',
    },
    account: {
      ref: 'Account',
    },
    attachments: {
      ref: 'Attachment',
      collection: true,
    },
  };
  return new Schema(name, attrs, config);
};
