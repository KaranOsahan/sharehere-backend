const authService = require('./auth.service');

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Token sent from Frontend
    
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const result = await authService.loginWithGoogle(token);
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token
    });

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
};