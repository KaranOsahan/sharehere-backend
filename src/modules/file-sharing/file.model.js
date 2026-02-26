const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  _id: { type: String }, // We use UUIDs
  filename: { type: String, required: true },
  key: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.Mixed }, // Allows ObjectId or 'anonymous' string
  downloadCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// TTL Index: Auto-delete metadata after expiry                        COMMENTED THIS OUT BECAUSE CRON JOB IS
//fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });       AGGRESSIVE AND WILL DO ALL WORK BY HIMSELF

module.exports = mongoose.model('File', fileSchema);