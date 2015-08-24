var bluebird = require('bluebird'),
  config = require('config/environment'),
  jsforce = require('jsforce');


var RedisService = require('services/RedisService'),
  SalesforceService;

/**
 * A Service used to interact with Salesforce.
 */
SalesforceService = (function() {

  /**
   * Utility for getting a jsforce OAuth2 object instance.
   *
   * @returns {OAuth2} - A jsforce OAuth2 instance.
   */
  function getOAuth2() {
    return new jsforce.OAuth2({
      // you can change loginUrl to connect to sandbox or prerelease env.
      // loginUrl : 'https://test.salesforce.com',
      clientId: config.app.key,
      clientSecret: config.app.secret,
      redirectUri: config.app.callbackURL
    });
  }

  /**
   * Utility for getting a jsforce connection object.
   *
   * @returns {Connecton} - A jsforce connection object.
   */
  function getConnection() {
    var self = this;
    return RedisService.hgetall('AuthorizationInfo')
      .then(function(AuthInfo) {
        // Create a single instance of the jsForce connection object configured for OAuth.
        var conn;
        if (!AuthInfo) {
          conn = new jsforce.Connection({oauth2: self.getOAuth2()});
        } else {

          conn = new jsforce.Connection({
            oauth2 : {
              clientId : config.app.key,
              clientSecret : config.app.secret,
              redirectUri : config.app.callbackURL
            },
            instanceUrl : AuthInfo.instanceUrl,
            accessToken : AuthInfo.accessToken
          });
        }

        // Promisify all standard node functions from the connection.
        bluebird.promisifyAll(Object.getPrototypeOf(conn));
        return conn;
      })
      .catch(function(err) {
        console.error(err, 'Error encountered in getConnection');
        throw err;
      });

  }


  /**
   * Get the Authorization url used to start the OAuth flow with SF.
   * @returns {String} - The Url that should be navigated to for authorization.
   */
  function getAuthorizationUrl() {
    return this.getOAuth2().getAuthorizationUrl({scope: config.sf.scope});
  }

  /**
   * Handler function for configuring the jsForce library to use the provided code
   * when handling the callback from SF authorization.
   *
   * @param {String} code - The code provided by the SF OAuth2 flow.
   * @returns {Promise} - A promise that resolves after the configuration is complete.
   */
  function processOAuthCode(code) {
    var self = this;
    return RedisService.del('AuthorizationInfo')
      .then(function() {
        return self.getConnection()
      })
      .then(function(conn) {
        return [conn, conn.authorizeAsync(code)];
      })
      .spread(function(conn, userInfo) {
        return RedisService.hmset('AuthorizationInfo', {
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl,
          userId: userInfo.id,
          orgId: userInfo.organizationId
        });
      })
      .catch(function(e) {
        console.error(e);
        throw e;
      });
  }

  /**
   * Get the list of object types for the SF instance.
   *
   * @returns {Promise} - A promise that resolves to a list of object types.
   */
  function getObjectTypes() {
    return this.getConnection()
      .then(function(conn) {
        return conn.describeGlobalAsync();
      });
  }

  /**
   * Get the description of an sObject from Salesforce.
   *
   * @param {String} objectName - The name of the sObject for which to retireve
   * the description.
   * @returns {Promise} - A promise that resolves to an object describing the requested
   * sObject type.
   */
  function describeObject(objectName) {
    return this.getConnection()
      .then(function(conn) {
        return bluebird.promisify(conn.sobject(objectName).describe)();
      });
  }

  /**
   * Get recent objects from salesforce.  If no objectName params is provided
   * then a list of all most recent objects will be returned.
   *
   * @param {String} [objectName] - The name of the sobjectType to retrieve.
   * @returns {Promise} - A promise that resolves to a list of
   * recent objects.
   */
  function getRecentObjects(objectName) {
    if (objectName) {
      return this.getConnection()
        .then(function(conn) {
          return bluebird.fromNode(function(callback) {
            conn.sobject(objectName).recent(callback);
          }).then(function(result) {
            return result;
          });
        });

    } else {
      return this.getConnection()
        .then(function(conn) {
          return conn.recentAsync();
        });
    }
  }

  function getChatterCommunities() {
    return this.getConnection()
      .then(function(conn) {
        return conn.chatter.resource('/connect/communities').retrieve()
          .then(function(result) {
            console.log(result);
            return result;
          });
      });
  }

  return {
    describeObject: describeObject,
    getAuthorizationUrl: getAuthorizationUrl,
    getChatterCommunities: bluebird.method(getChatterCommunities),
    getConnection: getConnection,
    getObjectTypes: getObjectTypes,
    getOAuth2: getOAuth2,
    getRecentObjects: getRecentObjects,
    processOAuthCode: processOAuthCode
  }
})();

module.exports = SalesforceService;
