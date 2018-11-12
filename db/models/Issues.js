const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let IssueSchema = new Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
});

module.exports = mongoose.model('Issue', IssueSchema);