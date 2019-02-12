const express = require('express');
const bodyParser = require('body-parser');

const graphqlHttp = require('express-graphql'); // Middleware ready :=)
const { buildSchema } = require('graphql');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Event = require('./models/event');

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
        // const event = {
        //   _id: Math.random().toString(),
        //   title: args.eventInput.title,
        //   description: args.eventInput.description,
        //   date: args.eventInput.date,
        //   price: +args.eventInput.price
        // };

        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          date: new Date(args.eventInput.date),
          price: +args.eventInput.price
        });

        return event
          .save()
          .then(res => {
            return { ...res._doc };
          })
          .catch(err => {
            console.log(err);
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
