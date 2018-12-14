const _ = require('lodash');
const express = require('express');
const router = express.Router();
const SprintLog = require('../imports/SprintLog');
const os = require('../controllers/orchestrationScripts');
const monitor = require('../controllers/monitor');

/* GET home page. */
router.get('/', async function(req, res, next) {
  os.createOrchestrationScript('testing script', 'prevent undergrads from going over points', 'hoursspent >= 1.20 * pointsavailable', 'cat', 'sighead', ['Lake'])
    .then(() => {
      return os.createOrchestrationScript('testing script 2', 'prevent grad students from going way over points', 'hoursspent >= 1.50 * pointsavailable', 'cat', 'sighead', ['Orchestration Technologies', 'Affinder', 'Supply Management']);
    })
    .then(() => {
      return monitor.updateData();
    })
    .then(data => {
      return monitor.checkIfConditionsMet(data);
    })
    .then(triggeredScripts => {
      console.log(triggeredScripts);
    })
    .catch((err) => {
      console.error(`error in creating orchestration script: ${ err }`);
    });

  res.render('pages/index', { title: 'HAL 9001' });
});


module.exports = router;
