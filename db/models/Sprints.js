const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SprintSchema = new Schema({
  project_name: String,
  sprint_number: Number,
  stories: [{ type: String }],
  tasks: [{
    storyIndex: Number,
    roadBlocks: String,
    pointsRequired: Number,
    taskCategory: String,
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    status: String,
    hoursSpent: Number
  }],
  sprint_start: Date,
  sprint_end: Date,
  sprint_sheet: String
});

module.exports = mongoose.model('Sprint', SprintSchema);