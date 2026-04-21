import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const protectAdmin = async (req, res, next) => {
  try {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Student.findById(decoded.id).select("-password");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export { protectAdmin };