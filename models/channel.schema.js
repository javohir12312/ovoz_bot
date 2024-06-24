const { Schema, model } = require("mongoose");

const channelSchema = new Schema({
  channel_url: {
    type: String,
    unique: true,
    
  },
});

const Channel = model("Channel", channelSchema);

module.exports = { Channel };
