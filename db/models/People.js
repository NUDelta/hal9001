const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PersonSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  full_name: { type: String, required: true },
  slack_id: String,
  slack_name: String,
  slack_team_name: String,
  slack_team_id: String,
  role: { type: String, required: true },
  office_hours: {
    type: [{
      day: String,
      start_time: String,
      end_time: String
    }],
    required: this.role === 'faculty' || this.role === 'phd student'
  }
});

module.exports = mongoose.model('Person', PersonSchema);