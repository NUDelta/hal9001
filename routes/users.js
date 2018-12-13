const express = require('express');
const router = express.Router();
const SlackBot = require('../imports/SlackBot');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * Send a private message to a user.
 */
router.post('/messageUser', function(req, res, next) {
  let bot = new SlackBot();
  bot.sendPrivateMessageToUser(req.body.teamName, req.body.userId, req.body.message);

  res.send('message sent')
});

router.get('/slackUsers', function (req, res, next) {
  let bot = new SlackBot();
  bot.getAllUsersForTeam('DTR');
  res.send('success')
});

module.exports = router;
