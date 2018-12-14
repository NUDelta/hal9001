const _ = require('lodash');

const SlackBot = require('../imports/SlackBot');
const SprintLog = require('../imports/SprintLog');

const Issues = require('../db/models/Issues');
const People = require('../db/models/People');
const SIG = require('../db/models/SIGs');
const Sprints = require('../db/models/Sprints');
const Projects = require('../db/models/Projects');
const OS = require('../db/models/OrchestrationScripts');

const resources = require('./resources');

const updateData = function updateDataFromStudio() {
  // get all sprint logs for most recent sprint (hardcoded to 5 currently and only for Lake and Orchestration)
  return Sprints.find({'sprint_number': 4, 'project_name': {$in: ['Orchestration Technologies', 'Lake']}})
    .then(sprintData => {
      // make a list of promises that get new sprint data
      let sprintPromiseArray = [];

      _.forEach(sprintData, currProjSprint => {
        // get indices to slice out sheet ID from url
        let currSprintSheetUrl = currProjSprint.sprint_sheet;
        let startIndex = currSprintSheetUrl.indexOf('d/') + 2;
        let endIndex = currSprintSheetUrl.indexOf('/edit');
        let currSprintId = currSprintSheetUrl.slice(startIndex, endIndex);

        // create new sprint object
        let sprintLogInstance = new SprintLog(currSprintId);

        // slice out sheet ID and add to sprint sheets
        sprintPromiseArray.push(sprintLogInstance.authorizeWithGoogle()
          .then((successfulAuth) => {
            return sprintLogInstance.getInfoAndWorksheets();
          })
          .then((spreadSheetInfo) => {
            // find sheet for sprint 5
            let targetSheet;
            _.forEach(spreadSheetInfo.worksheets, currSheet => {
              if (currSheet.title.includes('Sprint 5')) {
                targetSheet = currSheet;
                return false;
              }
            });

            // get points committed and hours spent
            if (targetSheet !== undefined) {
              return sprintLogInstance.getRowsForSheet(targetSheet.id, {});
            }
          }));
      });

      // get updated data for each sprint and also get projects
      return Promise.all([
        Promise.all(sprintPromiseArray),
        Projects.find()
          .populate('students')
          .populate('sprints')
          .populate('SIG')
      ]);
    })
    .then(data => {
      // separate out list of sprints and list of projects
      let [sprints, projects] = data;

      // parse data from each sheet
      let parsedSprintData = [];
      _.forEach(sprints, currSheet => {
        _.forEach(currSheet, currRow => {
          parsedSprintData.push({
            person: currRow.team,
            data: {
              pointsavailable: parseFloat(currRow.pointsavailable),
              pointscommitted: parseFloat(currRow.pointscommitted),
              hoursspent: parseFloat(currRow.hoursspent)
            }
          });
        });
      });

      // add project to parsed data
      _.forEach(parsedSprintData, (dataInstance, index) => {
        let targetFirstName = dataInstance.person;

        // search for person in projects
        _.forEach(projects, currProject => {
          let currProjectName = currProject.name;
          let projectFound = false;

          _.forEach(currProject.students, currProjectStudent => {
            if (currProjectStudent.first_name === targetFirstName) {
              parsedSprintData[index].project = currProjectName;
              projectFound = true;
              return false;
            }
          });

          if (projectFound) {
            return false;
          }
        })
      });

      // fetch project and add that data
      return parsedSprintData;
    })
    .catch(err => {
      console.error(`Error with finding sprints: ${ err }`);
    });
};


const checkIfConditionsMet = function checkIfOrchestrationConditionIsMet(studioData) {
  console.log(studioData);

  // get conditions for all orchestration scripts and see if any have been triggered
  return OS.find()
    .then((scripts) => {
      let triggeredScripts = [];

      // loop over each orchestration script and see which projects have triggered them
      _.forEach(scripts, currScript => {
        let currCondition = currScript.condition;
        let targetProjects = currScript.target_projects;

        // loop over studio data to find any that triggers the current orchestration script
        _.forEach(studioData, dataObject => {
          // check if current script applies to data object
          if (dataObject.project !== undefined && targetProjects.includes(dataObject.project)) {
            // check if script was triggered
            let dataPieces = dataObject.data;

            // replace each condition variable with variable value
            let modifiedCondition = currCondition;
            _.forEach(dataPieces, (dataValue, dataVarName) => {
              modifiedCondition = modifiedCondition.replace(dataVarName, dataValue);
            });

            // evaluate condition
            let evaluatedCondition = eval(modifiedCondition);
            if (evaluatedCondition) {
              triggeredScripts.push({
                person: dataObject.person,
                project: dataObject.project,
                triggeredScript: currScript
              });
            }
          }
        });
      });

      return triggeredScripts;
    })
    .catch((err) => {
      console.error(`Error with checking orchestration script conditions: ${ err }`);
    })
};



const triggerOrchestrationScript = function triggerOrchestrationScript(issueId) {
  // fetch issue with orchestration data
  Issues.findOne({'_id': issueId})
    .populate('os_triggered')
    .populate('project')
    .exec()
    .then((object) => {
      presentActionableFeedback(object.project.students, object.project.sig,
        object.os_triggered.name, object.name, object.project.name, object.os_triggered.actionable_feedback);
    });
};

const presentActionableFeedback = function presentActionableFeedbackBasedOnScript(students, sig, osName, issueName, projectName, feedback) {
  let bot = new SlackBot();
  let target = 'student';
  let feedbackMessage = '';

  if (feedback === 'direct student to resource') {
    if (osName.toLowerCase().includes('urg')) {
      feedbackMessage = `Hey [person]! Looks like you're working on your URG. Take a look at the process guide before you start: ${resources['urg']}`;
    } else if (osName.toLowerCase().includes('study design')) {
      feedbackMessage = `Hey [person]! Looks like you're working on a study design. Take a look at the study design learning module before you start: ${resources['study design']}`;
    }
  } else if (feedback === 'prompt student schedule meeting with SIG head') {
    feedbackMessage = `Hey [person]! Based on your current issue (${ issueName }), it might good to reach our and schedule a meeting with your SIG head.`;
  } else if (feedback === 'prompt student to reflect on issue') {
    feedbackMessage = `Hey [person]! Have you made progress on your issue (${ issueName })? Do you have any blockers to completing it?`;
  } else if (feedback === 'remind mentor to discuss issue at SIG meeting') {
    target = 'mentor';
    feedbackMessage = `Hey [person]! Remember to discuss ${ projectName }'s issue during SIG.`;
  }

  // TODO: generalize to outlet
  // send message
  if (target === 'student') {
    People.find({ _id: students })
      .then((studentObjs) => {
        console.log(studentObjs);
        _.forEach(studentObjs, studentObj => {
          let feedbackMessageWithNames = feedbackMessage.replace('[person]', studentObj.first_name);
          bot.sendPrivateMessageToUser(studentObj.slack_team_name,
            studentObj.slack_id, feedbackMessageWithNames);
        });
      })
      .catch((err) => {
        console.error(`error in sending feedback to students: ${ err }`);
      })
  } else {
    // get sig head and send them a message
    SIG.findOne({_id: sig })
      .then(obj => {
        if (obj) {
          return People.findOne({ full_name: obj.sig_head });
        }
      })
      .then(obj => {
        if (obj) {
          feedbackMessage = feedbackMessage.replace('[person]', obj.first_name);
          bot.sendPrivateMessageToUser(obj.slack_team_name,
            obj.slack_id, feedbackMessage);
        }
      })
  }
};

const runEscalationStrategy = function runEscalationStrategyBasedOnScript(escalation) {
  if (escalation === 'prompt student to schedule meeting with faculty') {

  }
};

module.exports = {
  triggerOrchestrationScript: triggerOrchestrationScript,
  updateData: updateData,
  checkIfConditionsMet: checkIfConditionsMet
};
