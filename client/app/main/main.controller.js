'use strict';

angular.module('sfExplorerApp')
  .controller('MainCtrl', function ($scope, $window) {
    $scope.doLogin = function() {
      $window.location.href = '/oauth2/auth'
    };

  });
