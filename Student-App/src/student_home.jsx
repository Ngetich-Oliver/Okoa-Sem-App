
import { useState } from 'react'
import './App.css'

const materialCategories = [
  { value: '', label: 'All materials' },
  { value: 'notes', label: 'Lecture notes' },
  { value: 'assignments', label: 'Assignments' },
  { value: 'past_papers', label: 'Past papers' },
]

const benefits = [
  'Study administrator-uploaded course materials',
  'Get answers grounded in your course content',
  'Work through past papers, quizzes, and assignments',
  'Spot likely exam questions from past paper patterns',
  'Get study tips and organize a revision schedule',
]

export default function StudentHome({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [unitCode, setUnitCode] = useState('')
  const [category, setCategory] = useState('')
  const [materials, setMaterials] = useState([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState('')

  async function searchMaterials(event) {
    event.preventDefault()
    const normalizedCode = unitCode.trim().toUpperCase().replace(/\s+/g, ' ')
    if (!normalizedCode) {
      setSearchError('Enter a unit code to search.')
      return
    }

    setSearching(true)
    setHasSearched(true)
    setSearchError('')
    try {
      const params = new URLSearchParams({ unit_code: normalizedCode })
      if (category) params.set('category', category)
      const response = await fetch(`/api/materials.php?${params}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not search study materials.')
      if (!Array.isArray(result.materials)) throw new Error('The materials service returned an unexpected response.')
      setMaterials(result.materials)
    } catch (error) {
      setMaterials([])
      setSearchError(error.message || 'Search failed. Check the materials API.')
    } finally {
      setSearching(false)
    }
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Okoa Sem home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>okoa<span className="brand-light">sem</span></span>
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
        <nav id="primary-navigation" className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a className="nav-link active" href="#home" onClick={closeMenu}>Home</a>
          <a className="nav-link" href="#materials" onClick={closeMenu}>Find materials</a>
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
            <h1>Make every student <br className="desktop-break" /> Graduate <span> First.</span></h1>
            <p className="hero-description">
              Welcome{user?.displayName ? `, ${user.displayName}` : ''} to Okoa Sem — a smarter space to organize your learning, find your focus, and feel ready for exam day.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#materials">Find study materials <span aria-hidden="true">→</span></a>
              <a className="text-link" href="#study-assistant">Meet your study assistant <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-note"><span className="note-icon" aria-hidden="true">✦</span> Your courses, your pace, your progress.</div>
          </div>
          <div className="hero-art" aria-label="Illustration of organized study materials" role="img">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-card art-card-back"><span className="art-line short" /><span className="art-line" /><span className="art-line medium" /><span className="art-line" /></div>
            <div className="art-card art-card-front">
              <div className="art-card-top"><span className="mini-icon">✳</span><span className="art-tag">STUDY PLAN</span></div>
              <div className="art-title">Small steps.<br />Big progress.</div>
              <div className="progress-track"><span /></div>
              <div className="progress-caption"><span>Weekly focus</span><strong>72%</strong></div>
            </div>
            <span className="floating-star star-one" aria-hidden="true">✳</span>
            <span className="floating-star star-two" aria-hidden="true">✦</span>
            <div className="art-bubble"><span aria-hidden="true">✓</span> You’ve got this</div>
          </div>
        </section>

        <section className="resources-section" id="materials">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR STUDY LIBRARY</p>
              <h2>Find materials by unit code</h2>
            </div>
            <p>Search administrator-uploaded notes, assignments, and past papers.</p>
          </div>
          <form className="materials-search" onSubmit={searchMaterials}>
            <label className="materials-search-field">
              Unit code
              <input
                type="search"
                value={unitCode}
                onChange={(event) => setUnitCode(event.target.value)}
                placeholder="e.g. SCS 104"
                aria-label="Search study materials by unit code"
                maxLength={64}
                required
              />
            </label>
            <label className="materials-search-field">
              Material type
              <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by material type">
                {materialCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <button className="button button-primary" type="submit" disabled={searching}>
              {searching ? 'Searching…' : 'Search materials'}
            </button>
          </form>
          {searchError && <p className="materials-message error" role="alert">{searchError}</p>}
          {hasSearched && !searching && !searchError && materials.length === 0 && (
            <p className="materials-message" role="status">No materials found for {unitCode.trim().toUpperCase()}.</p>
          )}
          {materials.length > 0 && (
            <div className="materials-results" aria-live="polite">
              {materials.map((material) => (
              <article className="material-result" key={material.id}>
                <div>
                  <span className="material-category">{material.categoryLabel}</span>
                  <h3>{material.title}</h3>
                  <p>{material.unit_code} · {material.uploaded_at}</p>
                </div>
                <div className="material-actions">
                  <a className="button button-secondary" href={material.view_url} target="_blank" rel="noreferrer">View</a>
                  <a className="button button-primary" href={material.download_url}>Download</a>
                </div>
              </article>
              ))}
            </div>
          )}
        </section>

        <section className="assistant-section" id="study-assistant">
          <div className="assistant-badge" aria-hidden="true">✦</div>
          <div className="assistant-copy">
            <p className="eyebrow">A LITTLE HELP, RIGHT ON TIME</p>
            <h2>Meet your study assistant</h2>
            <p>Use AI-powered support to make sense of your materials and plan your next steps with confidence.</p>
          </div>
          <ul>
            {benefits.map((benefit) => (
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
        <p>Study with purpose. Show up with confidence.</p>
        <span>© {new Date().getFullYear()} <a href="https://links.example.com" target="_blank" rel="noreferrer">Ngetich Oliver</a>  </span>
      </footer>
    </div>
  )
}