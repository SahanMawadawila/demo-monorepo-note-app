import express from "express";
import Note from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Create a new note (authenticated)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    const note = await Note.create({
      title,
      body,
      author: req.user._id
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// List/search notes (public)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      filter = { $text: { $search: search } };
    }

    const notes = await Note.find(filter)
      .populate("author", "email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notes);
  } catch (err) {
    console.error("List notes error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single note by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate("author", "email");
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    console.error("Get note error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

