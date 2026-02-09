import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createToken, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    const token = createToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      })
      .status(201)
      .json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("Register error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      })
      .json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user._id, email: req.user.email } });
});

export default router;

