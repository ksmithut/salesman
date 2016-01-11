# salesman

#### A Salesforce ORM for Node

Coming Soon!

# Features


## Connection
- Retry logic
  - session expired
  - max connection time
  - instance url not found
- Multiple tenants
  - default tenant

## Schema
- Nested keys
- Attribute definition
- instance methods
- static methods
- lifecycle hook declarations
- plugins
- virtual properties

## Query
- lifecycle
  - document
    - validate
    - save
      - create
      - update
    - delete
  - query (anything that can use where)
    - count
    - find
    - update



```js
import salesman from 'salesman';

salesman.connect({
  defaultTenant: 'prod',
  defaults: {
    maxConnectionTime: 10 * 60 * 60 * 1000, // 10 hours
    connection: {
      loginUrl: 'https://test.salesforce.com',
    },
  },
  tenants: {
    dev: {
      username: '',
      password: '',
      connection: {
        accessToken: '',
      },
    },
    int: {
      username: '',
      password: '',
      connection: {
        accessToken: '',
      },
    },
    prod: [{
      username: '',
      password: '',
      connection: {
        loginUrl: 'https://login.salesforce.com',
        accessToken: '',
      },
    }],
  },
});
```


