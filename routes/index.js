const _ = require('lodash');
const express = require('express');
const router = express.Router();
const SprintLog = require('../imports/SprintLog');
const monitor = require('../controllers/monitor');

/* GET home page. */
router.get('/', async function(req, res, next) {
  // try monitor
  monitor.updateData()
    .then(data => {
      console.log(data);
    });

  res.render('pages/index', { title: 'HAL 9001' });
});


module.exports = router;
