angular.module('sfExplorerApp')
  .constant('SALESFORCE_URLS', {
    OBJECT_DESCRIPTION: '/api/describe/',
    OBJECT_TYPES: '/api/objectTypes',
    RECENT_OBJECTS: '/api/objects/recent?objectName='
  })
  .factory('httpSalesforce', function($http, $filter, SALESFORCE_URLS) {
    return {
      getObjectTypes: function() {
        return $http.get(SALESFORCE_URLS.OBJECT_TYPES)
          .then(function(result) {
            return result.data;
          });
      },
      getObjectDescription: function(objectName) {
        return $http.get(SALESFORCE_URLS.OBJECT_DESCRIPTION +  objectName)
          .then(function(result) {
            return result.data;
          });
      },
      getRecentObjects: function(objectName) {
        return $http.get(SALESFORCE_URLS.RECENT_OBJECTS + (objectName || ''))
          .then(function(result) {
            return result.data;
          })
      }
    };
  });
