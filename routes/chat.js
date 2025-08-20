const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Get chat history for a site
router.get('/:siteId', chatController.getChatHistory);

// Save a new chat message
router.post('/message', chatController.saveMessage);

// Delete chat history for a site (admin function)
router.delete('/:siteId', chatController.deleteChatHistory);

module.exports = router; 