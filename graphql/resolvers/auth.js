const bcrypt = require('bcryptjs');
const User = require('../../models/user');

const jwt = require('jsonwebtoken');

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
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const isAuthenticated = await bcrypt.compare(password, user.password);

      if (!isAuthenticated) {
        throw new Error('Invalid credentials');
      }

      token = await jwt.sign(
        { userId: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
      );

      return {
        userId: user.id,
        token,
        tokenExpiration: 1
      };
    } catch (error) {
      throw error;
    }
  }
};
