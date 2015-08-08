'use strict';

angular.module('sfExplorerApp')
  .controller('RecentCtrl', function ($scope, recentObjects) {
    $scope.recentObjects = recentObjects;
  });
