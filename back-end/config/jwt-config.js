// config/jwt-config.js
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Expect "Bearer <token>"
  secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    // jwt_payload should have { id: user._id, ... }
    const user = await User.findById(jwt_payload.id).exec();

    if (!user) {
      return done(null, false);
    }

    // What will be available as req.user in passport-protected routes
    return done(null, {
      id: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    return done(err, false);
  }
});

module.exports = strategy;
