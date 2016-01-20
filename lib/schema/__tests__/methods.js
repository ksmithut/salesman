'use strict';

const chai = require('chai');
const newSchema = require('./fixtures/new-schema');
const expect = chai.expect;

describe('Schema object extension', () => {

  describe('Schema#static', () => {

    it('should apply static methods to an object', () => {
      let schema = newSchema();
      let spy = chai.spy(function() { return this.foo; });
      let obj = {};

      schema.static('callFoo', spy);
      schema.static('foo', 'bar');
      schema.extendStatic(obj);
      expect(obj.callFoo()).to.be.equal('bar');
      expect(spy).to.have.been.called.exactly(1);
    });

    it('should keep the contexts separate for each instance', () => {
      let schema = newSchema();
      let spy = chai.spy(function() { return this.foo; });
      let obj1 = { foo: 'bar' };
      let obj2 = { foo: 'hello' };

      schema.static('callFoo', spy);
      schema.extendStatic(obj1);
      schema.extendStatic(obj2);
      expect(obj1.callFoo()).to.be.equal('bar');
      expect(obj2.callFoo()).to.be.equal('hello');
      expect(spy).to.have.been.called.exactly(2);
    });

    it('should not be able to modify other versions across objects', () => {
      let schema = newSchema();
      let obj1 = {};
      let obj2 = {};

      schema.static('foo', { bar: 'hello world' });
      schema.extendStatic(obj1);
      schema.extendStatic(obj2);
      expect(obj1.foo).to.be.eql({ bar: 'hello world' });
      expect(obj2.foo).to.be.eql({ bar: 'hello world' });
      obj1.foo.bar = 'foobar';
      expect(obj2.foo.bar).to.be.equal('hello world');
    });

  });

  describe('Schema#method', () => {

    it('should apply instance methods to an object', () => {
      let schema = newSchema();
      let spy = chai.spy(function() { return this.foo; });
      let obj = { foo: 'bar' };

      schema.method('callFoo', spy);
      schema.extendInstance(obj);
      expect(obj.callFoo()).to.be.equal('bar');
      expect(spy).to.have.been.called.exactly(1);
    });

    it('should fail if non-function is passed', () => {
      let schema = newSchema();

      expect(() => schema.method('callFoo', 'foobar')).to.throw('Schema.method: second argument is not a function');
    });

  });

});
