'use strict';

angular.module('sfExplorerApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('recent', {
        url: '/recent/:name',
        resolve: {
          recentObjects: function($state, $stateParams, SalesforceFactory) {
            if ($stateParams.name) {
              return SalesforceFactory.getRecentObjects($stateParams.name);
            }
            return SalesforceFactory.getRecentObjects();
          }
        },
        templateUrl: 'app/recent/recent.html',
        controller: 'RecentCtrl'
      });
  });
