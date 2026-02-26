const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // Protect routes
const noteController = require('./note.controller');

router.get('/', auth, noteController.getMyPages);
router.post('/', auth, noteController.createPage);
router.delete('/:code', auth, noteController.deletePage);

module.exports = router;