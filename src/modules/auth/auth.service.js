const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * 1. Verify Google Token
 * 2. Find or Create User in DB
 * 3. Generate App JWT
 */
exports.loginWithGoogle = async (token) => {
  // A. Verify the token with Google's servers
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  
  const { name, email, picture, sub: googleId } = ticket.getPayload();

  // B. Check if user exists
  let user = await User.findOne({ email });

  // C. If not, create new user
  if (!user) {
    user = await User.create({
      name,
      email,
      picture,
      googleId
    });
  }

  // D. Generate our own JWT (valid for 7 days)
  const appToken = jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  return { user, token: appToken };
};