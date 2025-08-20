const Chat = require('../model/Chat');

// Get chat history for a site
exports.getChatHistory = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    const messages = await Chat.find({ siteId })
      .sort({ timestamp: 1 })
      .limit(100); // Limit to last 100 messages for performance
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save a new chat message
exports.saveMessage = async (req, res) => {
  try {
    const { siteId, sender, message, isUser } = req.body;
    
    const newMessage = new Chat({
      siteId,
      sender,
      message,
      isUser: isUser !== undefined ? isUser : true
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete chat messages for a site (admin function)
exports.deleteChatHistory = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    const result = await Chat.deleteMany({ siteId });
    
    res.json({ 
      message: 'Chat history deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 