const User = require('../../models/user');

const eventResolver = require('./event');
const bookingResolver = require('./booking');
const authResolver = require('./auth');

const rootResolver = {
  ...authResolver,
  ...eventResolver,
  ...bookingResolver
};

module.exports = rootResolver;
