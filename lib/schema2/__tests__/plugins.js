'use strict';

const chai = require('chai');
const newSchema = require('./fixtures/new-schema');
const expect = chai.expect;

describe('Schema#plugin', () => {

  it('should call plugin functions', () => {
    let schema = newSchema();
    let pluginSpy = chai.spy((theSchema) => {
      expect(schema).to.be.equal(theSchema);
    });

    schema.plugin(pluginSpy);
    expect(pluginSpy).to.have.been.called.exactly(1);
  });

  it('should use default config', () => {
    let schema = newSchema();
    let pluginSpy = chai.spy((theSchema, config) => {
      expect(config).to.be.eql({
        foo: false,
        hello: {
          world: 'foobar',
          foo: true,
        },
      });
    });

    pluginSpy.defaultConfig = {
      foo: 'bar',
      hello: {
        world: 'foobar',
      },
    };
    schema.plugin(pluginSpy, { foo: false, hello: { foo: true } });
    expect(pluginSpy).to.have.been.called.exactly(1);
  });

  it('should accept strings as config', () => {
    let schema = newSchema();
    let pluginSpy = chai.spy((theSchema, config) => {
      expect(config).to.be.equal('foobar');
    });

    schema.plugin(pluginSpy, 'foobar');
    expect(pluginSpy).to.have.been.called.exactly(1);
  });

});
