const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const wrapAsync = require('../utils/wrapAsync');

// Get conversation with user
router.get('/conversation/:userId', wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user._id;
  
  const messages = await Message.find({
    $or: [
      { sender: currentUser, recipient: userId },
      { sender: userId, recipient: currentUser }
    ]
  }).sort({ createdAt: -1 }).limit(50).populate('sender', 'username').populate('recipient', 'username');
  
  res.json(messages.reverse());
}));

// Send message
router.post('/send', wrapAsync(async (req, res) => {
  const { recipientId, content, listingId } = req.body;
  
  if (!content.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }
  
  const message = new Message({
    sender: req.user._id,
    recipient: recipientId,
    listing: listingId,
    content
  });
  
  await message.save();
  await message.populate('sender', 'username');
  
  res.json(message);
}));

// Mark as read
router.put('/:messageId/read', wrapAsync(async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.messageId,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  
  res.json(message);
}));

// Get unread count
router.get('/unread/count', wrapAsync(async (req, res) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    isRead: false
  });
  
  res.json({ unreadCount: count });
}));

module.exports = router;
