const _ = require('lodash');
const express = require('express');
const router = express.Router();
const os = require('../controllers/orchestrationScripts');

router.get('/', function (req, res, next) {
  os.getCurrentProjects()
    .then((projects) => {
      // get names of projects so that frontend can render them
      let projectList = [];
      _.forEach(projects, project => {
        projectList.push(project.name);
      });

      // render simple orchestration script page
      res.render('pages/orchestration_scripts', {
        conditions: os.availableConditions,
        feedback: os.availableFeedback,
        escalation: os.availableEscalationProtocols,
        projects: projectList,
        saved: req.query.saved === 'true'
      });
    })
});

router.post('/os/create', function (req, res, next) {
  let formBody = req.body;

  // isolate projects
  let projects = [];
  _.forEach(_.filter(Object.keys(formBody), obj => obj.includes('project')), projectKey => {
    projects.push(formBody[projectKey]);
  });

  // save to database

  os.createOrchestrationScript(formBody.name_field, formBody.goal_field, formBody.condition_field,
    formBody.feedback_field, formBody.escalation_field, projects)
    .then(() => {
      res.redirect('/os/?saved=' + encodeURIComponent('true'));
    })
    .catch((err) => {
      console.error(`error in creating orchestration script: ${ err }`);
    });
});


module.exports = router;
