const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');

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

    return events.map(event => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEventFn = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (error) {
    throw error;
  }
};

const transformEvent = event => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: userFn.bind(this, event._doc.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    user: userFn.bind(this, booking._doc.user),
    event: singleEventFn.bind(this, booking._doc.event),
    createdAt: new Date(booking._doc.createdAt).toISOString(),
    updatedAt: new Date(booking._doc.updatedAt).toISOString()
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
// exports.singleEventFn = singleEventFn;
// exports.events = events;
// exports.userFn = userFn;
