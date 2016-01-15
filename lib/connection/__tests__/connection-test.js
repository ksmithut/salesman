'use strict';

const Bluebird = require('bluebird');
const chai = require('chai');
const Connection = require('../');
const mocks = require('./fixtures/mocks');

const expect = chai.expect;

describe('lib/connection', () => {

  it('should establish a connection', () => {
    let conn = new Connection({
      username: 'test',
      password: 'test',
      connection: {
        loginUrl: mocks.loginUrl,
      },
    });

    return conn.getConnection()
      .then((connection) => {
        expect(connection).to.be.an('object');
        expect(connection.userInfo).to.be.an('object');
      });
  });

  it('should reuse connection if maxConnectionTime has not expired', () => {
    let conn = new Connection({
      username: 'test',
      password: 'test',
      connection: {
        loginUrl: mocks.loginUrl,
      },
    });

    let previous = 0;

    return conn.getConnection()
      .then(() => {
        expect(conn.connectionLength).to.be.greaterThan(previous);
        previous = conn.connectionLength;
        return Bluebird.delay(50);
      })
      .then(() => conn.getConnection())
      .then(() => {
        expect(conn.connectionLength).to.be.greaterThan(previous);
      });
  });

  it('should try to create another connection once maxConnectionTime has expired', () => {
    let max = 100;
    let conn = new Connection({
      maxConnectionTime: 100,
      username: 'test',
      password: 'test',
      connection: {
        loginUrl: mocks.loginUrl,
      },
    });

    return conn.getConnection()
      .then(() => {
        expect(conn.connectionLength).to.be.lessThan(max);
        return Bluebird.delay(max);
      })
      .then(() => conn.getConnection())
      .then(() => {
        expect(conn.connectionLength).to.be.lessThan(max);
      });
  });

  it('should try to create another connection if invalidateConnection is called', () => {
    let conn = new Connection({
      username: 'test',
      password: 'test',
      connection: {
        loginUrl: mocks.loginUrl,
      },
    });

    let previous = 0;
    let diff;

    return conn.getConnection()
      .then(() => {
        previous = conn.connectionLength;
        diff = Date.now();
        conn.invalidateConnection();
        return conn.getConnection();
      })
      .then(() => {
        diff = Date.now() - diff;
        expect(conn.connectionLength).to.be.lessThan(previous + diff);
      });
  });

  it('should get connectionLength of 0 if no connection has been made', () => {
    let conn = new Connection({
      username: 'test',
      password: 'test',
      connection: {
        loginUrl: mocks.loginUrl,
      },
    });

    expect(conn.connectionLength).to.be.equal(0);
  });

  it('should invalidate the connection if login error happens', () => {
    let conn = new Connection({
      username: 'test',
      password: 'test1',
      connection: {
        loginUrl: mocks.loginUrl,
      },
    });

    return expect(conn.getConnection()).to.eventually.be.rejectedWith('Unauthorized').then(() => {
      expect(conn.connectionLength).to.be.equal(0);
    });
  });

});
