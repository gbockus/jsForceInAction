var bluebird = require('bluebird'),
  redis = bluebird.promisifyAll(require("redis"));

var redisService = (function() {
  var client = redis.createClient();

  return {
    del: function(key) {
      return client.delAsync(key);
    },
    get: function(key) {
      return client.getAsync(key);
    },
    set: function(key, value) {
      client.setAsync(key, value);
    },
    hmset: function(key, obj) {
      client.hmsetAsync(key, obj);
    },
    hgetall: function(key) {
      return client.hgetallAsync(key);
    }
  }

})();

module.exports = redisService;
