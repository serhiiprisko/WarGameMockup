
var mongoose = require("mongoose");
var logger = require('node-color-log');

var MongoUri = "mongodb://localhost:27017/TurnGame";

exports.init = function() {
  mongoose.connect(MongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      logger.info("MongoDB database connection established successfully");
    })
    .catch(err => {
      logger.error("MongoDB database connection established unsuccessfully", err);
      process.exit(0);
    })
}