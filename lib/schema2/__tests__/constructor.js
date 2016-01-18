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

  });

});
