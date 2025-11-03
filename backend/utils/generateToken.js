// Helper function to generate a JWT (used for both register and login)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

module.exports = generateToken;
