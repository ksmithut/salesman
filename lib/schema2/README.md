# Schema

A Schema object is a reusable collection of attributes, methods, and behaviors
tied to a Salesforce object type. It is merely the definition that can be used
across different salesforce connections. No salesforce api transactions happen
at this layer, just business logic.

A Schema is built up of these main components:

* **Object Name** The Salesforce object type to tie into. This is the raw object
  name, such as `Lead` or `Opportunity` or `CustomType__c`

# Usage

```js
let LeadSchema = new Schema('Lead', {
  id: 'Id',
  contact: {
    firstName: 'FirstName',
    lastName: 'LastName',
    email: {
      column: 'Email',
    }
  },
  address: {
    street: 'Street',
    city: 'City',
    zip: 'PostalCode',
    state: 'State',
  },
  account: {
    ref: 'Account',
  },
  attachments: {
    ref: 'Attachments',
    collection: true,
  }
}, {
  columnKey: 'column',
  refKey: 'ref',
});

console.log(LeadSchema.objectName); // 'Lead'
```
