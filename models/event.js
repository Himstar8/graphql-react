const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventSchema = new Schema({
  title: {
    type: String,
    require: true
  },

  description: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    require: true
  }
});

module.exports = mongoose.model('Event', eventSchema);