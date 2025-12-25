import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// POST /messages/send - Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { conversationId, text, receiverId } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !text || !receiverId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = new Message({
      conversationId,
      senderId,
      receiverId,
      text
    });

    const savedMessage = await newMessage.save();

    // Update conversation updatedAt
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date()
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /messages/:conversationId - Get all messages for a conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }); // Oldest first for chat history

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
