import express from 'express'
import { authenticateToken, isAdmin } from '../middleware/auth.js'
import { getUsers, getRequests, getMessages, updateUser } from '../database/db.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticateToken)
router.use(isAdmin)

// Get dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    const users = await getUsers()
    const requests = await getRequests()
    const messages = await getMessages()

    const totalUsers = users.length
    const totalMatches = requests.filter(r => r.status === 'accepted').length
    const activeExchanges = requests.filter(r => r.status === 'accepted').length
    const avgRating = users.reduce((sum, u) => sum + (u.rating || 0), 0) / totalUsers || 0

    res.json({
      totalUsers,
      totalMatches,
      activeExchanges,
      avgRating: Math.round(avgRating * 10) / 10
    })
  } catch (error) {
    console.error('Get metrics error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await getUsers()
    const usersList = users.map(user => ({
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      skillsOffered: (user.skillsHave || []).length,
      skillsWanted: (user.skillsWant || []).length,
      matches: 0, // Could calculate from requests
      status: user.status || 'active',
      joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A'
    }))

    res.json(usersList)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    
    const updatedUser = await updateUser(req.params.id, { status })
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

