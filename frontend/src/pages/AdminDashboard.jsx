import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { adminAPI } from '../services/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!user.isAdmin) {
      navigate('/profile')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [metricsData, usersData] = await Promise.all([
        adminAPI.getMetrics(),
        adminAPI.getUsers()
      ])
      setMetrics(metricsData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      alert('Error loading admin data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="admin-container">
          <h1 className="page-title">Admin Dashboard</h1>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <h1 className="page-title">Admin Dashboard</h1>

        {metrics && (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon purple">👥</div>
              <div className="metric-content">
                <div className="metric-label">Total Users</div>
                <div className="metric-value">{metrics.totalUsers.toLocaleString()}</div>
                <div className="metric-change positive">+12.5% from last month</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon blue">🔄</div>
              <div className="metric-content">
                <div className="metric-label">Total Matches</div>
                <div className="metric-value">{metrics.totalMatches.toLocaleString()}</div>
                <div className="metric-change positive">+8.3% from last month</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon green">📈</div>
              <div className="metric-content">
                <div className="metric-label">Active Exchanges</div>
                <div className="metric-value">{metrics.activeExchanges.toLocaleString()}</div>
                <div className="metric-change positive">+15.7% from last month</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon yellow">⭐</div>
              <div className="metric-content">
                <div className="metric-label">Avg. Rating</div>
                <div className="metric-value">{metrics.avgRating.toFixed(1)}</div>
                <div className="metric-change positive">+0.2 from last month</div>
              </div>
            </div>
          </div>
        )}

        <div className="user-management-section">
          <div className="section-header">
            <h2 className="section-title">User Management</h2>
            <p className="section-subtitle">View and manage registered users</p>
          </div>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No users found
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Skills Offered</th>
                    <th>Skills Wanted</th>
                    <th>Matches</th>
                    <th>Status</th>
                    <th>Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge purple">{user.skillsOffered}</span>
                      </td>
                      <td>
                        <span className="badge blue">{user.skillsWanted}</span>
                      </td>
                      <td>{user.matches}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.joinDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
