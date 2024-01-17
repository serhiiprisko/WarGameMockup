const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let user = new Schema(
  {
    user: { type: String },
    score: { type: Number }
  },
  { collection: "users" }
);

module.exports = mongoose.model("users", user);