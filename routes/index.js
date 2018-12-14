const _ = require('lodash');
const express = require('express');
const router = express.Router();
const SprintLog = require('../imports/SprintLog');
const os = require('../controllers/orchestrationScripts');
const monitor = require('../controllers/monitor');
const Issues = require('../db/models/Issues');

/* GET home page. */
router.get('/', async function(req, res, next) {
  os.createOrchestrationScript('testing script', 'prevent undergrads from going over points', 'hoursspent >= 1.20 * pointsavailable', { message: 'You seem to be quite a bit over points. Before SIG, take some time to reflect about what went well this sprint and what pushed you over points.', outlet: 'student' }, 'sighead', ['Lake'])
    .then(() => {
      return os.createOrchestrationScript('testing script 2', 'prevent grad students from going way over points', 'hoursspent >= 1.50 * pointsavailable', { message: 'One of your grad students ([student]) is way over points. Maybe you should check in with them and help them slice better.', outlet: 'mentor' }, 'sighead', ['Orchestration Technologies', 'Affinder', 'Supply Management']);
    })
    // .then(() => {
    //   return monitor.updateData();
    // })
    // .then(data => {
    //   return monitor.checkIfConditionsMet(data);
    // })
    // .then(triggeredScriptObjs => {
    //   return monitor.createIssues(triggeredScriptObjs);
    // })
    // .then(createdIssues => {
    //   _.forEach(createdIssues, currIssue => {
    //     monitor.triggerOrchestrationScript(currIssue._id);
    //   });
    // })
    .catch((err) => {
      console.error(`error in creating orchestration script: ${ err }`);
    });

  res.render('pages/index', { title: 'HAL 9001' });
});


module.exports = router;
