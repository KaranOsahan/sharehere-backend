const express = require('express');
const router = express.Router();
const fileController = require('./file.controller');
const auth = require('../../middleware/auth'); // Protect routes

// POST /api/files/upload-url (Public)
router.post('/upload-url', fileController.initializeUpload);

// POST /api/files/finalize (Public)
router.post('/finalize', fileController.finalizeUpload);

// GET /api/files/:code (Public - anyone with code can download)
router.get('/:code', fileController.getFile);

module.exports = router;