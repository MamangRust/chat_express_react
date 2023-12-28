const { body } = require('express-validator');

exports.loginRule = (() => {
  return [body('email').isEmail()];
})();
