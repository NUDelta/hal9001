const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const SlackBot = require('./imports/SlackBot');

const app = express();

/**
 * Setup View Engine
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));


/**
 * Setup Routes
 */
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

/**
 * Setup Bot
 */
const slackBotConfig = {
  json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/')
};

const onInstallationCallback = function onInstallationCallbackFun(bot, installer) {
  if (installer) {
    bot.startPrivateConversation({user: installer}, function (err, convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say('I am a bot that has just joined your team');
        convo.say('You must now /invite me to a channel so that I can be of use!');
      }
    });
  }
};

const SlackBotInstance = new SlackBot(slackBotConfig, process.env.CLIENT_ID, process.env.CLIENT_SECRET,
                                      process.env.SLACK_PORT, ['bot'], onInstallationCallback);

SlackBotInstance.defineNewListener('milestones', 'direct_message', function (bot, message) {
  bot.startConversation(message, function(err, convo){
    convo.say(`I am fetching your milestones for this sprint, ${ bot.config.bot.user_id }`);
    convo.ask({
      attachments: [
        {
          title: 'M1: make a prototype. Have you completed this?',
          callback_id: '123',
          attachment_type: 'default',
          actions: [
            {
              "name":"yes",
              "text": "Yes",
              "value": "yes",
              "type": "button",
            },
            {
              "name":"no",
              "text": "No",
              "value": "no",
              "type": "button",
            }
          ]
        },
        {
          title: 'M2: write NDSEG. Have you completed this?',
          callback_id: '123',
          attachment_type: 'default',
          actions: [
            {
              "name":"yes",
              "text": "Yes",
              "value": "yes",
              "type": "button",
            },
            {
              "name":"no",
              "text": "No",
              "value": "no",
              "type": "button",
            }
          ]
        }
      ]
    },[
      {
        pattern: "yes",
        callback: function(reply, convo) {
          convo.say('FABULOUS!');
          convo.next();
          // do something awesome here.
        }
      },
      {
        pattern: "no",
        callback: function(reply, convo) {
          convo.say('Too bad');
          convo.next();
        }
      },
      {
        default: true,
        callback: function(reply, convo) {
          // do nothing
        }
      }
    ]);
  });
});

SlackBotInstance.defineNewListener('get sprint', 'direct_message', function (bot, message) {
  bot.reply(message, `Getting sprint for user ${ bot.config.bot.user_id }`);
});

SlackBotInstance.defineNewListener('open the pod bay doors', 'direct_message', function (bot, message) {
  bot.reply(message, 'I\'m sorry YK, I\'m afraid I can\'t do that');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('pages/error');
});

module.exports = app;
