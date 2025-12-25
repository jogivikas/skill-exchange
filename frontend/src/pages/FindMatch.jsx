import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import Toast from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'
import { matchAPI, requestAPI } from '../services/api'

const FindMatch = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState({})
  const [requestStatus, setRequestStatus] = useState({})
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadMatches()
  }, [user])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const data = await matchAPI.findMatches()
      // Load requests to show status per user
      try {
        const [incoming, outgoing] = await Promise.all([
          requestAPI.getIncoming(),
          requestAPI.getOutgoing(),
        ])
        const statusMap = {}
        incoming.forEach((r) => {
          if (r.fromUser?.id) statusMap[r.fromUser.id] = r.status
        })
        outgoing.forEach((r) => {
          if (r.toUser?.id) statusMap[r.toUser.id] = r.status
        })
        setRequestStatus(statusMap)
      } catch (err) {
        console.warn('Could not load requests for status:', err)
      }

      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
      setToast({ message: 'Failed to load matches', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSendRequest = async (matchId, skillsOffered, skillsWanted) => {
    try {
      setSending({ ...sending, [matchId]: true })
      await requestAPI.createRequest({
        toUserId: matchId,
        skillsOffered,
        skillsWanted,
      })
      setToast({ message: 'Exchange request sent successfully!', type: 'success' })
      await loadMatches()
    } catch (error) {
      setToast({ message: error.message || 'Failed to send request', type: 'error' })
    } finally {
      setSending({ ...sending, [matchId]: false })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      accepted: { variant: 'success', text: '✓ Accepted', icon: '💬' },
      pending: { variant: 'warning', text: '⏳ Pending', icon: '⏳' },
      rejected: { variant: 'info', text: '✕ Declined', icon: '✕' },
    }
    return badges[status]
  }

  const calculateMatchScore = (match) => {
    // Simple match score based on skill overlap
    const commonSkills = (match.offers || []).filter((skill) =>
      (user?.skillsWant || []).some((s) => s.toLowerCase() === skill.toLowerCase())
    ).length

    const reverseMatch = (user?.skillsHave || []).filter((skill) =>
      (match.wants || []).some((s) => s.toLowerCase() === skill.toLowerCase())
    ).length

    if (commonSkills + reverseMatch === 0) return 0
    return Math.min(100, Math.round(((commonSkills + reverseMatch) / (Math.max(user?.skillsWant?.length || 1, match.offers?.length || 1) + Math.max(user?.skillsHave?.length || 1, match.wants?.length || 1))) * 100))
  }

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content">
          <Loading message="Finding matches..." />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="mb-8">
          <h1 className="page-title">Find Your Match</h1>
          <p className="page-subtitle">
            Discover users whose skills complement yours. Exchange knowledge and grow together.
          </p>
        </div>

        {matches.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matches available yet"
            message="Be the first to register and set up your skills to find matches."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const matchScore = calculateMatchScore(match)
              const status = requestStatus[match.id]
              const statusBadge = status && getStatusBadge(status)

              return (
                <Card key={match.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
                  {/* Header with Avatar and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {getInitials(match.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{match.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span>⭐</span>
                          <span>
                            {match.rating > 0 ? match.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    {matchScore > 0 && (
                      <div className="text-right ml-2">
                        <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                          {matchScore}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Match</p>
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-3 mb-4 flex-1">
                    {/* Offers */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Offers
                      </h4>
                      {match.offers && match.offers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {match.offers.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="success">
                              {skill}
                            </Badge>
                          ))}
                          {match.offers.length > 3 && (
                            <Badge variant="gray">+{match.offers.length - 3}</Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No skills listed</p>
                      )}
                    </div>

                    {/* Wants */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Wants to Learn
                      </h4>
                      {match.wants && match.wants.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {match.wants.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="info">
                              {skill}
                            </Badge>
                          ))}
                          {match.wants.length > 3 && (
                            <Badge variant="gray">+{match.wants.length - 3}</Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No goals listed</p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {statusBadge && (
                    <div className="mb-4">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.text}
                      </Badge>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-200">
                    {status === 'accepted' ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/messages?user=${match.id}`)}
                        className="w-full"
                      >
                        💬 Go to Chat
                      </Button>
                    ) : status === 'pending' ? (
                      <Button
                        variant="secondary"
                        size="md"
                        disabled
                        className="w-full"
                      >
                        ⏳ Request Sent
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() =>
                          handleSendRequest(match.id, match.offers, match.wants)
                        }
                        disabled={sending[match.id]}
                        className="w-full"
                      >
                        {sending[match.id] ? 'Sending...' : '📨 Send Request'}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default FindMatch
