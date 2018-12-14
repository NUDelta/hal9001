const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrchestrationScriptSchema = new Schema({
  name: String,
  goal: String,
  condition: String,
  target_projects: [String],
  actionable_feedback: {
    type: {
      message: String,
      outlet: String
    }
  },
  escalation_strategy: String,
  created_at: { type: Date, default: Date.now() },
  updated: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('OrchestrationScript', OrchestrationScriptSchema);