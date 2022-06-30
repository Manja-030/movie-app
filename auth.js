const jwtSecret = 'your_jwt_secret'; //must be same key used in JWTStategy

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); //Your local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

/**
 * Route logging in the user.
 * Handles user login, generating a jwt upon login
 * Endpoint: /login
 * @method POST
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - user data, jwt
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is wrong.',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
