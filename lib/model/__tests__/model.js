'use strict';

const mocks = require('./fixtures/mocks');

const chai = require('chai');
const Model = require('../');
const Connection = require('../../connection');
const schema = require('./fixtures/schema');
const expect = chai.expect;

const sharedConnection = new Connection({
  username: 'test',
  password: 'test',
  connection: {
    loginUrl: 'https://test.salesforce.com',
  },
});

function getTenant() {
  return {
    models: {},
    connection: sharedConnection,
  };
}

describe.only('Model', () => {

  describe('#objectName', () => {

    it('should inherit the object name from the schema', () => {
      const Lead = new Model(schema.LeadSchema, getTenant());

      expect(Lead.objectName).to.be.equal('Lead');
    });

  });

  describe('#sobject', () => {

    it('should be able to get the raw sobject entity', () => {
      const Lead = new Model(schema.LeadSchema, getTenant());

      return Lead.sobject().then((sobject) => {
        expect(sobject.type).to.be.equal('Lead');
        expect(sobject.describe).to.be.a('function');
      });
    });

  });

  describe('#describeRaw', () => {

    it('should be able to get the raw describe object', () => {
      const Lead = new Model(schema.LeadSchema, getTenant());

      return expect(Lead.describeRaw()).to.eventually.eql(mocks.leadDescribe);
    });
  });

  describe('#clearCache', () => {

    it('should be able to clear the cache to get the raw describe again');

  });

  describe('#describe', () => {

    it('should be able to get a normalized describe', () => {
      const tenant = getTenant();
      const Lead = new Model(schema.LeadSchema, tenant);
      const Attachment = new Model(schema.AttachmentSchema, tenant);

      tenant.models.Lead = Lead;
      tenant.models.Attachment = Attachment;

      return expect(Lead.describe()).to.eventually.eql({});
    });

  });

  describe('#create', () => {

    it('should be able to create a new entity');

    it('should strip out uncreatable fields');

    it('should call pre and post create hooks');

  });

  describe('#find', () => {

    it('should be able to search for entities');

    it('should be able to sort');

    it('should be able to limit');

    it('should be able to skip');

    it('should be able to select fields');

    it('should be able to put in conditions');

    it('should be able to include related entities');

  });

  describe('#update', () => {

    it('should be able to update an entity');

    it('should call pre and post update hooks');

  });

  describe('#delete', () => {

    it('should be able to delete an entity');

    it('should call pre and post delete hooks');

  });

  describe('statics', () => {

  });

  describe('methods', () => {

  });

});
