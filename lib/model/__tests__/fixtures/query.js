'use strict';

exports.definition = () => ({
  fields: {
    'id': {},
    'contact.firstName': {},
    'contact.lastName': {},
    'contact.phoneNumber': {},
    'address.street': {},
    'address.city': {},
    'address.state': {},
    'address.zip': {},
    'assignedRep.id': {},
    'assignedRep.name': {},
    'activities': {
      ref: 'Activity',
      collection: true,
    },
    'attachments': {
      ref: 'Attachments',
      collection: true,
    },
  },
});

exports.where = () => ({
  where: {
    'contact': {
      firstName: 'Jack',
      phoneNumber: { $like: '801%' },
    },
    'contact.lastName': 'Bliss',
  },
});

exports.select = () => ({
  select: {
    'id': true,
    'contact': true,
    'address.*': true,
    'assignedRep.name': true,
    'assignedRep': {
      id: true,
    },
  },
});

exports.select2 = () => ({
  select: [ 'id', 'contact', 'address.*', 'assignedRep.name', 'assignedRep.id' ],
});
exports.select3 = () => ({
  select: 'id contact address.* assignedRep.name assignedRep.id',
});

exports.include = () => ({
  includes: [
    'activities',
    { ref: 'attachments', query: {} },
  ],
});

exports.include2 = () => ({ include: 'activities' });
exports.include3 = () => ({
  includes: {
    ref: 'attachments',
    query: {},
  },
});
