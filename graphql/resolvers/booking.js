const Booking = require('../../models/booking');

const { transformEventn, transformBooking } = require('./merge');

module.exports = {
  /**** Resolvers */
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map(booking => {
        return transformBooking(booking);
      });
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

      return transformBooking(result);
    } catch (error) {
      throw error;
    }
  },
  cancelBooking: async ({ bookingId }) => {
    try {
      const booking = await Booking.findById(bookingId).populate('event');
      console.log(booking._doc);
      const event = transformEvent(booking.event);

      console.log(event);

      await Booking.deleteOne({ _id: bookingId });

      return event;
    } catch (error) {
      throw error;
    }
  }
};
