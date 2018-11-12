const _ = require('lodash');

const SlackBot = require('../imports/SlackBot');
const Issues = require('../db/models/Issues');
const People = require('../db/models/People');
const SIG = require('../db/models/SIGs');
const Projects = require('../db/models/Projects');
const resources = require('./resources');

const checkIfConditionsMet = function checkIfAnyConditionsMetFromNewIssue() {

};

const triggerOrchestrationScript = function triggerOrchestrationScript(issueId) {
  // fetch issue with orchestration data
  let currentIssue = Issues.findOne({'_id': issueId})
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
      feedbackMessage = `Hey! Looks like you're working on your URG. Take a look at the process guide before you start: ${resources['urg']}`;
    } else if (osName.toLowerCase().includes('study design')) {
      // get students to send chat to
      feedbackMessage = `Hey! Looks like you're working on a study design. Take a look at the study design learning module before you start: ${resources['study design']}`;
    }
  } else if (feedback === 'prompt student schedule meeting with SIG head') {
    feedbackMessage = `Hey! Based on your current issue (${ issueName }), it might good to reach our and schedule a meeting with your SIG head.`;
  } else if (feedback === 'prompt student to reflect on issue') {
    feedbackMessage = `Hey! Based on your current issue (${ issueName }), it might good to reach our and schedule a meeting with your SIG head.`;
  } else if (feedback === 'remind mentor to discuss issue at SIG meeting') {
    target = 'mentor';
    feedbackMessage = `Hey! Remember to discuss ${ projectName }'s issue during SIG.`;
  }

  // send message
  if (target === 'student') {
    People.find({ _id: students })
      .then((studentObjs) => {
        _.forEach(studentObjs, studentObj => {
          bot.sendPrivateMessageToUser(studentObj.slack_team_name,
            studentObj.slack_id, feedbackMessage);
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
  triggerOrchestrationScript: triggerOrchestrationScript
};
