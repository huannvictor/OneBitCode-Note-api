const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const isAuthorized = require("../middlewares/auth");

router.post("/", isAuthorized, async (req, res) => {
  const { title, body } = req.body;

  try {
    const note = new Note({ title, body, author: req.user._id });

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Error creating note" });
  }
});

router.get("/", isAuthorized, async (req, res) => {
  try {
    const notes = await Note.find({ author: req.user._id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Error trying finding notes by author" });
  }
});

router.get("/search", isAuthorized, async (req, res) => {
  const { query } = req.query;

  try {
    let notes = await Note.find({ author: req.user._id }).find({
      $text: { $search: query },
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/:id", isAuthorized, async (req, res) => {
  const { id } = req.params;

  try {
    const note = await Note.findById(id);
    if (isOwner(req.user, note)) res.json(note);
    else
      res.status(403).json({ error: "Error: Note not assigned to this user" });
  } catch (error) {
    res.status(500).json({ error: "Error trying finding note by id" });
  }
});

router.put("/:id", isAuthorized, async (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;

  try {
    const verifiedNote = await Note.findById(id);
    if (isOwner(req.user, verifiedNote)) {
      const note = await Note.findByIdAndUpdate(
        id,
        { $set: { title: title, body: body } },
        { upsert: true, new: true }
      );
      res.json(note);
    } else
      res.status(403).json({ error: "Error: Note not assigned to this user" });
  } catch (error) {
    res.status(500).json({ error: "Error trying updating this note" });
  }
});

router.delete("/:id", isAuthorized, async (req, res) => {
  const { id } = req.params;

  try {
    const note = await Note.findById(id);
    if (isOwner(req.user, note)) {
      const note = await Note.findByIdAndDelete(id);
      res
        .json({
          message: `Note whit id '${note.id}' and title '${note.title}' successfully deleted`,
        })
        .status(204);
    } else
      res.status(403).json({ error: "Error: Note not assigned to this user" });
  } catch (error) {
    res.status(500).json({ error: "Error trying deleting this note" });
  }
});

const isOwner = (user, note) => {
  if (JSON.stringify(user._id) == JSON.stringify(note.author._id)) return true;
  else return false;
};

module.exports = router;
