const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserM = require('../models/userM');
const Profile = require("../models/profileM")
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: process.env.CALLBACKURL,
    scope:["profile","email"]
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log(profile._json);
        const { sub, email, name, picture } = profile._json;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');

        let user = await UserM.findOne({ googleId: sub });

        if (!user) {
            user = await UserM.create({
                firstName,
                lastName,
                email,
                googleId: sub,
                    avatar: {
                        public_id: "google",
                        url: picture,
                    },
                authProvider: 'google',
            });
            await Profile.create({
                user: user._id,
                avatars: [
                  {
                    url: "https://in.pinterest.com/pin/63824519713555292/"
                  }
                ]
              });
        }

        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserM.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
