'use strict';

const RECORD_TYPE_FIELD = 'RecordTypeId';

module.exports = function normalizeDescribe(describe) {
  return {
    creatable: describe.createable, // Yes, this is a mispelling in jsforce
    deletable: describe.deletable,
    updatable: describe.updateable, // Yes, this is a mispelling in jsforce
    deprecated: describe.deprecatedAndHidden,
    keyPrefix: describe.keyPrefix,
    label: describe.label,
    labelPlural: describe.labelPlural,
    childRelationships: normalizeChildRelationships(describe),
    fields: normalizeFields(describe),
  };
};

function normalizeChildRelationships(describe) {
  return describe.childRelationships.reduce((hash, child) => {
    hash[child.childSObject] = {
      deprecated: child.deprecatedAndHidden,
      field: child.field,
      relationshipName: child.relationshipName,
    };
    return hash;
  }, {});
}

function normalizeFields(describe) {
  let fields = (describe.fields || []).reduce((fieldHash, fieldInfo) => {
    let field = {
      creatable: fieldInfo.createable, // Yes, this is a mispelling in jsforce
      updatable: fieldInfo.updateable, // Yes, this is a mispelling in jsforce
      required: !fieldInfo.nillable,
      defaultValue: fieldInfo.defaultValue,
      deprecated: fieldInfo.deprecatedAndHidden,
      label: fieldInfo.label,
      name: fieldInfo.name,
      relationshipName: fieldInfo.relationshipName,
      referenceTo: fieldInfo.referenceTo,
      restrictedPicklist: fieldInfo.restrictedPicklist,
      type: fieldInfo.type,
    };

    field.picklistValues = fieldInfo.picklistValues.reduce((values, value) => {
      if (!value.active) return values;
      if (value.defaultValue) field.defaultValue = value.value;
      values.push({
        label: value.label,
        value: value.value,
      });
      return values;
    }, []);

    fieldHash.byName[field.name] = field;
    if (field.relationshipName) fieldHash.byRelationship[field.relationshipName] = field;
    return fieldHash;
  }, { byName: {}, byRelationship: {} });

  let recordTypeField = fields.byName[RECORD_TYPE_FIELD];

  if (recordTypeField) {
    recordTypeField.restrictedPicklist = true;
    recordTypeField.picklistValues = (describe.recordTypeInfos || []).reduce((values, value) => {
      if (!value.available) return values;
      if (value.defaultRecordTypeMapping) recordTypeField.defaultValue = value.recordTypeId;
      values.push({
        label: value.name,
        value: value.recordTypeId,
      });
      return values;
    }, []);
  }

  return fields;
}
