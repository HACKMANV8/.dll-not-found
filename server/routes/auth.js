const express = require('express');
const passport = require('passport');
const router = express.Router();

// Route: GET /auth/github
// Starts the login process
router.get('/github',
  passport.authenticate('github')
);

// Route: GET /auth/github/callback
// GitHub redirects back here
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: process.env.FRONTEND_URL + '/home'
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/dashboard');
  }
);

// Route: POST /auth/logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out' });
    });
  });
});

module.exports = router;