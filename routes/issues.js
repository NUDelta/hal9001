const _ = require('lodash');
const express = require('express');
const issueController = require('../controllers/issues');
const router = express.Router();
const os = require('../controllers/orchestrationScripts');

/**
 * Issue page where mentor can create an issue.
 */
router.get('/', function (req, res, next) {
  os.getCurrentProjects()
    .then((projects) => {
      // get names of projects so that frontend can render them
      let projectList = [];
      _.forEach(projects, project => {
        projectList.push(project.name);
      });

      // render simple orchestration script page
      res.render('pages/issues', {
        conditions: os.availableConditions,
        projects: projectList,
        saved: req.query.saved === 'true'
      });
    })
});

/**
 * Create an new issue and begin orchestration processs.
 */
router.post('/create', function(req, res, next) {
  let formBody = req.body;

  // parse variables from request
  let issueName = formBody.name_field;
  let conditionMet = formBody.condition_field;
  let projectName = formBody.project_field;

  // create an issue
  issueController.createIssue(issueName, projectName, conditionMet)
    .then(() => {
      res.redirect('/issues/?saved=' + encodeURIComponent('true'));
    })
    .catch((err) => {
      console.error(`error in creating issue: ${ err }`);
    });
});

module.exports = router;