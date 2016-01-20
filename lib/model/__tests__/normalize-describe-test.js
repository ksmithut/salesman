'use strict';

const chai = require('chai');
const normalizeDescribe = require('../normalize-describe');
const getDescribe = require('./fixtures/describe');
const expect = chai.expect;

describe('normalizeDescribe', () => {

  it('should normalize top level fields', () => {
    let describeData = getDescribe();
    let data = normalizeDescribe(describeData);

    expect(data).to.have.property('creatable', true);
    expect(data).to.have.property('deletable', true);
    expect(data).to.have.property('updatable', true);
    expect(data).to.have.property('deprecated', false);
    expect(data).to.have.property('keyPrefix', '00Q');
    expect(data).to.have.property('label', 'Lead');
    expect(data).to.have.property('labelPlural', 'Leads');
  });

  it('should normalize childRelationships', () => {
    let describeData = getDescribe();
    let data = normalizeDescribe(describeData);

    expect(data.childRelationships).to.be.eql({
      Account: {
        deprecated: false,
        field: 'lead__c',
        relationshipName: 'lead__r',
      },
      Opportunity: {
        deprecated: false,
        field: 'lead__c',
        relationshipName: 'lead__r',
      },
    });
  });

  it('should normalize fields', () => {
    let describeData = getDescribe();
    let data = normalizeDescribe(describeData);

    expect(data.fields.byName.Id).to.be.eql({
      creatable: true,
      defaultValue: null,
      deprecated: false,
      label: 'Id',
      name: 'Id',
      required: true,
      picklistValues: [],
      referenceTo: [],
      relationshipName: null,
      restrictedPicklist: false,
      type: 'id',
      updatable: false,
    });

    expect(data.fields.byName.Status).to.be.eql({
      creatable: true,
      defaultValue: 'Active',
      deprecated: false,
      label: 'Status',
      name: 'Status',
      required: true,
      picklistValues: [
        {
          label: 'Active',
          value: 'Active',
        },
        {
          label: 'Some Label',
          value: 'Some Value',
        },
      ],
      referenceTo: [],
      relationshipName: null,
      restrictedPicklist: false,
      type: 'picklist',
      updatable: true,
    });

    expect(data.fields.byName.RecordTypeId).to.be.eql({
      creatable: true,
      defaultValue: '1',
      deprecated: false,
      label: 'Record Type',
      name: 'RecordTypeId',
      required: true,
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
      referenceTo: [ 'RecordType' ],
      relationshipName: 'RecordType',
      restrictedPicklist: true,
      type: 'reference',
      updatable: true,
    });

    expect(data.fields.byRelationship.RecordType).to.be.equal(data.fields.byName.RecordTypeId);
  });

  it('should work without fields definition', () => {
    let describeData = getDescribe();

    delete describeData.fields;

    let data = normalizeDescribe(describeData);

    expect(data.fields).to.be.eql({
      byName: {},
      byRelationship: {},
    });
  });

  it('should work without recordTypeInfos', () => {
    let describeData = getDescribe();

    delete describeData.recordTypeInfos;

    let data = normalizeDescribe(describeData);

    expect(data.fields.byName.RecordTypeId.picklistValues).to.be.eql([]);
  });

});
