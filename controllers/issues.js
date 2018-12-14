const _ = require('lodash');

const Issues = require('../db/models/Issues');
const OS = require('../db/models/OrchestrationScripts');
const Projects = require('../db/models/Projects');

const monitor = require('./monitor');

const createIssue = function createNewIssue(issueName, targetStudent, projectName, conditionMet) {
  // get relevant project and orchestration script triggered
  return Promise.all([
    OS.findOne({ target_projects: projectName, condition: conditionMet }),
    Projects.findOne({ name: projectName}).populate('students')
  ])
    .then((output) => {
      // parse out triggered orchestration scripts and project
      let [triggeredOS, project] = output;

      // find student object that matches target student
      let targetStudentId = '';
      _.forEach(project.students, student => {
        if (student.first_name === targetStudent) {
          targetStudentId = student._id;
          return false;
        }
      });


      // create new issue
      let newIssue = new Issues({
        name: issueName,
        target: targetStudentId,
        os_triggered: triggeredOS._id,
        project: project._id
      });

      return newIssue.save();
    })
    .catch((err) => {
      console.error(`error in creating issue: ${ err }`);
    })
};

module.exports = {
  createIssue: createIssue
};