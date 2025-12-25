import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { getUsers, getUserById } from '../database/db.js'

const router = express.Router()

// Find matches
router.get('/', authenticateToken, async (req, res) => {
  try {
    const currentUser = await getUserById(req.user.id)
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const allUsers = await getUsers()
    const currentUserId = currentUser._id.toString()
    
    // Get all users except current user
    const matches = allUsers
      .filter(user => {
        // Don't include current user
        return user._id.toString() !== currentUserId
      })
      .map(user => {
        // Calculate match percentage (0 if no skills match)
        const matchScore = calculateMatchScore(currentUser, user)
        return {
          id: user._id.toString(),
          name: user.fullName,
          initials: getInitials(user.fullName),
          rating: user.rating || 0,
          matchPercent: Math.round(matchScore),
          offers: user.skillsHave || [],
          wants: user.skillsWant || []
        }
      })
      .sort((a, b) => {
        // Sort by match percentage first, then by rating
        if (b.matchPercent !== a.matchPercent) {
          return b.matchPercent - a.matchPercent
        }
        return b.rating - a.rating
      })

    res.json(matches)
  } catch (error) {
    console.error('Find matches error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

function calculateMatchScore(user1, user2) {
  // User1 wants what user2 has
  const wantsMatch = (user1.skillsWant || []).filter(skill => 
    (user2.skillsHave || []).includes(skill)
  ).length

  // User2 wants what user1 has
  const offersMatch = (user2.skillsWant || []).filter(skill => 
    (user1.skillsHave || []).includes(skill)
  ).length

  const totalPossible = Math.max(
    (user1.skillsWant || []).length,
    (user2.skillsWant || []).length,
    1
  )

  const matchCount = wantsMatch + offersMatch
  return (matchCount / totalPossible) * 100
}

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default router

