'use strict';

const chai = require('chai');
const normalizeQuery = require('../normalize-query');
const queryFixtures = require('./fixtures/query');
const expect = chai.expect;

describe('normalizeQuery', () => {

  describe('where', () => {

    it('should flatten the data structure', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.where();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.where).to.have.property('contact.firstName', query.where.contact.firstName);
      expect(normalized.where).to.have.property('contact.phoneNumber');
      expect(normalized.where).to.have.property('contact.lastName', query.where['contact.lastName']);
    });

    it('should keep objects with $ prefixed parameters', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.where();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.where).to.have.property('contact.phoneNumber');
      expect(normalized.where['contact.phoneNumber']).to.be.eql({
        $like: '801%',
      });
    });

  });

  describe.only('select', () => {

    it('should flatten the data structure', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.select();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.select).to.have.property('id');
      expect(normalized.select).to.have.property('assignedRep.id');
      expect(normalized.select).to.have.property('assignedRep.name');
    });

    it('should expand parent fields', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.select();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.select).to.have.property('contact.firstName');
      expect(normalized.select).to.have.property('contact.lastName');
      expect(normalized.select).to.have.property('contact.phoneNumber');
      expect(normalized.select).to.have.property('address.street');
      expect(normalized.select).to.have.property('address.city');
      expect(normalized.select).to.have.property('address.state');
      expect(normalized.select).to.have.property('address.zip');
    });

    it('should accept array of fields', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.select2();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.select).to.have.property('id');
      expect(normalized.select).to.have.property('assignedRep.id');
      expect(normalized.select).to.have.property('assignedRep.name');
      expect(normalized.select).to.have.property('contact.firstName');
      expect(normalized.select).to.have.property('contact.lastName');
      expect(normalized.select).to.have.property('contact.phoneNumber');
      expect(normalized.select).to.have.property('address.street');
      expect(normalized.select).to.have.property('address.city');
      expect(normalized.select).to.have.property('address.state');
      expect(normalized.select).to.have.property('address.zip');
    });

    it('should accept space separated string', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.select3();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.select).to.have.property('id');
      expect(normalized.select).to.have.property('assignedRep.id');
      expect(normalized.select).to.have.property('assignedRep.name');
      expect(normalized.select).to.have.property('contact.firstName');
      expect(normalized.select).to.have.property('contact.lastName');
      expect(normalized.select).to.have.property('contact.phoneNumber');
      expect(normalized.select).to.have.property('address.street');
      expect(normalized.select).to.have.property('address.city');
      expect(normalized.select).to.have.property('address.state');
      expect(normalized.select).to.have.property('address.zip');
    });

  });

});
