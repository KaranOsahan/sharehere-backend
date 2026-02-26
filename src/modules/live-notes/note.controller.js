const Note = require('./note.model');
const { v4: uuidv4 } = require('uuid');

// 1. Get All Pages for Sidebar
exports.getMyPages = async (req, res) => {
  try {
    const pages = await Note.find({ owner: req.user.id }).select('code title type lastUpdated');
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Create New Page
exports.createPage = async (req, res) => {
  try {
    const { title, type } = req.body;
    const code = uuidv4(); // Generate unique ID

    const newNote = await Note.create({
      code,
      title: title || "Untitled",
      type: type || 'private',
      owner: req.user.id,
      content: '[]' // Empty blocks array
    });

    res.json(newNote);
  } catch (err) {
    res.status(500).json({ message: "Could not create page" });
  }
};

// 3. Delete Page
exports.deletePage = async (req, res) => {
  try {
    await Note.findOneAndDelete({ code: req.params.code, owner: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};