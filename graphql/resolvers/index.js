const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

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

const singleEventFn = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      creator: userFn.bind(this, event._doc.creator)
    };
  } catch (error) {
    throw error;
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
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map(item => {
        return {
          ...item._doc,
          user: userFn.bind(this, item._doc.user),
          event: singleEventFn.bind(this, item._doc.event),
          createdAt: new Date(item._doc.createdAt).toISOString(),
          updatedAt: new Date(item._doc.updatedAt).toISOString()
        };
      });
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
  },
  bookEvent: async ({ eventId }) => {
    try {
      const fetchedEvent = await Event.findById(eventId);
      if (!fetchedEvent) {
        throw new Error('Event not found');
      }
      const booking = new Booking({
        user: '5c63dcd3faaa202a94fde90d',
        event: fetchedEvent
      });

      const result = await booking.save();

      console.log('successs');
      return {
        ...result._doc,
        user: userFn.bind(this, result._doc.user),
        event: singleEventFn.bind(this, result._doc.event),
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString()
      };
    } catch (error) {
      throw error;
    }
  },
  cancelBooking: async ({ bookingId }) => {
    try {
      const booking = await Booking.findById(bookingId).populate('event');
      console.log(booking._doc);
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: userFn.bind(this, booking.event._doc.creator)
      };

      console.log(event);

      await Booking.deleteOne({ _id: bookingId });

      return event;
    } catch (error) {
      throw error;
    }
  }
};
