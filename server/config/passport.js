const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User'); // Note the path change

module.exports = function(passport) {
  
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT || 4000}/auth/github/callback`,
      scope: ['read:user', 'repo'],
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, username, photos } = profile;
      
      try {
        let user = await User.findOne({ githubId: id });

        if (user) {
          user.githubAccessToken = accessToken;
          await user.save();
        } else {
          user = await User.create({
            githubId: id,
            username: username,
            avatarUrl: photos ? photos[0].value : null,
            githubAccessToken: accessToken,
          });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};