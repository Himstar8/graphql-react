const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql'); // Middleware ready :=)

const { buildSchema } = require('graphql');

const app = express();

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

        type RootQuery {
          events: [Events!]!
        }

        type RootMutation {
          createEvent(name: String): String
        }

        schema {
          query: RootQuery
          mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return ['Romantic Cooking', 'Sailing', 'All-Night Coding'];
      },
      createEvent: args => {
        const eventName = args.name;
        return eventName;
      }
    },
    graphiql: true
  })
);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on the port ${port}...`);
});
