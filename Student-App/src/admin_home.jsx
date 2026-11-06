
import { useState } from 'react'
import { Activity, CalendarDays, CheckCircle2, Fingerprint, Mail, ShieldCheck, UserRound } from 'lucide-react'
import './App.css'
import FileUpload from './FileUpload.jsx'

const adminBenefits = [
  'Upload notes, assignments, and past papers for students to access',
  'Manage the system and its users',
  'Keep learning resources organized and accessible',
]

const uploadCategories = [
  { icon: '▤', title: 'Lecture notes', description: 'Share course notes with students.', category: 'notes', action: 'Upload notes' },
  { icon: '✎', title: 'Assignments', description: 'Post coursework and assignment files.', category: 'assignments', action: 'Upload assignment' },
  { icon: '◷', title: 'Past papers', description: 'Help students prepare with past exams.', category: 'past_papers', action: 'Upload past paper' },
]

export default function AdminHome({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const closeMenu = () => setMenuOpen(false)
  const displayName = user?.displayName || 'Administrator'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const createdAt = user?.metadata?.creationTime
  const memberSince = createdAt && !Number.isNaN(Date.parse(createdAt))
    ? new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(createdAt))
    : 'Not available'
  const providerName = user?.providerData?.map((provider) => provider.providerId.replace('.com', '')).join(', ') || 'Google'

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Okoa Sem admin home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>okoa<span className="brand-light">sem</span></span>
          <span style={{ marginLeft: 8, fontSize: '0.7rem', opacity: 0.75, fontWeight: 600 }}>ADMIN</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>
        <nav id="primary-navigation" className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Admin navigation">
          <a className="nav-link active" href="#home" onClick={closeMenu}>Dashboard</a>
          <a className="nav-link" href="#materials" onClick={closeMenu}>Upload materials</a>
          <a className="nav-link" href="#profile" onClick={closeMenu}>Profile</a>
          <a className="nav-link" href="#overview" onClick={closeMenu}>Overview</a>
          <button
            type="button"
            className="nav-link"
            onClick={() => { closeMenu(); onLogout?.() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            Sign out
          </button>
        </nav>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <h1>Admin control <br className="desktop-break" /> for every <span> student.</span></h1>
            <p className="hero-description">
              Welcome{user?.displayName ? `, ${user.displayName}` : ''} — manage platform access and keep Okoa Sem running smoothly.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#materials">Manage platform <span aria-hidden="true">→</span></a>
              <a className="text-link" href="#overview">Platform overview <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-note">
              <span className="note-icon" aria-hidden="true">✦</span> Role: Administrator · Manage platform access
            </div>
          </div>
          <div className="hero-art" aria-label="Illustration of admin dashboard" role="img">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-card art-card-back">
              <span className="art-line short" /><span className="art-line" /><span className="art-line medium" /><span className="art-line" />
            </div>
            <div className="art-card art-card-front">
              <div className="art-card-top"><span className="mini-icon">✳</span><span className="art-tag">ADMIN</span></div>
              <div className="art-title">Review uploads.<br />Support students.</div>
              <div className="progress-track"><span style={{ width: '85%' }} /></div>
              <div className="progress-caption"><span>Materials indexed</span><strong>85%</strong></div>
            </div>
            <span className="floating-star star-one" aria-hidden="true">✳</span>
            <span className="floating-star star-two" aria-hidden="true">✦</span>
            <div className="art-bubble"><span aria-hidden="true">✓</span> All systems ready</div>
          </div>
        </section>

        <section className="resources-section" id="materials">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ADMINISTRATION</p>
              <h2>Share study materials</h2>
            </div>
            <p>Upload files with their unit code. Students can then search, view, and download them.</p>
          </div>
          <div className="resource-grid">
            {uploadCategories.map((resource) => (
              <article className="resource-card" key={resource.category}>
                <div className="resource-icon" aria-hidden="true">{resource.icon}</div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <FileUpload category={resource.category} label={resource.action} />
              </article>
            ))}
          </div>
        </section>

        <section className="admin-profile-section" id="profile" aria-labelledby="profile-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR ACCOUNT</p>
              <h2 id="profile-title">Administrator profile</h2>
            </div>
            <p>Your verified account details and access status.</p>
          </div>

          <article className="admin-profile-card">
            <div className="admin-profile-banner">
              <div className="admin-profile-avatar" aria-hidden="true">
                {user?.photoURL && !avatarError ? (
                  <img src={user.photoURL} alt="" onError={() => setAvatarError(true)} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="admin-profile-identity">
                <span className="admin-profile-kicker"><ShieldCheck size={14} /> ADMINISTRATOR ACCOUNT</span>
                <h3>{displayName}</h3>
                <p>{user?.email || 'No email available'}</p>
              </div>
              <span className="admin-profile-role"><CheckCircle2 size={15} /> Admin access</span>
            </div>

            <div className="admin-profile-details">
              <div className="profile-detail">
                <span className="profile-detail-icon"><Mail size={17} /></span>
                <span><small>Email address</small><strong>{user?.email || 'Not available'}</strong></span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-icon"><CheckCircle2 size={17} /></span>
                <span><small>Email verification</small><strong>{user?.emailVerified ? 'Verified' : 'Not verified'}</strong></span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-icon"><Activity size={17} /></span>
                <span><small>Sign-in provider</small><strong>{providerName}</strong></span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-icon"><CalendarDays size={17} /></span>
                <span><small>Member since</small><strong>{memberSince}</strong></span>
              </div>
              <div className="profile-detail profile-detail-id">
                <span className="profile-detail-icon"><Fingerprint size={17} /></span>
                <span><small>Account ID</small><strong>{user?.uid || 'Not available'}</strong></span>
              </div>
              <div className="profile-access-note">
                <span className="profile-detail-icon"><UserRound size={17} /></span>
                <span><strong>Protected administrator access</strong><small>Your account has permission to review student materials.</small></span>
              </div>
            </div>
          </article>
        </section>

        <section className="assistant-section" id="overview">
          <div className="assistant-badge" aria-hidden="true">✦</div>
          <div className="assistant-copy">
            <p className="eyebrow">ADMIN CAPABILITIES</p>
            <h2>What you can do here</h2>
            <p>As an administrator you oversee student materials and keep the platform useful for every learner.</p>
          </div>
          <ul>
            {adminBenefits.map((benefit) => (
              <li key={benefit}><span aria-hidden="true">✓</span>{benefit}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>okoa<span className="brand-light">sem</span></span>
        </a>
        <p>Admin tools · Study with purpose. Show up with confidence.</p>
        <span>© {new Date().getFullYear()} Okoa Sem</span>
      </footer>
    </div>
  )
}