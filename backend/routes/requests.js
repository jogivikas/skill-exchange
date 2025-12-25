import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import {
  getRequests,
  createRequest,
  updateRequest,
  getRequestById,
  getUserById
} from '../database/db.js'

const router = express.Router()

// Get incoming requests
router.get('/incoming', authenticateToken, async (req, res) => {
  try {
    const requests = await getRequests()
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const incoming = requests.filter(r =>
      r.toUserId && r.toUserId.toString() === userId.toString()
    )

    // Enrich with user data
    const enrichedRequests = await Promise.all(
      incoming.map(async (req) => {
        const fromUser = await getUserById(req.fromUserId)
        if (!fromUser) return null
        return {
          ...req,
          id: req._id?.toString() || req.id,
          fromUser: {
            _id: fromUser._id?.toString() || fromUser.id,
            id: fromUser._id?.toString() || fromUser.id,
            fullName: fromUser.fullName,
            name: fromUser.fullName,
            photo: fromUser.profilePicture,
            initials: getInitials(fromUser.fullName)
          }
        }
      })
    )

    res.json(enrichedRequests.filter(r => r !== null))
  } catch (error) {
    console.error('Get incoming requests error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get outgoing requests
router.get('/outgoing', authenticateToken, async (req, res) => {
  try {
    const requests = await getRequests()
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const outgoing = requests.filter(r =>
      r.fromUserId && r.fromUserId.toString() === userId.toString()
    )

    // Enrich with user data
    const enrichedRequests = await Promise.all(
      outgoing.map(async (req) => {
        const toUser = await getUserById(req.toUserId)
        if (!toUser) return null
        return {
          ...req,
          id: req._id?.toString() || req.id,
          toUser: {
            _id: toUser._id?.toString() || toUser.id,
            id: toUser._id?.toString() || toUser.id,
            fullName: toUser.fullName,
            name: toUser.fullName,
            photo: toUser.profilePicture,
            initials: getInitials(toUser.fullName)
          }
        }
      })
    )

    res.json(enrichedRequests.filter(r => r !== null))
  } catch (error) {
    console.error('Get outgoing requests error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Create exchange request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { toUserId, skillsOffered, skillsWanted } = req.body

    if (!toUserId || !skillsOffered || !skillsWanted) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if request already exists
    const existingRequests = await getRequests()
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const toUserIdObj = new mongoose.Types.ObjectId(toUserId)
    const duplicate = existingRequests.find(
      r => r.fromUserId && r.fromUserId.toString() === userId.toString() &&
        r.toUserId && r.toUserId.toString() === toUserIdObj.toString() &&
        r.status === 'pending'
    )

    if (duplicate) {
      return res.status(400).json({ error: 'Request already sent' })
    }

    const newRequest = await createRequest({
      fromUserId: userId,
      toUserId: toUserIdObj,
      skillsOffered,
      skillsWanted
    })

    res.status(201).json({ ...newRequest, id: newRequest._id?.toString() || newRequest.id })
  } catch (error) {
    console.error('Create request error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Accept request
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const foundRequest = await getRequestById(req.params.id)

    if (!foundRequest) {
      return res.status(404).json({ error: 'Request not found' })
    }

    const userId = new mongoose.Types.ObjectId(req.user.id)
    if (!foundRequest.toUserId || foundRequest.toUserId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const updatedRequest = await updateRequest(req.params.id, {
      status: 'accepted',
      acceptedAt: new Date()
    })

    res.json({ ...updatedRequest, id: updatedRequest._id?.toString() || updatedRequest.id })
  } catch (error) {
    console.error('Accept request error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Reject request
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const foundRequest = await getRequestById(req.params.id)

    if (!foundRequest) {
      return res.status(404).json({ error: 'Request not found' })
    }

    const userId = new mongoose.Types.ObjectId(req.user.id)
    if (!foundRequest.toUserId || foundRequest.toUserId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const updatedRequest = await updateRequest(req.params.id, {
      status: 'rejected',
      rejectedAt: new Date()
    })

    res.json({ ...updatedRequest, id: updatedRequest._id?.toString() || updatedRequest.id })
  } catch (error) {
    console.error('Reject request error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default router

