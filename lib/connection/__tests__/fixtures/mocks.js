'use strict';

const nock = require('nock');

exports.serverUrl = 'https://my-company.nv19.my.salesforce.com/services/Soap/u/34.0/00Dm0000000aaaa';
exports.sessionId = '1234';
exports.userId = '0051600000aaaaaaaa';
exports.organizationId = '00Dm0000000aaaaaaa';
exports.loginUrl = 'https://test.salesforce.com';

nock(exports.loginUrl)
  .post(/^\/services\/Soap\/u\/[^\/]*$/)
  .times(Infinity)
  .reply((uri, requestBody) => {
    let status = 201;
    let body = `
      <serverUrl>${exports.serverUrl}</serverUrl>
      <sessionId>${exports.sessionId}</sessionId>
      <userId>${exports.userId}</userId>
      <organizationId>${exports.organizationId}</organizationId>
    `;

    let password = requestBody.match(/<password>([^<]*)<\/password>/)[1];

    if (password !== 'test') {
      status = 401;
      body = '<faultstring>Unauthorized</faultstring>';
    }

    return [ status, body ];
  });
