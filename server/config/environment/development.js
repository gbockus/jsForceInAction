'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/sfexplorer-dev'
  },

  seedDB: true,
  port: 21000,

  ssl: {
    key: "certs/server.key",
    cert: "certs/server.crt",
    secureCookies: true
  },

  sf: {
    scope: 'api id web'
  },

  app: {
    key: "",
    secret: "",
    callbackURL: "https://localhost:21000/callback"
  }

};
