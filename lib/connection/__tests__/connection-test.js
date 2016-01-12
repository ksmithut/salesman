'use strict';

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

});
