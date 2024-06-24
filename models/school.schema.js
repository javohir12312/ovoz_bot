const { Schema, model } = require("mongoose");

const schoolSchema = new Schema({
  school_name: {
    type: String,
    unique: true,
  },
});

const School = model("School", schoolSchema);

module.exports = { School };
