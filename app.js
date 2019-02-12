const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql'); // Middleware ready :=)

const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

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
        return events;
      },
      createEvent: args => {
        const event = {
          _id: Math.random().toString(),
          title: args.eventInput.title,
          description: args.eventInput.description,
          date: args.eventInput.date,
          price: +args.eventInput.price
        };

        events.push(event);
        return event;
      }
    },
    graphiql: true
  })
);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on the port ${port}...`);
});
