import { Link } from 'react-router-dom'
import './Landing.css'

const Landing = () => {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">SkillSwap</div>
          <div className="header-buttons">
            <Link to="/login" className="btn-secondary">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <h1 className="hero-title">Exchange Skills, Not Money</h1>
        <p className="hero-description">
          Join a community where knowledge is currency. Teach what you know, learn what you need, and build meaningful connections through skill exchange.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary-large">Get Started Free</Link>
          <Link to="/login" className="btn-secondary-large">Sign In</Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="cards-container">
          <div className="feature-card">
            <div className="card-icon">👥</div>
            <h3 className="card-title">Add Skills</h3>
            <p className="card-description">
              Share your expertise and what you want to learn. Build your unique skill profile.
            </p>
          </div>
          <div className="feature-card">
            <div className="card-icon">🔍</div>
            <h3 className="card-title">Match Users</h3>
            <p className="card-description">
              Our smart algorithm finds the perfect skill exchange partners for you.
            </p>
          </div>
          <div className="feature-card">
            <div className="card-icon">🔄</div>
            <h3 className="card-title">Exchange Skills</h3>
            <p className="card-description">
              Connect, collaborate, and grow together without spending money.
            </p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <div className="stat-number">5,000+</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">10,000+</div>
          <div className="stat-label">Skills Exchanged</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">95%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
      </section>
    </div>
  )
}

export default Landing

