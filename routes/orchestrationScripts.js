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
        outlets: ['student', 'mentor'],
        escalation: os.availableEscalationProtocols,
        projects: projectList,
        saved: req.query.saved === 'true'
      });
    })
});

router.post('/create', function (req, res, next) {
  let formBody = req.body;

  // isolate projects
  let projects = [];
  _.forEach(_.filter(Object.keys(formBody), obj => obj.includes('project')), projectKey => {
    projects.push(formBody[projectKey]);
  });

  // save to database
  let name = formBody.name_field;
  let goal = formBody.goal_field;
  let condition = formBody.condition_field;
  let feedback = {
    message: formBody.feedback_field,
    outlet: formBody.outlet_field
  };
  let escalation = formBody.escalation_field;

  os.createOrchestrationScript(name, goal, condition, feedback, escalation, projects)
    .then(() => {
      res.redirect('/os/?saved=' + encodeURIComponent('true'));
    })
    .catch((err) => {
      console.error(`error in creating orchestration script: ${ err }`);
    });
});


module.exports = router;
