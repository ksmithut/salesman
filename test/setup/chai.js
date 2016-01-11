'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiSpies = require('chai-spies');

chai.use(chaiAsPromised);
chai.use(chaiSpies);

module.exports = chai;
