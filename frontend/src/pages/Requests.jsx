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
import { requestAPI } from '../services/api'

const Requests = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('incoming')
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadRequests()
  }, [user])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const [incoming, outgoing] = await Promise.all([
        requestAPI.getIncoming(),
        requestAPI.getOutgoing(),
      ])
      setIncomingRequests(incoming)
      setOutgoingRequests(outgoing)
    } catch (error) {
      console.error('Error loading requests:', error)
      setToast({ message: 'Failed to load requests', type: 'error' })
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

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

    return date.toLocaleDateString()
  }

  const handleAccept = async (requestId) => {
    try {
      setActioningId(requestId)
      await requestAPI.acceptRequest(requestId)
      setToast({ message: 'Request accepted! You can now chat with them.', type: 'success' })
      await loadRequests()
    } catch (error) {
      setToast({ message: error.message || 'Failed to accept request', type: 'error' })
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async (requestId) => {
    try {
      setActioningId(requestId)
      await requestAPI.rejectRequest(requestId)
      setToast({ message: 'Request rejected', type: 'success' })
      await loadRequests()
    } catch (error) {
      setToast({ message: error.message || 'Failed to reject request', type: 'error' })
    } finally {
      setActioningId(null)
    }
  }

  const handleGoToChat = (userId) => {
    navigate(`/messages?user=${userId}`)
  }

  const requests = activeTab === 'incoming' ? incomingRequests : outgoingRequests

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content">
          <Loading message="Loading requests..." />
        </div>
      </div>
    )
  }

  const renderRequest = (request) => {
    const otherUser = activeTab === 'incoming' ? request.fromUser : request.toUser
    const initials = getInitials(otherUser?.name || 'Unknown')
    const isActioningLoading = actioningId === (request.id || request._id)

    return (
      <Card
        key={request.id || request._id}
        className="flex flex-col hover:shadow-lg transition-shadow duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {otherUser?.name || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-500">{formatTime(request.createdAt)}</p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            variant={
              request.status === 'accepted'
                ? 'success'
                : request.status === 'pending'
                  ? 'warning'
                  : 'info'
            }
          >
            {request.status === 'pending'
              ? '⏰ Pending'
              : request.status === 'accepted'
                ? '✓ Accepted'
                : '✕ Declined'}
          </Badge>
        </div>

        {/* Skills Exchange Section */}
        <div className="mb-6 pb-6 border-t border-gray-200 pt-4">
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Skills Exchange
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* They Offer */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                They Offer
              </p>
              {(request.skillsOffered || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {request.skillsOffered.map((skill, idx) => (
                    <Badge key={idx} variant="success">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No skills specified</p>
              )}
            </div>

            {/* They Want */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                They Want to Learn
              </p>
              {(request.skillsWanted || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {request.skillsWanted.map((skill, idx) => (
                    <Badge key={idx} variant="info">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No skills specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {request.status === 'pending' && activeTab === 'incoming' ? (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAccept(request.id || request._id)}
                disabled={isActioningLoading}
                className="flex-1"
              >
                {isActioningLoading ? '...' : '✓ Accept'}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => handleReject(request.id || request._id)}
                disabled={isActioningLoading}
                className="flex-1"
              >
                {isActioningLoading ? '...' : '✕ Decline'}
              </Button>
            </>
          ) : request.status === 'accepted' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleGoToChat(otherUser?.id)}
              className="w-full"
            >
              💬 Go to Chat
            </Button>
          ) : (
            <Button variant="secondary" size="md" disabled className="w-full">
              ✕ Request Declined
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="mb-8">
          <h1 className="page-title">Exchange Requests</h1>
          <p className="page-subtitle">
            Manage your incoming and outgoing skill exchange requests.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-3 font-semibold transition-colors duration-200 border-b-2 ${
              activeTab === 'incoming'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            ← Incoming
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
              {incomingRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-3 font-semibold transition-colors duration-200 border-b-2 ${
              activeTab === 'outgoing'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Outgoing →
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
              {outgoingRequests.length}
            </span>
          </button>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <EmptyState
            icon={activeTab === 'incoming' ? '📬' : '📤'}
            title={`No ${activeTab} requests`}
            message={
              activeTab === 'incoming'
                ? 'When users send you exchange requests, they will appear here.'
                : 'Your sent requests will appear here while waiting for responses.'
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(renderRequest)}
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

export default Requests

