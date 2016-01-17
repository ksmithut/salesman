# Salesman Models

This is the more complex piece of software, where we take in the field
definitions from salesforce and merge them in. There are so many fields that
used for salesforce (such as layout related ones) that we simply do not care
about. Below is a table of all of the fields that come back from a sobject
describe call. We have `✓` next to all of the ones we feel like we can utilize
in this software:

|   | Field name                                 | Value type                     | Notes |
| - | ------------------------------------------ | ------------------------------ | ----- |
|   | actionOverrides[]                          | `object`                       |   |
|   | actionOverrides[].isAvailableInTouch       | `boolean`                      |   |
|   | actionOverrides[].name                     | `'{action name}'`              |   |
|   | actionOverrides[].pageId                   | `'{sfId}'`                     |   |
|   | actionOverrides[].url                      | `'{action url}'`               |   |
|   | activateable                               | `boolean`                      |   |
| ✓ | childRelationships[]                       | `object`                       |   |
|   | childRelationships[].cascadeDelete         | `boolean`                      |   |
| ✓ | childRelationships[].childSObject          | `'{object name}'`              |   |
| ✓ | childRelationships[].deprecatedAndHidden   | `boolean`                      |   |
| ✓ | childRelationships[].field                 | `'{foriegn field name}'`       |   |
|   | childRelationships[].junctionIdListName    | ?                              |   |
|   | childRelationships[].junctionReferenceTo   | ?                              |   |
| ✓ | childRelationships[].relationshipName      | `'{name to use for populate}'` |   |
|   | childRelationships[].restrictedDelete      | `boolean`                      |   |
|   | compactLayoutable                          | `boolean`                      |   |
| ✓ | createable                                 | `boolean`                      |   |
|   | custom                                     | `boolean`                      |   |
|   | customSetting                              | `boolean`                      |   |
| ✓ | deletable                                  | `boolean`                      |   |
| ✓ | deprecatedAndHidden                        | `boolean`                      |   |
|   | feedEnabled                                | `boolean`                      |   |
|   | fields[]                                   | `object`                       |   |
|   | fields[].autoNumber                        | `boolean`                      |   |
|   | fields[].byteLength                        | `number` (int)                 |   |
|   | fields[].calculated                        | `boolean`                      |   |
|   | fields[].calculatedFormula                 | ?                              |   |
|   | fields[].cascadeDelete                     | `boolean`                      |   |
|   | fields[].caseSensitive                     | `boolean`                      |   |
| ✓ | fields[].controllerName                    | `{field name for dependent}`   |   |
| ✓ | fields[].createable                        | `boolean`                      |   |
|   | fields[].custom                            | `boolean`                      |   |
| ✓ | fields[].defaultValue                      | ?                              |   |
|   | fields[].defaultValueFormula               | ?                              |   |
| ✓ | fields[].defaultedOnCreate                 | `boolean`                      |   |
| ✓ | fields[].dependentPicklist                 | `boolean`                      |   |
| ✓ | fields[].deprecatedAndHidden               | `boolean`                      |   |
|   | fields[].digits                            | `number` (int)                 |   |
|   | fields[].displayLocationInDecimal          | `boolean`                      |   |
|   | fields[].encrypted                         | `boolean`                      |   |
|   | fields[].externalId                        | `boolean`                      |   |
|   | fields[].extraTypeInfo                     | ?                              |   |
|   | fields[].filterable                        | `boolean`                      |   |
|   | fields[].filteredLookupInfo                | ?                              |   |
|   | fields[].groupable                         | `boolean`                      |   |
|   | fields[].highScaleNumber                   | `boolean`                      |   |
|   | fields[].htmlFormatted                     | `boolean`                      |   |
|   | fields[].idLookup                          | `boolean`                      |   |
|   | fields[].inlineHelpText                    | ?                              |   |
| ✓ | fields[].label                             | `'{field label}'`              |   |
|   | fields[].length                            | `number` (int)                 |   |
|   | fields[].mask                              | ?                              |   |
|   | fields[].maskType                          | ?                              |   |
| ✓ | fields[].name                              | `'{field name}'`               |   |
|   | fields[].nameField                         | `boolean`                      |   |
|   | fields[].namePointing                      | `boolean`                      |   |
| ✓ | fields[].nillable                          | `boolean`                      |   |
|   | fields[].permissionable                    | `boolean`                      |   |
| ✓ | fields[].picklistValues[]                  | `object`                       |   |
| ✓ | fields[].picklistValues[].active           | `boolean`                      |   |
| ✓ | fields[].picklistValues[].defaultValue     | `boolean`                      |   |
| ✓ | fields[].picklistValues[].label            | `string`                       |   |
| ✓ | fields[].picklistValues[].validFor         | `'{for dependent picklists}'`  |   |
| ✓ | fields[].picklistValues[].value            | `'{actual value to save}'`     |   |
|   | fields[].precision                         | `number` (int)                 |   |
|   | fields[].queryByDistance                   | `boolean`                      |   |
|   | fields[].referenceTargetField              | ?                              |   |
| ✓ | fields[].referenceTo[]                     | `'{possible foreign objects}'` |   |
| ✓ | fields[].relationshipName                  | `'{name to use for populate}'` |   |
|   | fields[].relationshipOrder                 | ?                              |   |
|   | fields[].restrictedDelete                  | `boolean`                      |   |
| ✓ | fields[].restrictedPicklist                | `boolean`                      |   |
|   | fields[].scale                             | `number` (type?)               |   |
|   | fields[].soapType                          | `'{soapType}'`                 |   |
|   | fields[].sortable                          | `boolean`                      |   |
| ✓ | fields[].type                              | `'{field type}'`               | [ 'id', 'boolean', 'reference', 'string', 'picklist', 'textarea', 'double', 'address', 'phone', 'email', 'url', 'currency', 'int', 'date', 'datetime', 'location', 'encryptedstring', 'percent', 'multipicklist' ] |
|   | fields[].unique                            | `boolean`                      |   |
| ✓ | fields[].updateable                        | `boolean`                      |   |
|   | fields[].writeRequiresMasterRead           | `boolean`                      |   |
| ✓ | keyPrefix                                  | `'{id prefix}'`                |   |
| ✓ | label                                      | `string`                       |   |
| ✓ | labelPlural                                | `string`                       |   |
|   | layoutable                                 | `boolean`                      |   |
|   | listviewable                               | ?                              |   |
|   | lookupLayoutable                           | ?                              |   |
|   | mergeable                                  | `boolean`                      |   |
|   | name                                       | `string`                       |   |
|   | namedLayoutInfos[]                         | ?                              |   |
|   | queryable                                  | `boolean`                      |   |
| ✓ | recordTypeInfos[]                          | `object`                       |   |
| ✓ | recordTypeInfos[].available                | `boolean`                      |   |
| ✓ | recordTypeInfos[].defaultRecordTypeMapping | `boolean`                      |   |
| ✓ | recordTypeInfos[].name                     | `{record type label}`          |   |
| ✓ | recordTypeInfos[].recordTypeId             | `string`                       |   |
|   | recordTypeInfos[].urls                     | `object`                       |   |
|   | recordTypeInfos[].urls[key]                | `{uri to record type page}`    |   |
|   | replicateable                              | `boolean`                      |   |
|   | retrieveable                               | `boolean`                      |   |
|   | searchLayoutable                           | `boolean`                      |   |
|   | searchable                                 | `boolean`                      |   |
|   | triggerable                                | `boolean`                      |   |
|   | undeletable                                | `boolean`                      |   |
| ✓ | updateable                                 | `boolean`                      |   |
|   | urls                                       | `object`                       |   |
|   | urls[key]                                  | `'{path or url}'`              |   |

