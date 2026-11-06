
import { useAuth } from "./useAuth";
import AdminHome from "./admin_home.jsx";
import StudentHome from "./student_home.jsx";
import "./App.css";

export default function App() {
  const {
    user,
    role,
    isAdmin,
    isUser,
    loading,
    error,
    loginWithGoogle,
    logout,
  } = useAuth();

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-card auth-loading" aria-live="polite">
          <span className="brand-mark" aria-hidden="true">O</span>
          <p>Getting your study space ready…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="sign-in-title">
          <div className="auth-content">
            <a className="brand auth-brand" href="#home" aria-label="Okoa Sem">
              <span className="brand-mark" aria-hidden="true">O</span>
              <span>okoa<span className="brand-light">sem</span></span>
            </a>
            <p className="eyebrow auth-eyebrow">YOUR LEARNING, IN ONE PLACE</p>
            <h1 id="sign-in-title">Make room for <span>your potential.</span></h1>
            <p className="auth-description">Sign in to find your course materials, prepare for exams, and take your next step with confidence.</p>
            <button className="auth-sign-in" type="button" onClick={loginWithGoogle}>
              <span className="google-mark" aria-hidden="true">G</span>
              Continue with Google
              <span className="auth-arrow" aria-hidden="true">→</span>
            </button>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <p className="auth-footnote"><span aria-hidden="true">✦</span> A calmer way to study starts here.</p>
          </div>
          <div className="auth-visual" aria-hidden="true">
            <div className="auth-visual-orbit" />
            <div className="auth-note auth-note-back">
              <span className="auth-note-label">YOUR COURSE LIBRARY</span>
              <span className="auth-note-line auth-note-line-short" />
              <span className="auth-note-line" />
              <span className="auth-note-line auth-note-line-medium" />
            </div>
            <div className="auth-study-card">
              <span className="auth-study-icon">✳</span>
              <span className="auth-study-label">A LITTLE PROGRESS, EVERY DAY</span>
              <strong>Learn at your pace.<br />Grow in your own way.</strong>
              <span className="auth-study-progress"><span /></span>
              <span className="auth-study-caption">Your next chapter starts here</span>
            </div>
            <span className="auth-floating-star auth-floating-star-one">✦</span>
            <span className="auth-floating-star auth-floating-star-two">✳</span>
          </div>
          <span className="auth-copyright">© {new Date().getFullYear()} Okoa Sem</span>
        </section>
      </main>
    );
  }

  // Administrators publish course materials; students search and study them.
  if (isAdmin) {
    return <AdminHome user={user} onLogout={logout} />;
  }

  if (isUser) {
    return <StudentHome user={user} onLogout={logout} />;
  }

  // Role not set / unknown
  return (
    <main className="auth-page">
      <section className="auth-card auth-role-message">
        <header>
          <div>
            <a className="brand auth-brand" href="#home" aria-label="Okoa Sem">
              <span className="brand-mark" aria-hidden="true">O</span>
              <span>okoa<span className="brand-light">sem</span></span>
            </a>
            <h1>Welcome, {user.displayName || user.email}</h1>
            <p>Email: {user.email}</p>
            <p>
              Role: <strong>{role || "Not assigned"}</strong>
            </p>
          </div>
          <button className="button button-primary" onClick={logout}>
            Sign out
          </button>
        </header>

        <p>Your account role is not configured. Contact an administrator.</p>

        {error && <p className="auth-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}