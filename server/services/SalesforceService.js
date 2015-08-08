var bluebird = require('bluebird'),
   config = require('config/environment'),
  jsforce = require('jsforce');


var RedisService = require('services/RedisService'),
  SalesforceService;

SalesforceService = (function() {

  var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: config.app.key,
    clientSecret: config.app.secret,
    redirectUri: config.app.callbackURL
  });
  var conn = new jsforce.Connection({oauth2: oauth2});
  bluebird.promisifyAll(Object.getPrototypeOf(conn));

  function getAuthorizationUrl() {
    return oauth2.getAuthorizationUrl({scope: config.sf.scope});
  }

  function processOAuthCode(code) {
    return RedisService.del('AuthorizationInfo')
      .then(function() {
        return conn.authorizeAsync(code)
      })
      .then(function(userInfo) {
        return RedisService.hmset('AuthorizationInfo', {
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl,
          userId: userInfo.id,
          orgId: userInfo.organizationId
        });
      });
  }

  function getObjectTypes() {
    return conn.describeGlobalAsync();
  }

  function describeObject(objectName) {
    var describeAsync = bluebird.promisify(conn.sobject(objectName).describe);
    return describeAsync();
  }

  function getRecentObjects(objectName) {
    if (objectName) {
      //debugger;
      //console.log('objectName defined:' + objectName);
      //var asyncFunc = bluebird.promisify(conn.sobject(objectName).recent);
      //debugger;
      //return asyncFunc(objectName);

      return bluebird.fromNode(function(callback) {
        conn.sobject(objectName).recent(callback);
      }).then(function(result) {
        console.log(result);
        return result;
      });
    } else {

      return conn.recentAsync();
    }
  }


  return {
    describeObject: describeObject,
    getAuthorizationUrl: getAuthorizationUrl,
    getObjectTypes: getObjectTypes,
    getRecentObjects: getRecentObjects,
    processOAuthCode: processOAuthCode
  }
})();

module.exports = SalesforceService;
