'use strict';

const chai = require('chai');
const Transformer = require('../transformer');

const expect = chai.expect;

describe('lib/model/transformer', () => {

  it('should be able to format and unformat nested objects', () => {
    let transformer = new Transformer({
      'foo.bar': 'hello',
      'foo.bar2': 'world',
      'hello': 'worldly.hello',
    });
    let input = {
      foo: {
        bar: 'man',
        bar2: 'child',
      },
      hello: 'there',
    };
    let output = {
      hello: 'man',
      world: 'child',
      worldly: { hello: 'there' },
    };

    expect(transformer.format(input)).to.be.eql(output);
    expect(transformer.unformat(output)).to.be.eql(input);
  });

  it('should use default values when values are not there', () => {
    let transformer = new Transformer({
      'foo.bar': 'hello',
      'foo.bar2': 'world',
      'hello': 'worldly.hello',
    });
    let input = {
      foo: {
        bar: 'man',
      },
      hello: 'there',
    };
    let output = {
      hello: 'man',
      world: null,
      worldly: { hello: 'there' },
    };

    expect(transformer.format(input)).to.be.eql(output);

    input.foo.bar2 = null;
    delete output.world;
    expect(transformer.unformat(output)).to.be.eql(input);
  });

  it('should not fail if top level nested path is null', () => {
    let transformer = new Transformer({
      'foo.bar': 'hello',
      'foo.bar2': 'world',
      'hello': 'worldly.hello',
    });

    let input = { foo: null, hello: 'world' };
    let output = {
      hello: null,
      world: null,
      worldly: { hello: 'world' },
    };

    expect(transformer.format(input)).to.be.eql(output);
    expect(transformer.unformat({ wordly: null })).to.be.eql({
      foo: {
        bar: null,
        bar2: null,
      },
      hello: null,
    });
  });

});
