angular.module('sfExplorerApp')
  .factory('SalesforceFactory', function(httpSalesforce) {
    return {
      getObjectTypes: function() {
        return httpSalesforce.getObjectTypes();
      },
      getObjectDescription: function(objectName) {
        return httpSalesforce.getObjectDescription(objectName);
      },
      getRecentObjects: function(objectName) {
        return httpSalesforce.getRecentObjects(objectName);
      }
    }

  });
