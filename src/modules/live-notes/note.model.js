const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  // The unique Room Code (used for joining)
  code: { type: String, required: true, unique: true, index: true },
  
  // Page Title (for Sidebar)
  title: { type: String, default: "Untitled" },
  
  // The actual blocks data (We store JSON string here)
  content: { type: String, default: "[]" },
  
  // 🔥 LINK TO USER: Who owns this page?
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 'private' or 'shared'
  type: { type: String, default: 'private' },

  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);