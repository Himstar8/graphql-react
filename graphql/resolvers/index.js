const Event = require('../../models/event');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

const userFn = async userId => {
  try {
    const user = await User.findById(userId);

    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });

    return events.map(item => {
      return {
        ...item._doc,
        creator: userFn.bind(this, item._doc.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  /**** Resolvers */
  events: async () => {
    try {
      const events = await Event.find();

      return (events = events.map(item => {
        return {
          ...item._doc,
          _id: item._doc._id.toString(),
          date: new Date(item._doc.date).toISOString(),
          creator: userFn.bind(this, item._doc.creator)
        };
      }));
    } catch (err) {
      throw err;
    }
  },
  createEvent: async args => {
    try {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        date: new Date(args.eventInput.date),
        price: +args.eventInput.price,
        creator: '5c63dcd3faaa202a94fde90d'
      });

      const result = await event.save();

      const createdEvent = {
        ...result._doc,
        date: new Date(result._doc.date).toISOString(),
        creator: userFn.bind(this, result._doc.creator)
      };
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
  },
  createUser: async args => {
    try {
      const user = await User.findOne({ email: args.userInput.email });

      if (user) {
        throw new Error('User already exist');
      }

      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const newUser = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      await newUser.save();

      return { ...newUser._doc, password: null };
    } catch (err) {
      throw err;
    }
  }
};
