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

  describe('select', () => {

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

  describe('include', () => {

    it('should accept an array as an include', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.include();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.includes).to.be.instanceOf(Array);
      expect(normalized.includes).to.be.eql([
        {
          ref: 'activities',
        },
        {
          ref: 'attachments',
          query: {},
        },
      ]);
    });

    it('should accept a string as an include', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.include2();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.includes).to.be.eql([
        { ref: 'activities' },
      ]);
    });

    it('should accept an object as an include', () => {
      let definition = queryFixtures.definition();
      let query = queryFixtures.include3();
      let normalized = normalizeQuery(query, definition);

      expect(normalized.includes).to.be.eql([
        {
          ref: 'attachments',
          query: {},
        },
      ]);
    });

    it('should ignore if the include isn\'t a valid value', () => {
      let definition = queryFixtures.definition();
      let query = { includes: /not valid/ };
      let normalized = normalizeQuery(query, definition);

      expect(normalized.includes).to.have.length(0);
    });

    it('should ignore if the field doesn\'t exist on the definition', () => {
      let definition = queryFixtures.definition();
      let query = { includes: 'activites' };
      let normalized = normalizeQuery(query, definition);

      expect(normalized.includes).to.have.length(0);
    });

    it('should ignore if the field doesn\'t exist on the definition', () => {
      let definition = queryFixtures.definition();
      let query = { includes: 'id' };
      let normalized = normalizeQuery(query, definition);

      expect(normalized.includes).to.have.length(0);
    });

  });

});
