const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  // Get the token from the request headers
  const token = req.header("auth-token");

  // Check if the token is present
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token not provided" });
  }

  try {
    // Verify the token
    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);

    // Check if the verified user exists in the database
    const userExists = await User.findById(verifiedUser._id);

    if (!userExists) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Attach the verified user to the request object
    req.user = verifiedUser;

    // User is authenticated, proceed to the next middleware or route handler
    return next();
  } catch (error) {
    // Token verification failed
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = isAuthenticated;
