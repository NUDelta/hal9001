const express = require('express');
const issueController = require('../controllers/issues');
const router = express.Router();

/**
 * Create an new issue and begin orchestration processs.
 */
router.post('/create', function(req, res, next) {
  // parse variables from request
  let issueName = req.body.issueName;
  let projectName = req.body.projectName;
  let conditionMet = req.body.conditionMet;

  // create an issue
  issueController.createIssue(issueName, projectName, conditionMet);

  res.send('issue created.');
});

module.exports = router;