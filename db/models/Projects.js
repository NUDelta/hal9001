const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  sig: { type: mongoose.Schema.Types.ObjectId, ref: 'SIG' },
  sprints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' }]
});

module.exports = mongoose.model('Projects', ProjectSchema);