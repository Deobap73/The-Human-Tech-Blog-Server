// The-Human-Tech-Blog-Server/src/config/passport.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github';
import User from '../models/User';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GOOGLE
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_, __, profile, done) => {
      const email = profile.emails?.[0].value;
      const name = profile.displayName;
      const avatar = profile.photos?.[0].value;

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name, email, avatar, password: 'oauth' });
      }
      done(null, user);
    }
  )
);

// GITHUB
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
    },
    async (_, __, profile, done) => {
      const email = profile.emails?.[0].value;
      const name = profile.displayName || profile.username;
      const avatar = profile.photos?.[0].value;

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name, email, avatar, password: 'oauth' });
      }
      done(null, user);
    }
  )
);
