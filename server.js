var express = require('express');
var routes = require('./routes.js');

if (process.argv.length < 3) {
  console.log("Invalid usage: node server.js <PORT>");
  process.exit();
}

var port = parseInt(process.argv[2]);

if (isNaN(port)) {
  console.log("Port must be numeric.");
  process.exit();
}

var app = express();
routes.setupRoutes(app);
app.listen(port);

console.log("Ticcat now listening on " + port);