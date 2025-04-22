import jwt from "jsonwebtoken";

export const authToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "User not logged in" });
    }

    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.error("Token Expired:", err.message);
          console.log("Decoded token or error reason:", err || error);
          return res.status(401).json({ message: "Token has expired" });
        }
    
        console.error("Token Authentication Error:", err.message);
        console.log("Decoded token or error reason:", err || error);
        return res.status(403).json({ message: "Invalid or tampered token" });
      }
    
      req.userId = decoded.id;
      next();
    });
    
    
  } catch (error) {
    console.error("Error in authToken middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
