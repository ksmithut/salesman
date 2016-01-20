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

  it('should run multiple hooks in sequence', () => {
    let schema = newSchema();
    let preSpy1 = chai.spy((val) => val + 'pre1 ');
    let preSpy2 = chai.spy((val) => val + 'pre2 ');
    let postSpy1 = chai.spy((val) => val + ' post1');
    let postSpy2 = chai.spy((val) => val + ' post2');

    schema.pre('save', preSpy1);
    schema.pre('create', preSpy2);
    schema.post('save', postSpy1);
    schema.post('create', postSpy2);
    return expect(schema.callHook([ 'save', 'create' ], '', (val) => val + 'createsave'))
      .to.eventually.equal('pre1 pre2 createsave post2 post1')
      .then(() => {
        expect(preSpy1).to.have.been.called.exactly(1);
        expect(preSpy2).to.have.been.called.exactly(1);
        expect(postSpy1).to.have.been.called.exactly(1);
        expect(postSpy2).to.have.been.called.exactly(1);
      });
  });

});
