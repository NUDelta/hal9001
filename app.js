/**
 * Application Imports
 */
const path = require('path');
const express = require('express');
const sassMiddleware = require('node-sass-middleware');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const logger = require('morgan');
const createError = require('http-errors');

const mongoose = require('mongoose');
const initDb  = require('./db/init');


/**
 * Route imports
 */
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const issuesRouter = require('./routes/issues');
const orchestrationScriptsRouter = require('./routes/orchestrationScripts');

/**
 * Custom imports
 */
const SlackBot = require('./imports/SlackBot');

/**
 * Initialize DB
 */
let db;
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hal9001';
const poolSize = process.env.POOL_SIZE || 25;

mongoose.Promise = global.Promise;
mongoose.connect(mongoURI, { poolSize: poolSize, useNewUrlParser: true })
  .then(() => {
    // initialize DB from fixtures
    initDb();
  })
  .catch((err) => {
    console.error(`Error in connecting to DB: ${err}`);
  });

db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/**
 * Setup View Engine
 */
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
app.use('/issues', issuesRouter);
app.use('/os', orchestrationScriptsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

/**
 * Setup Bot
 */
const botkitMongoStorage = require('botkit-storage-mongo')({ mongoUri: mongoURI });
const slackBotConfig = {
  storage: botkitMongoStorage,
  debug: true
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

SlackBotInstance.defineNewListener('milestones', 'direct_message,direct_mention,mention', function (bot, message) {
  console.log(message);
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
