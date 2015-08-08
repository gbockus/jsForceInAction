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
    key: "3MVG9xOCXq4ID1uEESOs_ggfxX6afmyzvfZEaAoesVAqa8Af7JAecM4oyHq5rqOK1BFwZ08RBaYEYLiSKbCWS",
    secret: "4620345335555489965",
    callbackURL: "https://localhost:21000/callback"
  }
};
