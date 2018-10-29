const BotKit = require('botkit');

/**
 * SlackBot class wrapper around BotKit for easy extensibility.
 */
class SlackBot {
  constructor(config, clientId, clientSecret, port, scopes=['bot'], onInstallationCallback) {
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
}

module.exports = SlackBot;