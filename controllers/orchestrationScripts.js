const OrchestrationScript = require('../db/models/OrchestrationScripts');
const Projects = require('../db/models/Projects');

const availableConditions = [
  'spending too much time on story',
  'not meeting points',
  'working on same story week to week',
  'working on a study design',
  'working on a urg',
  'havent met with student in a while'
];

const availableFeedback = [
  'direct student to resource',
  'prompt student schedule meeting with SIG head',
  'prompt student to reflect on issue',
  'remind mentor to discuss issue at SIG meeting'
];

const availableEscalationProtocols = [
  'prompt student to schedule meeting with faculty'
];

const createOrchestrationScript = function createNewOrchestrationScript(name, goal, condition, feedback, escalation, projects) {
  let newOS = new OrchestrationScript({
    name: name,
    goal: goal,
    condition: condition,
    actionable_feedback: feedback,
    escalation_strategy: escalation,
    target_projects: projects
  });

  return newOS.save();
};

const getCurrentProjects = function getListOfCurrentProjects() {
  return Projects.find({});
};

module.exports = {
  availableConditions: availableConditions,
  availableFeedback: availableFeedback,
  availableEscalationProtocols: availableEscalationProtocols,
  createOrchestrationScript: createOrchestrationScript,
  getCurrentProjects: getCurrentProjects
};