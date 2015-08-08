'use strict';

angular.module('sfExplorerApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('explorer', {
        abstract: true,
        templateUrl: 'app/explorer/explorer.html',
        controller: 'ExplorerCtrl',
        resolve: {
          objectTypes: function(SalesforceFactory) {
            return SalesforceFactory.getObjectTypes();
          }
        }
      })
      .state('explorer.search', {
        url: '/explorer',
        views: {
          search: {
            templateUrl: 'app/explorer/search.html'
          }
        }
      })
      .state('explorer.description', {
        url: '/explorer/:objectName',
        views: {
          description: {
            templateUrl: 'app/explorer/description.html',
            controller: 'ExplorerDescription',
          }
        },
        resolve: {
          objectDescription: function($state, $stateParams, $timeout, SalesforceFactory) {
            if ($stateParams.objectName) {
              return SalesforceFactory.getObjectDescription($stateParams.objectName)
            } else {
              $timeout(function() {
                $state.go('explorer');
              });
            }
          }

        }
      });
  });
