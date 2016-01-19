'use strict';

const Schema = require('../');
const chai = require('chai');
const expect = chai.expect;

describe('Schema#constructor', () => {

  it('should create a new schema instance', () => {
    let schema = new Schema();

    expect(schema).to.be.instanceOf(Schema);
  });

  it('should accept a objectName argument and make it available', () => {
    let objectName = 'Lead';
    let schema = new Schema(objectName);

    expect(schema.objectName).to.be.equal(objectName);
  });

  it('should build out the attributes into a flat structure', () => {
    let schema = new Schema(null, {
      id: true,
      name: 'Name',
      address: {
        street: 'Street',
        city: 'City',
        zip: 'PostalCode',
        state: {
          column: 'State',
        },
      },
      account: {
        ref: 'Account',
      },
      attachments: {
        ref: 'Attachments',
        collection: true,
      },
    });

    expect(schema.attributes).to.be.eql({
      'id': { column: 'id' },
      'name': { column: 'Name' },
      'address.street': { column: 'Street' },
      'address.city': { column: 'City' },
      'address.zip': { column: 'PostalCode' },
      'address.state': { column: 'State' },
      'account': { ref: 'Account' },
      'attachments': { ref: 'Attachments', collection: true },
    });
  });

  it('should be able to customize column key', () => {
    let schema = new Schema(null, {
      id: 'Id',
      column: {
        $column: 'Column',
      },
    }, { columnKey: '$column' });

    expect(schema.attributes).to.be.eql({
      'id': { column: 'Id' },
      'column': { column: 'Column' },
    });
  });

  it('should be able to customize ref key', () => {
    let schema = new Schema(null, {
      id: 'Id',
      ref: {
        $ref: 'Ref',
      },
    }, { refKey: '$ref' });

    expect(schema.attributes).to.be.eql({
      'id': { column: 'Id' },
      'ref': { ref: 'Ref' },
    });
  });

});
