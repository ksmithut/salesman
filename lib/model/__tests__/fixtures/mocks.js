'use strict';

// include login connection
const url = require('url');
const nock = require('nock');
const connectionMocks = require('../../../connection/__tests__/fixtures/mocks');

const server = url.parse(connectionMocks.serverUrl);

nock(`${server.protocol}//${server.host}`)
  .get('/services/data/v34.0/sobjects/Lead/describe')
  .reply(200, {
    createable: true,
    deletable: true,
    deprecatedAndHidden: false,
    keyPrefix: '00Q',
    label: 'Lead',
    labelPlural: 'Leads',
    updateable: true,
    childRelationships: [
      {
        childSObject: 'Attachment',
        deprecatedAndHidden: false,
        field: 'ParentId',
        relationshipName: 'Parent',
      },
    ],
    fields: [
      {
        createable: true,
        defaultValue: null,
        deprecatedAndHidden: false,
        label: 'Id',
        name: 'Id',
        nillable: false,
        picklistValues: [],
        referenceTo: [],
        relationshipName: null,
        restrictedPicklist: false,
        type: 'id',
        updateable: false,
      },
      {
        createable: true,
        defaultValue: null,
        deprecatedAndHidden: false,
        label: 'Record Type',
        name: 'RecordTypeId',
        nillable: false,
        picklistValues: [],
        referenceTo: [ 'RecordType' ],
        relationshipName: 'RecordType',
        restrictedPicklist: false,
        type: 'reference',
        updateable: true,
      },
      {
        createable: true,
        defaultValue: null,
        deprecatedAndHidden: false,
        label: 'First Name',
        name: 'FirstName',
        nillable: false,
        picklistValues: [],
        referenceTo: [],
        relationshipName: null,
        restrictedPicklist: false,
        type: 'string',
        updateable: true,
      },
      {
        createable: true,
        defaultValue: null,
        deprecatedAndHidden: false,
        label: 'Last Name',
        name: 'LastName',
        nillable: false,
        picklistValues: [],
        referenceTo: [],
        relationshipName: null,
        restrictedPicklist: false,
        type: 'string',
        updateable: true,
      },
    ],
    recordTypeInfos: [
      {
        available: true,
        defaultRecordTypeMapping: true,
        name: 'Business',
        recordTypeId: '1',
      },
      {
        available: false,
        defaultRecordTypeMapping: false,
        name: 'Messed Up',
        recordTypeId: '2',
      },
      {
        available: true,
        defaultRecordTypeMapping: false,
        name: 'Custom',
        recordTypeId: '3',
      },
    ],
  });

exports.leadDescribe = {
  creatable: true,
  deletable: true,
  updatable: true,
  deprecated: false,
  keyPrefix: '00Q',
  label: 'Lead',
  labelPlural: 'Leads',
  childRelationships: {
    Attachment: {
      deprecated: false,
      field: 'ParentId',
      relationshipName: 'Parent',
    },
  },
  fields: {
    byName: {
      Id: {
        creatable: true,
        updatable: false,
        required: true,
        defaultValue: null,
        deprecated: false,
        label: 'Id',
        name: 'Id',
        relationshipName: null,
        referenceTo: [],
        restrictedPicklist: false,
        type: 'id',
        picklistValues: [],
      },
      RecordTypeId: {
        creatable: true,
        updatable: true,
        required: true,
        defaultValue: '1',
        deprecated: false,
        label: 'Record Type',
        name: 'RecordTypeId',
        relationshipName: 'RecordType',
        referenceTo: [
          'RecordType',
        ],
        restrictedPicklist: true,
        type: 'reference',
        picklistValues: [
          {
            label: 'Business',
            value: '1',
          },
          {
            label: 'Custom',
            value: '3',
          },
        ],
      },
      FirstName: {
        creatable: true,
        updatable: true,
        required: true,
        defaultValue: null,
        deprecated: false,
        label: 'First Name',
        name: 'FirstName',
        relationshipName: null,
        referenceTo: [],
        restrictedPicklist: false,
        type: 'string',
        picklistValues: [],
      },
      LastName: {
        creatable: true,
        updatable: true,
        required: true,
        defaultValue: null,
        deprecated: false,
        label: 'Last Name',
        name: 'LastName',
        relationshipName: null,
        referenceTo: [],
        restrictedPicklist: false,
        type: 'string',
        picklistValues: [],
      },
    },
    byRelationship: {
      RecordType: {
        creatable: true,
        updatable: true,
        required: true,
        defaultValue: '1',
        deprecated: false,
        label: 'Record Type',
        name: 'RecordTypeId',
        relationshipName: 'RecordType',
        referenceTo: [
          'RecordType',
        ],
        restrictedPicklist: true,
        type: 'reference',
        picklistValues: [
          {
            label: 'Business',
            value: '1',
          },
          {
            label: 'Custom',
            value: '3',
          },
        ],
      },
    },
  },
};
