'use strict';

const chai = require('chai');
const Schema = require('../');

const expect = chai.expect;

describe('lib/schema', () => {

  describe('constructor', () => {

    it('should create a new schema and normalize the attributes for the model', () => {
      let schema = new Schema('Foo', {
        foo: true,
        bar: 'foobar',
        hello: {
          world: {
            column: 'helloworld',
          },
        },
      });

      expect(schema.attributes).to.be.eql({
        'foo': { column: 'foo' },
        'bar': { column: 'foobar' },
        'hello.world': { column: 'helloworld' },
      });
    });

  });

  describe('.normalizeField', () => {

    it('should default to column as the column key', () => {
      expect(Schema.normalizeField('foo', { column: 'foobar' })).to.be.eql({
        column: 'foobar',
      });
    });

    it('should accept a different column key', () => {
      expect(Schema.normalizeField('foo', { $column: 'foobar' }, '$column')).to.be.eql({
        column: 'foobar',
      });
    });

    it('should return false if no column definition was found', () => {
      expect(Schema.normalizeField('foo', {})).to.be.equal(false);
    });

    it('should use the key as the column if `true` is passed', () => {
      expect(Schema.normalizeField('foo', true)).to.be.eql({
        column: 'foo',
      });
    });

    it('should use the value as the column if a string is passed', () => {
      expect(Schema.normalizeField('foo', 'foobar')).to.be.eql({
        column: 'foobar',
      });
    });

    it('should throw if invalid value is passed', () => {
      expect(() => Schema.normalizeField('foo', false)).to.throw(/invalid definition/);
      expect(() => Schema.normalizeField('foo', [])).to.throw(/invalid definition/);
      expect(() => Schema.normalizeField('foo', null)).to.throw(/invalid definition/);
    });

  });

  describe('.normalizeAttributes', () => {

    it('should normalize the attributes', () => {
      expect(Schema.normalizeAttributes({
        foo: {
          bar: {
            column: 'foo',
          },
          hello: 'world',
        },
        bar: true,
      })).to.be.eql({
        'foo.bar': { column: 'foo' },
        'foo.hello': { column: 'world' },
        'bar': { column: 'bar' },
      });
    });

    it('should use custom column key', () => {
      expect(Schema.normalizeAttributes({
        foo: {
          column: 'column',
          bar: {
            $column: 'foobar',
          },
        },
      }, { columnKey: '$column' })).to.be.eql({
        'foo.column': { column: 'column' },
        'foo.bar': { column: 'foobar' },
      });
    });

  });

  describe('#path', () => {

    it('should get field definitions', () => {
      let schema = new Schema('Foo', {
        foo: true,
        bar: 'foobar',
        hello: {
          world: {
            column: 'helloworld',
          },
        },
      });

      expect(schema.path('foo')).to.be.eql({ column: 'foo' });
      expect(schema.path('bar')).to.be.eql({ column: 'foobar' });
      expect(schema.path('hello.world')).to.be.eql({ column: 'helloworld' });
      expect(schema.path('foobar')).to.be.equal(null);
    });

    it('should be able to set field definitions', () => {
      let schema = new Schema('Foo', {
        foo: true,
        bar: 'foobar',
        hello: {
          world: {
            column: 'helloworld',
          },
        },
      });

      schema.path('foo', { test: true });
      schema.path('bar', { test: null });
      schema.path('hello.world', { validation: 'string' });
      schema.path('hello.another', { column: 'hi there' });

      expect(schema.attributes).to.be.eql({
        'foo': {
          column: 'foo',
          test: true,
        },
        'bar': {
          column: 'foobar',
          test: null,
        },
        'hello.world': {
          column: 'helloworld',
          validation: 'string',
        },
        'hello.another': { column: 'hi there' },
      });
    });

    it('should throw with invalid data', () => {
      let schema = new Schema('Foo', {
        foo: true,
        bar: 'foobar',
        hello: {
          world: {
            column: 'helloworld',
          },
        },
      });

      expect(() => schema.path('foo', '')).to.throw(/pass an object/);
      expect(() => schema.path('foo', { column: 'bar' })).to.throw(/cannot override/);
      expect(() => schema.path('foobar', {})).to.throw(/invalid field definition/);
      expect(() => schema.path('foo.bar', { column: 'hello' })).to.throw(/cannot be extended/);
      expect(() => schema.path('hello', { column: 'hello' })).to.throw(/cannot be reduced/);
    });

  });

  describe('#pre and #post', () => {

    it('should be able to add pre and post hooks', () => {
      let schema = new Schema('Foo', {});

      expect(schema.hooks).to.be.eql({});

      schema.pre('save', () => {});
      schema.post('save', () => {});
      schema.pre('delete', () => {});
      schema.post('create', () => {});

      expect(schema.hooks).to.have.property('save');
      expect(schema.hooks.save.pre).to.have.length(1);
      expect(schema.hooks.save.post).to.have.length(1);
      expect(schema.hooks).to.have.property('delete');
      expect(schema.hooks.delete.pre).to.have.length(1);
      expect(schema.hooks).to.have.property('delete');
      expect(schema.hooks.delete.pre).to.have.length(1);
    });

    it('should break if method isn\'t a function', () => {
      let schema = new Schema('Foo', {});

      expect(schema.hooks).to.be.eql({});

      expect(() => schema.pre('save', 'foo')).to.throw(/invalid hook method/);
      expect(() => schema.post('save', 'foo')).to.throw(/invalid hook method/);
    });

  });

  describe('#method and #static', () => {

    it('should be able to add methods and static methods', () => {
      let schema = new Schema('Foo', {});

      schema.method('foo', () => {});
      schema.static('foo2', () => {});

      expect(schema.methods).to.have.property('foo');
      expect(schema.statics).to.have.property('foo2');
    });

    it('should break if method isn\'t a function', () => {
      let schema = new Schema('Foo', {});

      expect(() => schema.method('foo', 'foo')).to.throw(/invalid method/);
      expect(() => schema.static('foo', 'foo')).to.throw(/invalid static method/);
    });

  });

});
