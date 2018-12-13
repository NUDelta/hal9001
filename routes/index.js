const _ = require('lodash');
const express = require('express');
const router = express.Router();
const SprintLog = require('../imports/SprintLog');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let sprintLogInstance = new SprintLog('1R2oDC1cTVEILiPNL5kXpiUy9qjxVeR-KnhTFplsmQLc');
  sprintLogInstance.authorizeWithGoogle()
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
    })
    .then(rows => {
      _.forEach(rows, row => {
        console.log(`Person: ${ row.team } | Points Available: ${ row.pointsavailable } | Points Committed: ${ row.pointscommitted } | Hours Spent: ${ row.hoursspent }`);
      })
    })
    .catch((err) => {
      console.log(`error in auth and getting data: ${ err }`);
    });

  res.render('pages/index', { title: 'HAL 9001' });
});


module.exports = router;
