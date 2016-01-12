'use strict';

const nock = require('nock');

module.exports = {
  serverUrl: 'https://my-company.nv19.my.salesforce.com/services/Soap/u/34.0/00Dm0000000aaaa',
  sessionId: '1234',
  userId: '0051600000aaaaaaaa',
  organizationId: '00Dm0000000aaaaaaa',
  loginUrl: 'https://test.salesforce.com',
};

nock(module.exports.loginUrl)
  .post(/^\/services\/Soap\/u\/[^\/]*$/)
  .reply(201, () => {
    return `
      <serverUrl>${module.exports.serverUrl}</serverUrl>
      <sessionId>${module.exports.sessionId}</sessionId>
      <userId>${module.exports.userId}</userId>
      <organizationId>${module.exports.organizationId}</organizationId>
    `;
  });
