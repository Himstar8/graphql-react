const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const graphqlHttp = require('express-graphql'); // Middleware ready :=)
const { buildSchema } = require('graphql');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Event = require('./models/event');
const User = require('./models/User');

const app = express();
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  // console.log(process.env.MONGO_URI);
}

const events = [];

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float! 
          date: String!
        }

        type User {
          _id: ID!
          email: String!
          password: String
        }

        input UserInput {
          email: String!
          password: String
        }

        input EventInput {
          title: String! 
          description: String!
          price: Float!
          date: String!
        }

        type RootQuery {
          events: [Event!]!
        }

        type RootMutation {
          createEvent(eventInput: EventInput): Event
          createUser(userInput: UserInput): User
        }

        schema {
          query: RootQuery
          mutation: RootMutation
        }
    `),
    rootValue: {
      /**** Resolvers */
      events: () => {
        return Event.find({})
          .then(events => {
            return (events = events.map(item => {
              return {
                ...item._doc,
                _id: item._doc._id.toString()
              };
            }));
          })
          .catch(err => {
            throw err;
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          date: new Date(args.eventInput.date),
          price: +args.eventInput.price,
          creator: '5c63dcd3faaa202a94fde90d'
        });

        let createdEvent;

        return event
          .save()
          .then(res => {
            createdEvent = { ...res._doc };
            // Grab the user who create the event
            return User.findById('5c63dcd3faaa202a94fde90d');
          })
          .then(user => {
            if (!user) {
              throw new Error("User doesn't exist");
            }
            user.createdEvents.push(event); // We can either pass the hole event or just the event ID
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error('User already exist');
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then(psw => {
            const user = new User({
              email: args.userInput.email,
              password: psw
            });
            return user.save();
          })
          .then(user => {
            return { ...user._doc, password: null };
          })
          .catch(err => {
            // console.log(err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('Connection established...');

    // If Connected to the database then start the server :D
    app.listen(port, () => {
      console.log(`Server running on the port ${port}...`);
    });
  })
  .catch(err => {
    console.log('Somethiing goes wrong...\n', err);
  });
