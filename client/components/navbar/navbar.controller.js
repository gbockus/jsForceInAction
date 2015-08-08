'use strict';

angular.module('sfExplorerApp')
  .controller('NavbarCtrl', function($scope, $location) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/main'
    }, {
      'title': 'sfExplorer',
      'link': '/explorer'
    }, {
      'title': 'Recent',
      'link': '/recent/'
    }];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return $location.path().startsWith(route);
    };
  });
