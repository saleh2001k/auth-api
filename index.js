'use strict';

require('dotenv').config();
const app = require('./src/server.js');
const { db } = require('./src/models/index.js');

db.sync({ force: true }).then(() => {
  app.start(process.env.PORT || 3001);
});
