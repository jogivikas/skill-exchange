import User from '../models/User.js'
import Request from '../models/Request.js'
import Message from '../models/Message.js'

// Users
export async function getUsers() {
  try {
    return await User.find({}).lean()
  } catch (error) {
    console.error('Get users error:', error)
    return []
  }
}

export async function getUserById(id) {
  try {
    return await User.findById(id).lean()
  } catch (error) {
    console.error('Get user by id error:', error)
    return null
  }
}

export async function getUserByEmail(email) {
  try {
    return await User.findOne({ email: email.toLowerCase() }).lean()
  } catch (error) {
    console.error('Get user by email error:', error)
    return null
  }
}

export async function createUser(userData) {
  try {
    const user = new User({
      ...userData,
      status: 'active',
      isAdmin: userData.isAdmin || false
    })
    await user.save()
    return user.toObject()
  } catch (error) {
    console.error('Create user error:', error)
    throw error
  }
}

export async function updateUser(id, updates) {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean()
    return user
  } catch (error) {
    console.error('Update user error:', error)
    return null
  }
}

// Requests
export async function getRequests() {
  try {
    return await Request.find({}).lean()
  } catch (error) {
    console.error('Get requests error:', error)
    return []
  }
}

export async function getRequestById(id) {
  try {
    return await Request.findById(id).lean()
  } catch (error) {
    console.error('Get request by id error:', error)
    return null
  }
}

export async function createRequest(requestData) {
  try {
    const request = new Request({
      ...requestData,
      status: 'pending'
    })
    await request.save()
    return request.toObject()
  } catch (error) {
    console.error('Create request error:', error)
    throw error
  }
}

export async function updateRequest(id, updates) {
  try {
    const request = await Request.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean()
    return request
  } catch (error) {
    console.error('Update request error:', error)
    return null
  }
}

// Messages
export async function getMessages() {
  try {
    return await Message.find({}).lean()
  } catch (error) {
    console.error('Get messages error:', error)
    return []
  }
}

export async function getMessagesBetweenUsers(userId1, userId2) {
  try {
    return await Message.find({
      $or: [
        { fromUserId: userId1, toUserId: userId2 },
        { fromUserId: userId2, toUserId: userId1 }
      ]
    })
      .sort({ createdAt: 1 })
      .lean()
  } catch (error) {
    console.error('Get messages between users error:', error)
    return []
  }
}

export async function createMessage(messageData) {
  try {
    const message = new Message({
      ...messageData,
      read: false
    })
    await message.save()
    return message.toObject()
  } catch (error) {
    console.error('Create message error:', error)
    throw error
  }
}

// Mark messages as read in a conversation
export async function markMessagesAsRead(conversationId, currentUserId) {
  try {
    // We update messages in this specific conversation where WE are the receiver and read is false.
    // Assuming 'receiverId' is the field for who gets the message.
    await Message.updateMany(
      { conversationId: conversationId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    )
  } catch (error) {
    console.error('Mark messages as read error:', error)
  }
}
