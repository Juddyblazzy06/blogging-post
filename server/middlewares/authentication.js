const jwt = require('jsonwebtoken');

const authMiddleWare = (req, res, next) => {
  console.log('Auth Middleware Triggered'); // Log middleware execution

  // Log all cookies to check if `authToken` exists
  console.log('Cookies:', req.cookies);

  // Extract the token from cookies or the Authorization header
  const token = req.cookies?.authToken || req.headers['authorization']?.split(' ')[1];

  // Log the token fetched from cookies or headers
  console.log('Auth Token:', token);

  if (!token) {
    console.log('No token found. Redirecting to login.');
    return res.redirect('/login'); // Redirect if no token
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log the decoded token payload
    console.log('Decoded Token:', decoded);

    // Attach the decoded user info to the request object
    // req.author = { _id: decoded.authorId, username: decoded.username };
    req.user = decoded;
   
    next(); // Pass control to the next middleware or route
  } catch (err) {
    console.error('Authentication error:', err.message);
    console.log('Redirecting to login due to invalid token.');
    return res.redirect('/login'); // Redirect if token is invalid
  }
};

module.exports = authMiddleWare;
