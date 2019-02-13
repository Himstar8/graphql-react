const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const graphqlHttp = require('express-graphql'); // Middleware ready :=)
const { buildSchema } = require('graphql');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  // console.log(process.env.MONGO_URI);
}

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
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
    console.log('Something goes wrong...\n', err);
  });
