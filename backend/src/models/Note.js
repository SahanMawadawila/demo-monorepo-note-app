import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", body: "text" });

const Note = mongoose.model("Note", noteSchema);

export default Note;

