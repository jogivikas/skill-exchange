import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { messageAPI, conversationAPI, requestAPI } from '../services/api'
import { io } from 'socket.io-client'

const Messages = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State
  const [conversations, setConversations] = useState([]) // List of matched users/conversations
  const [activeConversation, setActiveConversation] = useState(null) // Currently selected conversation
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState(null)

  // Refs
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Initialize Data
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Fetch Matches (Users we can chat with)
        const [incoming, outgoing] = await Promise.all([
          requestAPI.getIncoming(),
          requestAPI.getOutgoing(),
        ])

        const matches = []
        incoming.forEach(r => {
          if (r.status === 'accepted' && r.fromUser) matches.push(r.fromUser)
        })
        outgoing.forEach(r => {
          if (r.status === 'accepted' && r.toUser) matches.push(r.toUser)
        })

        // 2. Fetch Existing Conversations to get last message context
        let existingConvs = []
        try {
          existingConvs = await conversationAPI.getConversations(user.id)
        } catch (err) {
          console.error("Failed to fetch conversations", err)
        }

        // Merge matches with existing conversation data
        const mergedList = matches.map(match => {
          // Find if we have an existing conversation with this user
          const existing = existingConvs.find(c =>
            c.participants.some(p => p._id === match._id)
          )

          return {
            user: match, // The partner user object
            conversationId: existing?._id || null,
            lastMessage: existing?.lastMessage || null,
            updatedAt: existing?.updatedAt || null
          }
        })

        // Sort by last message time (most recent first)
        mergedList.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
          const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
          return dateB - dateA;
        })

        setConversations(mergedList)
      } catch (err) {
        console.error("Error loading initial data:", err)
        setError("Failed to load messages")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Socket Connection
  useEffect(() => {
    if (!user) return

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5001'

    socketRef.current = io(socketUrl, {
      auth: { token: localStorage.getItem('token') }
    })

    socketRef.current.on('connect', () => console.log('Socket connected'))

    socketRef.current.on('newMessage', (msg) => {
      // If message belongs to active conversation, append it
      // access activeConversation from state? using functional update or ref
      setMessages(prev => [...prev, msg])

      // Also update sidebar "last message"
      setConversations(prev => {
        return prev.map(c => {
          if (c.conversationId === msg.conversationId) {
            return { ...c, lastMessage: { text: msg.text, createdAt: msg.createdAt }, updatedAt: msg.createdAt }
          }
          return c
        }).sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
          const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
          return dateB - dateA;
        })
      })
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [user])

  // Handle Chat Selection
  const handleSelectChat = async (matchItem) => {
    try {
      // If we already have a conversationId, use it. If not, create it.
      let realConvId = matchItem.conversationId

      if (!realConvId) {
        const newConv = await conversationAPI.createConversation(matchItem.user._id)
        realConvId = newConv._id

        // Update our local list with the new ID
        setConversations(prev => prev.map(c =>
          c.user._id === matchItem.user._id
            ? { ...c, conversationId: realConvId }
            : c
        ))
      }

      setActiveConversation({
        ...matchItem,
        conversationId: realConvId
      })

      // Join socket room
      socketRef.current.emit('joinConversation', realConvId)

      // Fetch Messages
      setMessagesLoading(true)
      const msgs = await messageAPI.getMessages(realConvId)
      setMessages(msgs)

    } catch (err) {
      console.error("Failed to select chat", err)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    const text = newMessage.trim()
    const tempId = Date.now().toString() // Optimistic ID

    // Optimistic UI
    const optimisticMsg = {
      _id: tempId,
      text,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      conversationId: activeConversation.conversationId
    }
    setMessages(prev => [...prev, optimisticMsg])
    setNewMessage('')

    try {
      const res = await messageAPI.sendMessage({
        conversationId: activeConversation.conversationId,
        text,
        receiverId: activeConversation.user._id
      })

      // Socket emit (the server will broadcast to others, but we need to ensure we don't double add if we listen to our own events 
      // usually we don't listen to our own socket events for own messages if we do optimistic UI)

    } catch (err) {
      console.error("Failed to send", err)
      // Undo optimistic or show error
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full border-x border-gray-100 shadow-sm mt-0 md:mt-4 md:mb-4 md:rounded-xl md:border-y h-[calc(100vh-80px)]">

        {/* Sidebar - Users List */}
        <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-white ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-xl">{user.username || 'Messages'}</h2>
            <button className="text-2xl">📝</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <Loading />
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No matches yet.
                <br />
                <button onClick={() => navigate('/find-match')} className="text-blue-500 font-semibold mt-2">Find Skills</button>
              </div>
            ) : (
              conversations.map(item => (
                <div
                  key={item.user._id}
                  onClick={() => handleSelectChat(item)}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${activeConversation?.conversationId === item.conversationId ? 'bg-gray-100' : ''}`}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white p-[2px]">
                      <img
                        src={item.user.photo || `https://ui-avatars.com/api/?name=${item.user.fullName}&background=random`}
                        alt={item.user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <p className="font-semibold text-sm">{item.user.fullName}</p>
                    <p className="text-gray-500 text-sm truncate">
                      {item.lastMessage ? item.lastMessage.text : 'Start a conversation'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-white ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  <button onClick={() => setActiveConversation(null)} className="md:hidden mr-3 text-2xl">
                    ←
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                    <img
                      src={activeConversation.user.photo || `https://ui-avatars.com/api/?name=${activeConversation.user.fullName}&background=random`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold">{activeConversation.user.fullName}</span>
                </div>
                <button className="text-2xl">ℹ️</button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                {messagesLoading ? (
                  <Loading />
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p>No messages yet.</p>
                    <p className="text-sm">Say hello to {activeConversation.user.fullName}!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.id
                    const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId)
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full bg-gray-200 mr-2 self-end overflow-hidden flex-shrink-0">
                            {showAvatar && (
                              <img
                                src={activeConversation.user.photo || `https://ui-avatars.com/api/?name=${activeConversation.user.fullName}&background=random`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                        <div
                          className={`px-4 py-2 max-w-[70%] rounded-2xl text-[15px] ${isMe
                              ? 'bg-[#3797f0] text-white rounded-br-none'
                              : 'bg-[#efefef] text-black rounded-bl-none'
                            }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 m-2">
                <form onSubmit={handleSendMessage} className="flex items-center bg-white border border-gray-300 rounded-3xl px-4 py-2">
                  <span className="text-2xl mr-2 cursor-pointer">😊</span>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 outline-none text-sm"
                  />
                  {newMessage.trim() && (
                    <button type="submit" className="text-[#0095f6] font-semibold text-sm ml-2">
                      Send
                    </button>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">✈️</div>
              <h2 className="text-xl font-light mb-2">Your Messages</h2>
              <p className="text-gray-400 mb-4">Send private photos and messages to a friend.</p>
              <button className="bg-[#0095f6] text-white px-4 py-1.5 rounded text-sm font-semibold">
                Send Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
