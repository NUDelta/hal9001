const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let IssueSchema = new Schema({
  name: { type: String, required: true },
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  os_triggered: { type: mongoose.Schema.Types.ObjectId, ref: 'OrchestrationScript' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  addressed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now() },
  updated: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Issue', IssueSchema);