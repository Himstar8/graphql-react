const { dateToString } = require('../../helpers/date');

const { transformEvent } = require('./merge');

const Event = require('../../models/event');
const User = require('../../models/user');

module.exports = {
  /**** Resolvers ******/
  events: async () => {
    try {
      const events = await Event.find();

      return events.map(event => transformEvent(event));
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        date: dateToString(args.eventInput.date),
        price: +args.eventInput.price,
        creator: req.userId
      });

      const result = await event.save();

      const createdEvent = transformEvent(result);
      // Grab the user who create the event
      const user = await User.findById('5c63dcd3faaa202a94fde90d');

      if (!user) {
        throw new Error("User doesn't exist");
      }
      user.createdEvents.push(event); // We can either pass the hole event or just the event ID
      await user.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  }
};
