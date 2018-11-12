const BotKit = require('botkit');

let slackBotInstance = null;

/**
 * SlackBot class wrapper around BotKit for easy extensibility.
 */
class SlackBot {
  constructor(config, clientId, clientSecret, port, scopes=['bot'], onInstallationCallback) {
    // check if already initialized
    if(!slackBotInstance) {
      slackBotInstance = this;

      // setup controller for bot
      this.controller = BotKit.slackbot(config).configureSlackApp(
        {
          clientId: clientId,
          clientSecret: clientSecret,
          scopes: scopes
        }
      );

      // setup webhooks
      this._setupWebServer(port);

      // track bots
      this._bots = {};

      // create bots if not created, and connect to all of them
      this._createBot(this._bots, onInstallationCallback);
      this._connectAllBots(this._bots);
    }

    // return singleton instance
    return slackBotInstance;
  }

  _setupWebServer(port) {
    this.controller.setupWebserver(port, (err, webserver) => {
      this.controller.createWebhookEndpoints(this.controller.webserver);

      this.controller.createOauthEndpoints(this.controller.webserver, (err, req, res) => {
        if (err) {
          res.status(500).send('ERROR: ' + err);
        } else {
          res.send('Success!');
        }
      });
    })
  }

  _createBot(botTracker, onInstallationCallback) {
    this.controller.on('create_bot', (bot, config) => {
      if (this._bots[bot.config.token]) {
        // bot is already online
      } else {
        bot.startRTM((err) => {
          if (err) {
            console.error(err);
          }

          // track initialized bots
          botTracker[bot.config.token] = bot;

          // check if an onInstallation callback was provided
          if (onInstallationCallback) {
            onInstallationCallback(bot, config.createdBy);
          }
        });
      }
    });
  }

  _connectAllBots(botTracker) {
    this.controller.storage.teams.all((err, teams) => {
      if (err) {
        console.error(err);
      }

      // connect all teams with this bot to slack
      for (let t in teams) {
        if (teams[t].bot) {
          let bot = this.controller.spawn(teams[t]).startRTM(function (err) {
            if (err) {
              console.log('Error connecting bot to Slack:', err);
            } else {
              // track initialized bots
              botTracker[bot.config.token] = bot;
            }
          });
        }
      }
    });
  }

  defineNewTrigger(trigger, actionCallback) {
    this.controller.on(trigger, actionCallback);
  }

  defineNewListener(targetText, listeningMethods, actionCallback) {
    this.controller.hears(targetText, listeningMethods, actionCallback);
  }

  sendPrivateMessageToUser(teamName, userId, message) {
    // get bot to use to send message
    this.controller.storage.teams.all((err, all_team_data) => {
      console.log(all_team_data)
      let teamBotToken = '';
      for (let team of all_team_data) {
        if (team.name.toLowerCase().trim() === teamName.toLowerCase().trim()) {
          teamBotToken = team.bot.token;
          break;
        }
      }

      let targetBot = this._bots[teamBotToken];

      // send message using bot to user
      targetBot.api.im.open({
        user: userId
      }, (err, apiRes) => {
        if (!err) {
          targetBot.startConversation({
            user: userId,
            channel: apiRes.channel.id,
            text: ''
          }, (err, convo) => {
            convo.say(message);
          });
        }
      });
    });
  }

  getAllUsersForTeam(teamName) {
    this.controller.storage.users.all((err, all_users) => {
      console.log(all_users)
    })
  }
}

module.exports = SlackBot;