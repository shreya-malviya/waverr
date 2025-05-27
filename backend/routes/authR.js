const express = require('express');
const passport = require('passport');
const router = express.Router();
const sendToken = require('../utils/JWTtoken');

// redirecting to the google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

//callback url once logged in
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth' }),
  (req, res) => {
    // sending jwt after success
    sendToken(req.user, 200, res);
  }
);

module.exports = router;
