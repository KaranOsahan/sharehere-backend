const express = require('express');
const router = express.Router();
const fileController = require('./file.controller');
const auth = require('../../middleware/auth'); // Protect routes

// POST /api/files/upload-url (Protected)
router.post('/upload-url', auth, fileController.initializeUpload);

// POST /api/files/finalize (Protected)
router.post('/finalize', auth, fileController.finalizeUpload);

// GET /api/files/:code (Public - anyone with code can download)
router.get('/:code', fileController.getFile);

module.exports = router;