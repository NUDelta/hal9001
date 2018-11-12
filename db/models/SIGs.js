const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SIGSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  meeting_time: {
    type: [{
      day: String,
      start_time: String,
      end_time: String
    }],
    required: true
  }
});

module.exports = mongoose.model('SIG', SIGSchema);