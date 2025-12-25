import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { getUserById, updateUser, getUsers } from '../database/db.js'

const router = express.Router()

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, profilePicture } = req.body
    const updates = {}
    
    if (fullName) updates.fullName = fullName
    if (profilePicture) updates.profilePicture = profilePicture

    const updatedUser = await updateUser(req.user.id, updates)
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Add skill (have)
router.post('/skills/have', authenticateToken, async (req, res) => {
  try {
    const { skill } = req.body
    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' })
    }

    const user = await getUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.skillsHave.includes(skill)) {
      return res.status(400).json({ error: 'Skill already added' })
    }

    const updatedSkills = [...(user.skillsHave || []), skill]
    const updatedUser = await updateUser(req.user.id, { skillsHave: updatedSkills })

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Add skill error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Remove skill (have)
router.delete('/skills/have/:skill', authenticateToken, async (req, res) => {
  try {
    const { skill } = req.params
    const user = await getUserById(req.user.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updatedSkills = (user.skillsHave || []).filter(s => s !== skill)
    const updatedUser = await updateUser(req.user.id, { skillsHave: updatedSkills })

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Remove skill error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Add skill (want)
router.post('/skills/want', authenticateToken, async (req, res) => {
  try {
    const { skill } = req.body
    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' })
    }

    const user = await getUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.skillsWant.includes(skill)) {
      return res.status(400).json({ error: 'Skill already added' })
    }

    const updatedSkills = [...(user.skillsWant || []), skill]
    const updatedUser = await updateUser(req.user.id, { skillsWant: updatedSkills })

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Add skill error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Remove skill (want)
router.delete('/skills/want/:skill', authenticateToken, async (req, res) => {
  try {
    const { skill } = req.params
    const user = await getUserById(req.user.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updatedSkills = (user.skillsWant || []).filter(s => s !== skill)
    const updatedUser = await updateUser(req.user.id, { skillsWant: updatedSkills })

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Remove skill error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get user by ID (public)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const { password: _, email: __, ...publicUser } = user
    res.json(publicUser)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

