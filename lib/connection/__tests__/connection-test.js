'use strict';

const Bluebird = require('bluebird');
const chai = require('chai');
const Connection = require('../');
const loginMocks = require('./fixtures/mocks/sf-login');

const expect = chai.expect;

describe('lib/connection', () => {

  it('should establish a connection', () => {
    let conn = new Connection({
      username: 'test',
      password: 'test',
      connection: {
        loginUrl: loginMocks.loginUrl,
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
        loginUrl: loginMocks.loginUrl,
      },
    });

    let previous = 0;

    return conn.getConnection()
      .then(() => {
        expect(conn.connectionLength).to.be.greaterThan(previous);
        previous = conn.connectionLength;
        return Bluebird.delay(100);
      })
      .then(() => conn.getConnection())
      .then(() => {
        expect(conn.connectionLength).to.be.greaterThan(previous);
      });
  });

  it('should try to create another connection once maxConnectionTime has expired', () => {
    let max = 500;
    let conn = new Connection({
      maxConnectionTime: 500,
      username: 'test',
      password: 'test',
      connection: {
        loginUrl: loginMocks.loginUrl,
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

});
