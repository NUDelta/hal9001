const Issues = require('../db/models/Issues');
const OS = require('../db/models/OrchestrationScripts');
const Projects = require('../db/models/Projects');

const monitor = require('./monitor');

const createIssue = function createNewIssue(issueName, projectName, conditionMet) {
  // get relevant project and orchestration script triggered
  return Promise.all([
    OS.findOne({ target_projects: projectName, condition: conditionMet }),
    Projects.findOne({ name: projectName})
  ])
    .then((output) => {
      // parse out triggered orchestration scripts and project
      let [triggeredOS, project] = output;

      // create new issue
      let newIssue = new Issues({
        name: issueName,
        os_triggered: triggeredOS._id,
        project: project._id
      });

      return newIssue.save();
    })
    .then((object) => {
      monitor.triggerOrchestrationScript(object._id);
    })
    .catch((err) => {
      console.error(`error in creating issue: ${ err }`);
    })
};

module.exports = {
  createIssue: createIssue
};