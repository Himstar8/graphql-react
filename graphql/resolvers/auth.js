const bcrypt = require('bcryptjs');
const User = require('../../models/user');

module.exports = {
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