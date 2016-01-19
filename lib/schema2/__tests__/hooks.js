'use strict';

const chai = require('chai');
const newSchema = require('./fixtures/new-schema');
const expect = chai.expect;

describe('Schema hooks', () => {

  it('should add pre and post hooks', () => {
    let schema = newSchema();
    let preCreateSpy = chai.spy(function(val) { return val + 'pre '; });
    let preCreateSpy2 = chai.spy(function() { });
    let postCreateSpy = chai.spy(function(val) { return val + ' post'; });

    schema.pre('create', preCreateSpy);
    schema.pre('create', preCreateSpy2);
    schema.post('create', postCreateSpy);
    return expect(schema.callHook('create', '', function(val) { return val + 'create'; }))
      .to.eventually.equal('pre create post')
      .then(() => {
        expect(preCreateSpy).to.have.been.called.exactly(1);
        expect(preCreateSpy2).to.have.been.called.exactly(1);
        expect(postCreateSpy).to.have.been.called.exactly(1);
      });
  });

});
