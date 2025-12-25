import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { userAPI } from '../services/api'
import './EditSkill.css'

const EditSkill = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || 'have'
  const skill = decodeURIComponent(searchParams.get('skill') || '')
  const [value, setValue] = useState(skill)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setValue(skill)
  }, [skill])

  const handleSave = async () => {
    if (!value.trim()) return alert('Provide a skill')
    try {
      setSaving(true)
      if (type === 'have') {
        await userAPI.removeSkillHave(skill)
        await userAPI.addSkillHave(value.trim())
      } else {
        await userAPI.removeSkillWant(skill)
        await userAPI.addSkillWant(value.trim())
      }
      navigate('/skills')
    } catch (err) {
      alert('Error saving: ' + err.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="edit-page">
      <Navbar />
      <div className="edit-container">
        <h2>Edit Skill</h2>
        <p>Type: {type}</p>
        <input value={value} onChange={e => setValue(e.target.value)} />
        <div className="edit-actions">
          <button className="btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn ghost" onClick={() => navigate('/skills')}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default EditSkill
