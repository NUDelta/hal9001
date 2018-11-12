const _ = require('lodash');

const Person = require('./models/People');
const SIG = require('./models/SIGs');
const Sprint = require('./models/Sprints');
const Project = require('./models/Projects');
const Issue = require('./models/Issues');

const peopleFixtures = require('./fixtures/people');
const sigFixtures = require('./fixtures/sigs');
const sprintFixtures = require('./fixtures/sprints');
const projectFixtures = require('./fixtures/projects');

const initDb = function initializeDbFromFixtures() {
  let shouldRefreshDB = process.env.REFRESH_DB === 'true';
  if (shouldRefreshDB) {
    clearCollections()
      .then(() => {
        // add people to DB
        let peopleToAdd = [];
        _.forEach(peopleFixtures, currFixture => {
          let newPerson = new Person({
            first_name: currFixture.first_name,
            last_name: currFixture.last_name,
            full_name: `${ currFixture.first_name } ${ currFixture.last_name }`,
            slack_id: currFixture.slack_id,
            slack_name: currFixture.slack_name,
            slack_team_name: currFixture.slack_team_name,
            slack_team_id: currFixture.slack_team_id,
            role: currFixture.role,
            office_hours: currFixture.office_hours
          });

          peopleToAdd.push(newPerson.save());
        });

        return Promise.all(peopleToAdd);
      })
      .then(() => {
        // add SIGs to DB
        let sigsToAdd = [];
        _.forEach(sigFixtures, currFixture => {
          let newSig = new SIG({
            name: currFixture.name,
            description: currFixture.description,
            meeting_time: currFixture.meeting_time
          });

          sigsToAdd.push(newSig.save());
        });

        return Promise.all(sigsToAdd);
      })
      .then(() => {
        // add sprints to DB
        let sprintsToAdd = [];
        _.forEach(sprintFixtures, currFixture => {
          let newSprint = new Sprint({
            project_name: currFixture.project_name,
            sprint_number: currFixture.sprint_number,
            stories: currFixture.stories,
            tasks: currFixture.tasks,
            sprint_start: currFixture.sprint_start,
            sprint_end: currFixture.sprint_end,
            sprint_sheet: currFixture.sprint_sheet
          });

          sprintsToAdd.push(newSprint.save());
        });

        return Promise.all(sprintsToAdd);
      })
      .then(() => {
        // add projects to DB
        _.forEach(projectFixtures, currFixture => {
          // get objectIds from students, sig, and sprints
          Promise.all([
            Person.find({ full_name: { $in: currFixture.students }}),
            SIG.find(currFixture.sig),
            Sprint.find(currFixture.sprints),
          ])
            .then((output) => {
              let [students, sig, sprints] = output;

              // get student ids
              let studentIds = [];
              _.forEach(students, currStudent => {
                studentIds.push(currStudent._id);
              });

              // get sig id
              let sigId = sig[0]._id;

              // get sprint ids
              let sprintIds = [];
              _.forEach(sprints, currSprint => {
                sprintIds.push(currSprint._id);
              });

              // create each new project
              let newProject = new Project({
                name: currFixture.name,
                description: currFixture.description,
                students: studentIds,
                sig: sigId,
                sprints: sprintIds
              });

              newProject.save();
            })
        })
      })
      .catch(err => {
        console.error(`error in populating DB: ${err}`)
      })
  }
};

const clearCollections = function clearMongoCollections() {
  return Promise.all([
    Person.find({}).remove(),
    SIG.find({}).remove(),
    Sprint.find({}).remove(),
    Project.find({}).remove(),
    Issue.find({}).remove()
  ]);
};

module.exports = initDb;