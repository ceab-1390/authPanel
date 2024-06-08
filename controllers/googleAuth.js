const {User} = require('../models/userModel');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const logIn = require('./userController');
const Logguer = require('../logger/logger');

var userProfile;

passport.serializeUser(function(user, cb) {
    cb(null, user);
});
  
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URI = process.env.GOOGLE_CALLBACK_URI;
try {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URI
  },
  async function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      try {
        const data = {}
        data.name = userProfile._json.given_name;
        data.lastname = userProfile._json.family_name;
        data.user = userProfile._json.email;
        data.password = 'No password required';
        data.provider = 'google';
        const userfind = await User.validate(data.user);
        if (!userfind){
          const newUser = await User.createOne(data);
          Logguer.info('nuevo usuario de google creado');
        }
        return done(null, userProfile);
      } catch (error) {
        Logguer.error(error)
      }
  }
));
} catch (error) {
  Logguer.error(error);
}





module.exports = passport;