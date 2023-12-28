const User = require('../database/models').User;
const sequelize = require('sequelize');

/**
 * Updates a user's information.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The updated user.
 */
exports.update = async (req, res) => {
  if (req.file) {
    req.body.avatar = req.file.filename;
  }

  if (req.body.avatar && req.body.avatar.length === 0) {
    delete req.body.avatar;
  }

  try {
    const [rows, result] = await User.update(req.body, {
      where: {
        id: req.user.id,
      },
      returning: true,
      individualHooks: true,
    });

    const user = result[0].get({ raw: true });
    delete user.password;

    return res.send(user);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/**
 * Search for users based on a search term.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.term - The search term.
 * @param {Object} req.user - The logged-in user object.
 * @param {number} req.user.id - The ID of the logged-in user.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the found users.
 * @throws {Error} If there is an error during the search.
 */
exports.search = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        [sequelize.Op.or]: {
          namesConcated: sequelize.where(
            sequelize.fn(
              'concat',
              sequelize.col('firstName'),
              ' ',
              sequelize.col('lastName')
            ),
            {
              [sequelize.Op.iLike]: `%${req.query.term}%`,
            }
          ),
          email: {
            [sequelize.Op.iLike]: `%${req.query.term}%`,
          },
        },
        [sequelize.Op.not]: {
          id: req.user.id,
        },
      },
      limit: 10,
    });

    return res.json(users);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
