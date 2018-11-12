const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrchestrationScriptSchema = new Schema({
  goal: String,
  condition: String,
  target_projects: [String],
  actionable_feedback: String,
  escalation_strategy: String
});

module.exports = mongoose.model('OrchestrationScript', OrchestrationScriptSchema);