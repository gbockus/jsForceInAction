var fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  config = require('config'),
  compression     = require('compression'),
  express = require('express'),
  https = require('https'),
  serveStatic     = require('serve-static');

/**
 * A simple script to serve the client-side app from the dist directory.
 */
(function() {
  'use strict';

  var app = express(),
    sslOpts = {
      key: fs.readFileSync(config.get('ssl.key')),
      cert: fs.readFileSync(config.get('ssl.cert'))
    };

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(compression());
  // Serve up the sfExplorer webapp as a static resource.
  app.use(serveStatic(path.join(__dirname, 'dist')));

  //app.use(passport.initialize());
  //app.use(passport.session());

  require('lib/routes/AuthRoutes').initialize(app);

  https.createServer(sslOpts, app).listen(config.get('ports.sfExplorer'));
  console.log('sfExplorer listening on port [%d]', config.ports.sfExplorer);

})();