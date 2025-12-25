import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Loading from '../components/ui/Loading'
import Toast from '../components/ui/Toast'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'

const ManageSkills = () => {
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newSkillHave, setNewSkillHave] = useState('')
  const [newSkillWant, setNewSkillWant] = useState('')
  const [toast, setToast] = useState(null)
  const [deletingSkill, setDeletingSkill] = useState(null)

  useEffect(() => {
    if (!authUser && !localStorage.getItem('token')) {
      navigate('/login')
      return
    }
    load()
  }, [authUser])

  const load = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getProfile()
      setProfile(data)
    } catch (err) {
      showToast('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const validateSkill = (skill) => {
    const trimmed = skill.trim()
    if (!trimmed) {
      showToast('Skill cannot be empty', 'error')
      return null
    }
    if (trimmed.length < 2) {
      showToast('Skill must be at least 2 characters', 'error')
      return null
    }
    if (trimmed.length > 50) {
      showToast('Skill must be less than 50 characters', 'error')
      return null
    }
    return trimmed
  }

  const addHave = async () => {
    const skill = validateSkill(newSkillHave)
    if (!skill) return

    // Check for duplicates
    if (profile?.skillsHave?.some(s => s.toLowerCase() === skill.toLowerCase())) {
      showToast('You already have this skill', 'warning')
      return
    }

    try {
      await userAPI.addSkillHave(skill)
      setNewSkillHave('')
      await load()
      showToast(`Added "${skill}" to your offered skills`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to add skill', 'error')
    }
  }

  const addWant = async () => {
    const skill = validateSkill(newSkillWant)
    if (!skill) return

    // Check for duplicates
    if (profile?.skillsWant?.some(s => s.toLowerCase() === skill.toLowerCase())) {
      showToast('You already want to learn this skill', 'warning')
      return
    }

    try {
      await userAPI.addSkillWant(skill)
      setNewSkillWant('')
      await load()
      showToast(`Added "${skill}" to your wanted skills`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to add skill', 'error')
    }
  }

  const removeHave = async (skill) => {
    setDeletingSkill(skill)
    try {
      await userAPI.removeSkillHave(skill)
      await load()
      showToast(`Removed "${skill}" from your offered skills`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to remove skill', 'error')
    } finally {
      setDeletingSkill(null)
    }
  }

  const removeWant = async (skill) => {
    setDeletingSkill(skill)
    try {
      await userAPI.removeSkillWant(skill)
      await load()
      showToast(`Removed "${skill}" from your wanted skills`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to remove skill', 'error')
    } finally {
      setDeletingSkill(null)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content">
          <Loading message="Loading your skills..." />
        </div>
      </div>
    )
  }

  const skillsHave = profile?.skillsHave || []
  const skillsWant = profile?.skillsWant || []

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="mb-8">
          <h1 className="page-title">Manage Your Skills</h1>
          <p className="page-subtitle">
            Add skills you offer and skills you want to learn to find better matches.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Skills I Offer */}
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Skills I Offer</h2>
              <p className="text-gray-600 text-sm">
                {skillsHave.length} skill{skillsHave.length !== 1 ? 's' : ''} added
              </p>
            </div>

            {skillsHave.length === 0 ? (
              <EmptyState icon="🎯" title="No skills yet" message="Add your first skill to get started" />
            ) : (
              <div className="space-y-2 mb-6">
                {skillsHave.map((skill, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 transition-all duration-200 ${
                      deletingSkill === skill ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium text-gray-900">{skill}</span>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeHave(skill)}
                      disabled={deletingSkill === skill}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-gray-200">
              <Input
                label="Add a new skill"
                placeholder="e.g., JavaScript, Graphic Design, Photography"
                value={newSkillHave}
                onChange={(e) => setNewSkillHave(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHave()}
              />
              <Button variant="primary" size="md" onClick={addHave} className="w-full">
                + Add Skill
              </Button>
            </div>
          </Card>

          {/* Skills I Want */}
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Skills I Want to Learn</h2>
              <p className="text-gray-600 text-sm">
                {skillsWant.length} skill{skillsWant.length !== 1 ? 's' : ''} added
              </p>
            </div>

            {skillsWant.length === 0 ? (
              <EmptyState icon="📚" title="No learning goals yet" message="Add skills you want to master" />
            ) : (
              <div className="space-y-2 mb-6">
                {skillsWant.map((skill, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-200 ${
                      deletingSkill === skill ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🎯</span>
                      <span className="font-medium text-gray-900">{skill}</span>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeWant(skill)}
                      disabled={deletingSkill === skill}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-gray-200">
              <Input
                label="Add a learning goal"
                placeholder="e.g., Python, Video Editing, Web Design"
                value={newSkillWant}
                onChange={(e) => setNewSkillWant(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWant()}
              />
              <Button variant="primary" size="md" onClick={addWant} className="w-full">
                + Add Goal
              </Button>
            </div>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Ready to find matches?</h3>
            <p className="text-gray-600 mb-6">
              Now that you've set up your skills, discover users who can help you learn and who need your expertise.
            </p>
            <Link to="/find-match">
              <Button variant="primary" size="md">
                Find Matches
              </Button>
            </Link>
          </div>
        </Card>
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

export default ManageSkills

