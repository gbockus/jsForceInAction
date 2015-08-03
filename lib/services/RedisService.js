var redis = require('redis');

var redisService = (function() {
  var client = redis.createClient();

  return {
    del: function(key) {
      return client.del(key);
    },
    get: function(key) {
      return client.get(key);
    },
    set: function(key, value) {
      client.set(key, value);
    },
    hmset: function(key, obj) {
      client.hmset(key, obj);
    }
  }

})();

module.exports = redisService;
