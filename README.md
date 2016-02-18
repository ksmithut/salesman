# salesman

#### A Salesforce ORM for Node

This project came about with many frustrations working with a poorly implemented
salesforce instance. Lots of custom fields, relations, and breaking changes
later, we decided that we needed a good data modeling solution to interact with
salesforce. We first tried `waterline` and wrote `waterline-salesforce` as a
salesforce adapter, but we ended up making more hacks around it and soon we were
bypassing waterline functionality all together.

This is not a typical ORM. Most ORMs like `sequelize` or `mongoose` create
tables and schema definitions for your database. In our situation, the
the salesforce developers take care of that, so we don't have any sort of
"syncing" or "migration" features. We do, however, consume the database
definitions and validate that your schema definitions are valid according to
the salesforce API.

Right now it's kind of bare bones without a whole lot of validation, but it
does help you to make your salesforce interactions consistent, and doesn't
completely break when a salesforce developer removes a field out from underneath
you. In the roadmap, we plan on cleaning up a lot of the internals as well as
adding validation and taking advantage of some of the lesser known salesforce
apis.

# Installation

```bash
npm install --save salesman
```

# Usage

```js
// Import it
const salesman = require('salesman');

// make the connection
salesman.connect({
  username: '<your username>',
  password: '<your password>',
  connection: {
    loginUrl: 'https://login.salesforce.com',
    accessToken: '<your access token>',
  },
});

const LeadSchema = new saline.Schema('Lead', {
  id: 'Id',
  contact: {
    firstName: 'FirstName',
    lastName: 'LastName',
  },
  company: {
    column: 'Company',
    defaultValue: 'Unknown',
  },
});

const Lead = saline.model('Lead', LeadSchema);
// or
saline.model('Lead', LeadSchema);
const Lead = saline.getModel('Lead');

Lead
  .find()
  .select('*')
  .where({
    firstName: 'Jack',
    lastName: {
      $like: '%Bliss%',
    },
  })
  .limit(10)
  .exec()
  .then((leads) => {
    console.log(leads);
  });
```

# API

## `new Salesman()`

The root export is a new instance of the `Salesman` class. You have direct
access to this class if you wish to have multiple instances.

```js
const Salesman = require('salesman').Salesman;
const salesman = new Salesman();
```

This is in fact how you would have a multiple tenanted set of connections:

```js
const Salesman = require('salesman').Salesman;

const prod1 = new Salesman();
const prod2 = new Salesman();
const stage1 = new Salesman();

prod1.connect(/* put in your prod1 creds */);
prod2.connect(/* put in your prod2 creds */);
stage1.connect(/* put in your stage1 creds */);

const LeadSchema = new Schema('Lead', {
  id: 'Id',
});

prod1.model('Lead', LeadSchema);
prod2.model('Lead', LeadSchema);
stage1.model('Lead', LeadSchema);

prod1.getModel('Lead').find().exec().then(console.log);
prod2.getModel('Lead').find().exec().then(console.log);
stage1.getModel('Lead').find().exec().then(console.log);
```

You could of course make a more manageable tenant grabbing module around this,
but that seemed out of scope for this project.

## `salesman.connect(options)`

### Params

* `options.username` (String) - The username to login as.
* `options.password` (String) - The password to use
* `options.connection` (Object) - The connection object to pass into the
  [jsforce.Connection() constructor](https://jsforce.github.io/document/#connection)
* `options.maxConnectionTime` (Number) - The number of milliseconds a connection
  will be used until it should try to login again. Default is 6 hours, so after
  6 hours, the next query it makes will login again to make sure that you always
  have a valid session.

Returns a promise that resolves when a successful connection is made, or rejects
if it fails to make a connection.

### Example

```js
salesman
  .connect({
    username: '<username>',
    password: '<password>',
    connection: {
      loginUrl: 'https://test.salesforce.com'
    },
  })
  .then(() => console.log('connected to salesforce'))
  .catch((err) => console.error('error connecting to salesforce', err));
```

## `new Schema(sobjectName, attributes, config)`

### Params

* `sobjectname` (String) - The Salesforce Object Name. If it's a custom object,
  be sure to use the `__c` suffix in the actual object name, and not the label.
* `attributes` (Object) - This part deserves it's own section. see below
* `config` (Object) - A config object used for your schema. More on this in the
  attributes section.

### Attributes

Attributes are where the magic happens. If you've ever done lots of salesforce
integrations, you get pretty sick of inconsistent field naming conventions.
Attributes lets you define your own schema.

Example:

```js

const LeadSchema = new salesman.Schema('Lead', {
  id: 'Id', // Maps up to the Id field in salesforce
  contact: { // You can nest your own fields!
    firstName: 'FirstName', // Maps up to the FirstName field in salesforce
    lastName: 'LastName', // You get the picture
  },
  company: { // This one maps up to the Company field in salesforce. If you have an object with the column field, it will use the rest as a field definition and not nested properties.
    column: 'Company',
    defaultValue: 'Unknown',
  },
  attachments: { // This is a reference field. The ref property denotes the model name of the model that should be joined in the case of an include.
    ref: 'Attachments',
  },
}, { // This is the config object mentioned above. Below are the defaults
  columnKey: 'column',
  refKey: 'ref',
});

const AttachmentSchema = new salesman.Schema('Attachment', {
  id: 'Id',
  custom: {
    $column: 'SomeCustomField__c',
  },
}, {
  columnKey: '$column'
});

const Lead = saline.model('Lead', LeadSchema);
const Attachment = saline.model('Attachment', AttachmentSchema);

```
