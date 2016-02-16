'use strict';

const Schema = require('../../../schema');

const LeadSchema = new Schema('Lead', {
  id: 'Id',
  contact: {
    firstName: 'FirstName',
    lastName: 'LastName',
  },
  attachments: {
    ref: 'Attachment',
    collection: true,
  },
});

const AttachmentSchema = new Schema('Attachment', {
  id: 'Id',
  name: 'Name',
  contentType: 'ContentType',
});

module.exports = {
  LeadSchema,
  AttachmentSchema,
};
