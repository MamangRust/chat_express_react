const jwt = require('jsonwebtoken');
const config = require('../config/app');

exports.auth = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing token!' });
  }

  jwt.verify(token, config.appKey, (err, user) => {
    if (err) {
      return res.status(401).json({ error: err });
    }

    req.user = user;
  });

  next();
};
