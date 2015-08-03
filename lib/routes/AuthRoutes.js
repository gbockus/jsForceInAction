var config = require('config'),
  jsforce = require('jsforce'),
  RedisService = require('lib/services/RedisService');

var AuthRoutes = (function() {
  return {
    initialize: function(app) {

      //
      // OAuth2 client information can be shared with multiple connections.
      //

      var oauth2 = new jsforce.OAuth2({
        // you can change loginUrl to connect to sandbox or prerelease env.
        // loginUrl : 'https://test.salesforce.com',
        clientId : config.get('app.key'),
        clientSecret : config.get('app.secret'),
        redirectUri : config.get('app.callbackURL')
      });

      //
      // Get authz url and redirect to it.
      //
      app.get('/oauth2/auth', function(req, res) {
        res.redirect(oauth2.getAuthorizationUrl({ scope : config.get('sf.scope') }));
      });

      app.get('/callback', function(req, res) {
        var conn = new jsforce.Connection({ oauth2 : oauth2 });
        var code = req.param('code');
        conn.authorize(code, function(err, userInfo) {
          if (err) {
            console.error(err);
            res.redirect('/error.html');
          }
          // Now you can get the access token, refresh token, and instance URL information.
          // Save them to establish connection next time.
          console.log(conn.accessToken);
          console.log(conn.refreshToken);
          console.log(conn.instanceUrl);
          console.log("User ID: " + userInfo.id);
          console.log("Org ID: " + userInfo.organizationId);
          RedisService.del('AuthorizationInfo');
          RedisService.hmset('AuthorizationInfo', {
            accessToken: conn.accessToken,
            instanceUrl: conn.instanceUrl,
            userId: userInfo.id,
            orgId: userInfo.organizationId
          });
          res.redirect('/');
        });
      });
    }
  };
})();

module.exports = AuthRoutes;