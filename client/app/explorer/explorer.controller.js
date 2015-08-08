'use strict';

angular.module('sfExplorerApp')
  .controller('ExplorerCtrl', function ($scope, $state, SalesforceFactory, objectTypes) {
    $scope.objectTypes = objectTypes;
    $scope.data = {};

    $scope.onSearchChange = function() {
      $scope.data.selectedObject = undefined;
    };

    $scope.selectObject = function(obj) {
      $scope.data.selectedObject = obj;
      $state.go('explorer.description', {
        objectName: $scope.data.selectedObject.name
      });
    };

  })
  .controller('ExplorerDescription', function($scope, $state, objectDescription) {

    $scope.data.objectDescription = objectDescription;

    $scope.goToRecent = function() {
      $state.go('recent', {name: $scope.data.objectDescription.name});
    };

    $scope.isSimpleValue = function(val) {
      return !(angular.isArray(val) || angular.isObject(val));
    };

    $scope.goToSearch = function() {
      $state.go('explorer.search');
    };
  });
