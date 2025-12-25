import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Loading from '../components/ui/Loading'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'

const Profile = () => {
  const { user: authUser, loadUser } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (authUser || localStorage.getItem('token')) {
      loadProfile()
    } else {
      navigate('/login')
    }
  }, [authUser])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const userData = await userAPI.getProfile()
      setUser(userData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      await userAPI.uploadProfilePhoto(file)
      await loadProfile()
      await loadUser()
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content">
          <Loading message="Loading profile..." />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">User profile not found</p>
            <Button onClick={() => navigate('/skills')}>Manage Skills</Button>
          </div>
        </div>
      </div>
    )
  }

  const initials = getInitials(user.fullName)

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                {initials}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName || 'Unnamed'}</h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>

              <label className="cursor-pointer inline-block mb-6">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Button
                  variant="primary"
                  size="sm"
                  disabled={uploading}
                  onClick={(e) => {
                    e.preventDefault()
                    e.currentTarget.closest('label')?.querySelector('input')?.click()
                  }}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </label>

              <Link to="/skills" className="block">
                <Button variant="secondary" size="md" className="w-full">
                  Manage Skills & Offers
                </Button>
              </Link>
            </div>
          </Card>

          {/* Skills Summary */}
          <Card className="md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Skills Summary</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Skills I Offer
                </h4>
                {(user.skillsHave || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsHave.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Skills I Want to Learn
                </h4>
                {(user.skillsWant || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWant.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        🎯 {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm mb-4">Keep your skills up-to-date to find better matches!</p>
              <Link to="/find-match" className="inline-block">
                <Button variant="secondary" size="sm">
                  Explore Matches
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile

