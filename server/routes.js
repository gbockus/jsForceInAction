/**
 * Main application routes
 */

'use strict';

var config = require('./config/environment'),
  errors = require('./components/errors'),
  path = require('path');

var SalesforceService = require('services/SalesforceService');

module.exports = function(app) {

  app.get('/oauth2/auth', function(req, res) {
    res.redirect(SalesforceService.getAuthorizationUrl());
  });

  app.get('/callback', function(req, res) {
    var code = req.param('code');
    SalesforceService.processOAuthCode(code)
      .then(function() {
        res.redirect('/explorer');
      })
      .catch(function() {
        res.redirect('error.html');
      })
  });

  // SF routes
  app.get('/api/objectTypes', function(req, res) {

    SalesforceService.getObjectTypes()
      .then(function(objectTypes) {
        res.send(objectTypes.sobjects);
      })
      .catch(function(err) {
        return console.error(err);
      });

  });

  app.get('/api/describe/:objectName', function(req, res) {

    var objectName = req.params.objectName;
    SalesforceService.describeObject(objectName)
      .then(function(objMetadata) {
        res.send(objMetadata);
      })
      .catch(function(err) {
        return console.error(err);
      });

  });

  app.get('/api/objects/recent', function(req, res) {
    var objectName = req.query.objectName;
    SalesforceService.getRecentObjects(objectName)
      .then(function(recentObjects) {
        res.send(recentObjects);
      })
      .catch(function(err) {
        return console.error(err);
      });
  });

  app.get('/api/chatter/communities', function(req,res) {
    SalesforceService.getChatterCommunities()
      .then(function(communities) {
        res.send(communities);
      })
      .catch(function(err) {
        return console.error(err);
      })
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });

};
