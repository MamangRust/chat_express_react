const User = require('../database/models').User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/app');

/**
 * Log in a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The response containing the logged in user's token and avatar.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password!' });
    }

    const userWithToken = generateToken(user.get({ raw: true }));
    userWithToken.user.avatar = user.avatar;

    return res.send(userWithToken);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/**
 * Registers a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The response object with the registered user and token.
 */
exports.register = async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    const userWithToken = generateToken(newUser.get({ raw: true }));
    return res.send(userWithToken);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Generates a token for the given user.
 *
 * @param {object} user - The user object.
 * @return {object} An object containing the user object and the generated token.
 */
const generateToken = (user) => {
  const { password, ...rest } = user;

  const token = jwt.sign(rest, config.appKey, { expiresIn: 86400 });

  return { user: rest, token };
};
