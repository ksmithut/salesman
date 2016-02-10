'use strict';

const chai = require('chai');
const Transformer = require('../transformer');
const expect = chai.expect;

describe('Transformer', () => {

  describe('#format', () => {

    it('should format an object', () => {
      let trans = new Transformer({
        foo: 'bar',
        hello: 'world',
      });

      expect(trans.format({
        foo: 'foobar',
        hello: 'helloworld',
      })).to.be.eql({
        bar: 'foobar',
        world: 'helloworld',
      });
    });

    it('should handle nested properties', () => {
      let trans = new Transformer({
        'foo.bar': 'bar',
        'hello': 'hello.world',
      });

      expect(trans.format({
        foo: { bar: 'foobar' },
        hello: 'helloworld',
      })).to.be.eql({
        bar: 'foobar',
        hello: { world: 'helloworld' },
      });
    });

    it('should format an object with column given in constructor', () => {
      let trans = new Transformer({
        foo: { column: 'bar' },
        hello: { column: 'world' },
      }, 'column');

      expect(trans.format({
        foo: 'foobar',
        hello: 'helloworld',
      })).to.be.eql({
        bar: 'foobar',
        world: 'helloworld',
      });
    });

    it('should fill empty values with null', () => {
      let trans = new Transformer({
        foo: 'bar',
        hello: 'world',
      });

      expect(trans.format({
        foo: 'foobar',
      })).to.be.eql({
        bar: 'foobar',
        world: null,
      });
    });

  });

  describe('#unformat', () => {

    it('should unformat an object', () => {
      let trans = new Transformer({
        foo: 'bar',
        hello: 'world',
      });

      expect(trans.unformat({
        bar: 'foobar',
        world: 'helloworld',
      })).to.be.eql({
        foo: 'foobar',
        hello: 'helloworld',
      });
    });

    it('should handle nested properties', () => {
      let trans = new Transformer({
        'foo.bar': 'bar',
        'hello': 'hello.world',
      });

      expect(trans.unformat({
        bar: 'foobar',
        hello: { world: 'helloworld' },
      })).to.be.eql({
        foo: { bar: 'foobar' },
        hello: 'helloworld',
      });
    });

    it('should unformat an object with column given in constructor', () => {
      let trans = new Transformer({
        foo: { column: 'bar' },
        hello: { column: 'world' },
      }, 'column');

      expect(trans.unformat({
        bar: 'foobar',
        world: 'helloworld',
      })).to.be.eql({
        foo: 'foobar',
        hello: 'helloworld',
      });
    });

    it('should fill empty values with null', () => {
      let trans = new Transformer({
        foo: 'bar',
        hello: 'world',
      });

      expect(trans.unformat({
        bar: 'foobar',
      })).to.be.eql({
        foo: 'foobar',
        hello: null,
      });
    });

  });

  describe('#formatKeys', () => {

    it('should format an object and not fill in empty values', () => {
      let trans = new Transformer({
        foo: 'bar',
        hello: 'world',
      });

      expect(trans.formatKeys({
        foo: 'foobar',
      })).to.be.eql({
        bar: 'foobar',
      });
    });

    it('should use glob matching', () => {
      let trans = new Transformer({
        'foo.bar': 'bar',
        'foo.helloWorld': 'hello',
        'contact1.firstName': 'firstFirst',
        'contact2.firstName': 'secondFirst',
        'address.street': 'street',
        'address.city': 'city',
        'address.state': 'state',
        'address.zip': 'zip',
      });

      expect(trans.formatKeys({
        'foo.*': 1,
        '*.firstName': 2,
        'address': 3,
      })).to.be.eql({
        bar: 1,
        hello: 1,
        firstFirst: 2,
        secondFirst: 2,
        street: 3,
        city: 3,
        state: 3,
        zip: 3,
      });
    });

  });

});
