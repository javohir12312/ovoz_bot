const { Schema, model } = require("mongoose");

const useraSchema = new Schema({
  school_ref_id: {
    type: Schema.Types.ObjectId,
    ref: "School",
  },
  user_name: {
    type: String,
  },
  telegram_id: {
    type: String,
  },
  phone_number: {
    type: String,
  },
});

const User = model("User", useraSchema);

module.exports = { User };
