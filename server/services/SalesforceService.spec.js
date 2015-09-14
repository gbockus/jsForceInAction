var bluebird = require('bluebird'),
  sinon = require('sinon'),
  chai = require('chai'),
  config = require('config/environment'),
  jsforce = require('jsforce'),
  RedisService = require('./RedisService'),
  SalesforceService = require('./SalesforceService');


// Adds utility should function that make assertions easy.
var should = chai.should();

describe('SalesforceService Unit tests', function() {
  var getOAuth2Stub, getAuthorizationUrl, getConnectionStub;

  beforeEach(function(done) {
    getAuthorizationUrl = sinon.stub();
    getOAuth2Stub = sinon.stub(SalesforceService, 'getOAuth2', function() {
      return {
        getAuthorizationUrl: getAuthorizationUrl
      };
    });
    done();
  });

  afterEach(function(done) {
    getOAuth2Stub.restore();
    done();
  });

  describe('Fake get Connection', function() {

    beforeEach(function(done) {
      getConnectionStub = sinon.stub(SalesforceService, 'getConnection');
      done();
    });

    afterEach(function(done) {
      getConnectionStub.restore();
      done();
    });

    describe('getAuthorizationUrl', function() {

      it('Should create an instance of the OAuth2 object and call the getAuthorizationUrl function.', function(done) {
        var authArgs;
        SalesforceService.getAuthorizationUrl();
        getOAuth2Stub.callCount.should.equal(1);
        getAuthorizationUrl.callCount.should.equal(1);
        authArgs = getAuthorizationUrl.getCall(0).args;
        should.exist(authArgs);
        authArgs.length.should.equal(1);
        authArgs[0].should.be.an('object');
        should.exist(authArgs[0].scope);
        authArgs[0].scope.should.equal(config.sf.scope);
        done();
      });
    });

    describe('processOAuthCode()', function() {
      var delStub, saveStub;

      beforeEach(function(done) {
        delStub = sinon.stub(RedisService, 'del').returns(bluebird.resolve());
        saveStub = sinon.stub(RedisService, 'hmset').returns(bluebird.resolve());
        done();
      });

      afterEach(function(done) {
        delStub.restore();
        saveStub.restore();
        done();
      });

      it('Should use code to get auth info and save to redis.', function(done) {
        var code = 'upup-downdown-leftright-leftright-bastart',
          fakeUserInfo = {
            id: 834765,
            organizationId: 'asb832sdf'
          },
          fakeConn = {
            accessToken: 'abcdefg12345',
            instanceUrl: 'https://justThisInstance.now/later',
            authorizeAsync: sinon.stub().returns(bluebird.resolve(fakeUserInfo))
          };
        getConnectionStub.returns(bluebird.resolve(fakeConn));


        SalesforceService.processOAuthCode(code)
          .then(function() {
            var saveArgs;

            delStub.called.should.equal(true);
            getConnectionStub.called.should.equal(true);
            saveStub.called.should.equal(true);
            saveArgs = saveStub.getCall(0).args;
            saveArgs.length.should.equal(2);
            saveArgs[0].should.equal('AuthorizationInfo');
            saveArgs[1].should.be.an('object');

            should.exist(saveArgs[1].accessToken);
            should.exist(saveArgs[1].instanceUrl);
            should.exist(saveArgs[1].userId);
            should.exist(saveArgs[1].orgId);

            done();
          });
      });


      it('Should throw reject promise with error if calls fail.', function(done) {
        var errMsg = 'Abort Abort Abort.';

        getConnectionStub.returns(bluebird.reject(errMsg));

        SalesforceService.processOAuthCode('codedoesnotmatter')
          .then(function() {
            // no error occurred
            done(false);
          })
          .catch(function(err) {
            should.exist(err);
            err.should.equal(errMsg);
            done();
          });
      });
    });

    describe('getObjectTypes()', function() {

      it('Should call the correct function on the jsForce connection.', function(done) {
        var fakeConn = {
          describeGlobalAsync: sinon.stub().returns(bluebird.resolve())
        };
        getConnectionStub.returns(bluebird.resolve(fakeConn));

        SalesforceService.getObjectTypes()
          .then(function() {
            getConnectionStub.callCount.should.equal(1);
            fakeConn.describeGlobalAsync.called.should.equal(true);
            fakeConn.describeGlobalAsync.callCount.should.equal(1);
            fakeConn.describeGlobalAsync.getCall(0).args.length.should.equal(0);
            done();
          })
          .catch(function(err) {
            done(err);
          });
      });

    });

    describe('describeObject()', function() {

      it('Should call the sobject function followed by describe.', function(done) {
        var objType = 'Account',
          fakeDescribe, fakeConn;

        fakeDescribe = {
          describe: function(callback) {
            callback();
          }
        };
        sinon.spy(fakeDescribe, 'describe');

        fakeConn = {
          sobject: function(objectType) {
            return fakeDescribe
          }
        };
        sinon.spy(fakeConn, 'sobject');
        getConnectionStub.returns(bluebird.resolve(fakeConn));

        SalesforceService.describeObject(objType)
          .then(function() {
            getConnectionStub.callCount.should.equal(1);
            fakeConn.sobject.called.should.equal(true);
            fakeConn.sobject.callCount.should.equal(1);
            fakeConn.sobject.getCall(0).args[0].should.equal(objType);
            fakeDescribe.describe.called.should.equal(true);
            fakeDescribe.describe.callCount.should.equal(1);
            done();
          })
          .catch(function(err) {
            done(err);
          });
      });

    });

  });

  describe('Test getConnection()', function() {
    describe('getConnection()', function() {
      var hgetallStub;

      beforeEach(function(done) {
        hgetallStub = sinon.stub(RedisService, 'hgetall');
        done();
      });

      afterEach(function(done) {
        hgetallStub.restore();
        done();
      });

      it('Should create an unauthorized instance of jsforce connection if no data in redis.', function(done) {
        hgetallStub.returns(bluebird.resolve(null));
        getConnectionStub.restore();

        SalesforceService.getConnection()
          .then(function(conn) {
            should.exist(conn);
            should.exist(conn.oauth2);
            getOAuth2Stub.callCount.should.equal(1);
            // verify promisify
            should.exist(conn.describeGlobal);
            conn.describeGlobal.should.be.a('function');
            should.exist(conn.describeGlobalAsync);
            conn.describeGlobalAsync.should.be.a('function');
            done();
          })
          .catch(function(err) {
            done(err);
          });
      });

      it('Should create an authorized instance of jsforce connection auth info is in redis.', function(done) {
        var authInfo = {
          instanceUrl: 'https://i.am.an.instance/url',
          accessToken: 'let-me-in-to-read-all-the-things'
        };
        hgetallStub.returns(bluebird.resolve(authInfo));

        SalesforceService.getConnection()
          .then(function(conn) {
            getOAuth2Stub.callCount.should.equal(0);
            should.exist(conn);
            should.exist(conn.oauth2);
            should.exist(conn.oauth2.clientId);
            conn.oauth2.clientId.should.equal(config.app.key);
            should.exist(conn.oauth2.clientSecret);
            conn.oauth2.clientSecret.should.equal(config.app.secret);
            should.exist(conn.oauth2.redirectUri);
            conn.oauth2.redirectUri.should.equal(config.app.callbackURL);
            conn.accessToken.should.equal(authInfo.accessToken);
            conn.instanceUrl.should.equal(authInfo.instanceUrl);

            // verify promisify
            should.exist(conn.describeGlobal);
            conn.describeGlobal.should.be.a('function');
            should.exist(conn.describeGlobalAsync);
            conn.describeGlobalAsync.should.be.a('function');
            done();
          })
          .catch(function(err) {
            done(err);
          });
      });

      it('Should throw reject promise with error if calls fail.', function(done) {
        var errMsg = 'Houston we have a problem.';
        hgetallStub.returns(bluebird.reject(errMsg));

        SalesforceService.getConnection()
          .then(function() {
            // no error occurred
            done(false);
          })
          .catch(function(err) {
            should.exist(err);
            err.should.equal(errMsg);
            done();
          });
      });
    });
  });

});
