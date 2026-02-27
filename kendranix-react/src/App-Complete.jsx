import './App-Complete.css'
import { useState, useEffect } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  FileText,
  Sparkles,
  LayoutGrid,
  Zap,
  Lock,
  Calculator,
  Clock,
  Link,
  Mail,
  Eye,
  Unlock,
} from 'lucide-react'
import { apps } from './appData.js'

// Map app IDs to icons
const iconMap = {
  'fifteen-hour-audit': Clock,
  'mom-math-calculator': Calculator,
  'link-page-blueprint': Link,
  'sop-builder': FileText,
  'vision-to-action': Eye,
  'policy-help-desk': FileText,
  'claim-coach': Shield,
}

const tierMeta = {
  free: { label: 'Free', badgeClass: 'free' },
  paid: { label: 'Paid', badgeClass: 'paid' },
  soon: { label: 'Coming Soon', badgeClass: 'soon' },
}

const KIT_FORM_URL = 'https://app.kit.com/forms/9141530/subscriptions'

// ─────────────────────────────────────────────────────────────
// Email Gate Modal (for Free Apps)
// ─────────────────────────────────────────────────────────────
function EmailGateModal({ onClose, targetUrl }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    // Store access flag
    localStorage.setItem('hasEmailAccess', 'true')
    localStorage.setItem('userName', name)
    localStorage.setItem('userEmail', email)

    // Open Kit form in new tab with pre-filled data
    const kitUrl = `${KIT_FORM_URL}?email_address=${encodeURIComponent(email)}&first_name=${encodeURIComponent(name)}`
    window.open(kitUrl, '_blank')

    // Navigate to the target app
    if (targetUrl) {
      window.open(targetUrl, '_blank')
    }
    onClose()
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalIcon">
          <Lock size={24} />
        </div>
        <h3>Unlock Free Tools</h3>
        <p>Enter your info to get instant access to all free apps.</p>
        <form className="modalForm" onSubmit={handleSubmit}>
          <input
            type="text"
            className="input modalInput"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            type="email"
            className="input modalInput"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="primary big modalBtn">
            Unlock Free Apps <Unlock size={16} />
          </button>
        </form>
        {error && <div className="modalError">{error}</div>}
        <div className="modalFinePrint">No spam. Unsubscribe anytime.</div>
        <button className="modalClose" onClick={onClose}>×</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// App Card (Free / Paid)
// ─────────────────────────────────────────────────────────────
function AppCard({ app, onGatedClick, hasAccess }) {
  const Icon = iconMap[app.id] || Zap
  const { label, badgeClass } = tierMeta[app.tier]
  const isFree = app.tier === 'free'

  const handleClick = (e) => {
    if (isFree && !hasAccess) {
      e.preventDefault()
      onGatedClick(app.href)
    }
  }

  return (
    <div className="card">
      <div className="cardTop">
        <div className="cardIcon">
          <Icon size={18} />
        </div>
        <span className={`badge ${badgeClass}`}>{label}</span>
      </div>

      <div className="cardBody">
        <div className="cardTitle">{app.name}</div>
        <div className="cardDesc">{app.description}</div>
      </div>

      <div className="cardFooter">
        {isFree && !hasAccess ? (
          <button className="cardCta primary" onClick={handleClick}>
            <Lock size={14} /> Unlock to Open
          </button>
        ) : (
          <a
            className="cardCta primary"
            href={app.href}
            target="_blank"
            rel="noreferrer"
          >
            {app.cta} <ArrowRight size={16} />
          </a>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Coming Soon Card
// ─────────────────────────────────────────────────────────────
function ComingSoonCard({ app }) {
  const Icon = iconMap[app.id] || Zap

  const scrollToWaitlist = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="card cardSoon">
      <div className="cardTop">
        <div className="cardIcon">
          <Icon size={18} />
        </div>
        <span className="badge soon">Coming Soon</span>
      </div>

      <div className="cardBody">
        <div className="cardTitle">{app.name}</div>
        <div className="cardDesc">{app.description}</div>
      </div>

      <div className="cardFooter">
        <button className="cardCta secondary" onClick={scrollToWaitlist}>
          Join Waitlist <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Coming Soon Waitlist Form
// ─────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    const kitUrl = `${KIT_FORM_URL}?email_address=${encodeURIComponent(email)}&first_name=${encodeURIComponent(name)}`
    window.open(kitUrl, '_blank')
    setSubmitted(true)
    setError('')
  }

  if (submitted) {
    return (
      <div className="waitlistBox waitlistSuccess" id="waitlist-form">
        <CheckCircle2 size={24} />
        <div>
          <h4>You're on the list!</h4>
          <p>We'll email you when these tools are ready.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="waitlistBox" id="waitlist-form">
      <div className="waitlistIcon">
        <Mail size={20} />
      </div>
      <div className="waitlistCopy">
        <h4>Get Notified First</h4>
        <p>Join the waitlist to be the first to know when these tools launch.</p>
      </div>
      <form className="waitlistForm" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="input"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="primary big">
          Join Waitlist <ArrowRight size={16} />
        </button>
      </form>
      {error && <div className="modalError">{error}</div>}
      <div className="finePrint">No spam. Unsubscribe anytime.</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [hasAccess, setHasAccess] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('hasEmailAccess')
    if (stored === 'true') {
      setHasAccess(true)
    }
  }, [])

  const handleGatedClick = (url) => {
    setTargetUrl(url)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setTargetUrl('')
    // Check if access was granted
    const stored = localStorage.getItem('hasEmailAccess')
    if (stored === 'true') {
      setHasAccess(true)
    }
  }

  const free = apps.filter((a) => a.tier === 'free')
  const paid = apps.filter((a) => a.tier === 'paid')
  const soon = apps.filter((a) => a.tier === 'soon')

  // Determine grid class based on item count
  const getGridClass = (count) => {
    if (count === 4) return 'cards cards2'
    if (count === 1) return 'cards cards1'
    if (count === 2) return 'cards cards2'
    return 'cards'
  }

  return (
    <div className="bg">
      {showModal && (
        <EmailGateModal onClose={handleModalClose} targetUrl={targetUrl} />
      )}

      <header className="nav">
        <div className="brand">
          <div className="logo">
            <LayoutGrid size={18} />
          </div>
          <div className="brandText">
            <div className="brandName">Kendra Nix</div>
            <div className="brandSub">Business Operations Tools</div>
          </div>
        </div>

        <div className="navActions">
          <a className="ghost" href="#apps">
            Explore Apps
          </a>
          <a className="primary" href="#waitlist-form">
            Join Waitlist <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <main className="wrap">
        {/* ── HERO ── */}
        <section className="hero">
          <div className="heroLeft">
            <div className="pill">
              <Sparkles size={14} />
              <span>Free tools for mompreneurs & founders</span>
            </div>

            <h1 className="headline">
              Business Operations Tools Directory
              <span className="accent"> — all in one place</span>.
            </h1>

            <p className="subhead">
              A curated collection of apps that help busy founders reclaim time,
              build systems, and scale smarter — from free calculators to premium tools.
            </p>

            <div className="ctaRow" id="get-started">
              <a className="primary big" href="#apps">
                Explore the Apps <ArrowRight size={16} />
              </a>
              <a className="secondary big" href="#waitlist-form">
                Join Waitlist
              </a>
            </div>

            <div className="trustRow">
              <div className="trustItem">
                <CheckCircle2 size={16} />
                <span>Plain-English guidance</span>
              </div>
              <div className="trustItem">
                <CheckCircle2 size={16} />
                <span>Workflow-first design</span>
              </div>
              <div className="trustItem">
                <CheckCircle2 size={16} />
                <span>Built to scale with you</span>
              </div>
            </div>
          </div>

          <div className="heroRight">
            <div className="glassCard">
              <div className="glassTop">
                <div className="pulseDot" />
                <div className="glassTitle">What you get</div>
              </div>

              <div className="glassGrid">
                <div className="mini">
                  <div className="miniIcon"><Zap size={16} /></div>
                  <div className="miniText">
                    <div className="miniHead">Fast clarity</div>
                    <div className="miniSub">Less Googling, more doing</div>
                  </div>
                </div>
                <div className="mini">
                  <div className="miniIcon"><Calculator size={16} /></div>
                  <div className="miniText">
                    <div className="miniHead">Real numbers</div>
                    <div className="miniSub">Know your true costs</div>
                  </div>
                </div>
                <div className="mini">
                  <div className="miniIcon"><FileText size={16} /></div>
                  <div className="miniText">
                    <div className="miniHead">Clean systems</div>
                    <div className="miniSub">SOPs that actually work</div>
                  </div>
                </div>
                <div className="mini">
                  <div className="miniIcon"><Sparkles size={16} /></div>
                  <div className="miniText">
                    <div className="miniHead">Momentum</div>
                    <div className="miniSub">Tiny steps that compound</div>
                  </div>
                </div>
              </div>

              <div className="glassFooter">
                <div className="meter">
                  <div className="meterLabel">Ecosystem progress</div>
                  <div className="meterBar">
                    <div className="meterFill" />
                  </div>
                </div>
                <div className="tinyNote">New tools drop as they're ready.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── APP SECTIONS ── */}
        <div id="apps">
          {/* FREE APPS */}
          <section className="section">
            <div className="sectionHead">
              <h2>Free Apps</h2>
              <p>Start here — no cost, just results.</p>
            </div>

            <div className={getGridClass(free.length)}>
              {free.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  hasAccess={hasAccess}
                  onGatedClick={handleGatedClick}
                />
              ))}
            </div>
          </section>

          {/* PAID APPS */}
          {paid.length > 0 && (
            <section className="section">
              <div className="sectionHead">
                <h2>Paid Apps</h2>
                <p>Premium tools built for serious operators.</p>
              </div>
              <div className={getGridClass(paid.length)}>
                {paid.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    hasAccess={true}
                    onGatedClick={() => {}}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── COMING SOON ── */}
        <section className="section" id="coming-soon">
          <div className="sectionHead">
            <h2>Coming Soon</h2>
            <p>On the roadmap — join the waitlist to get notified first.</p>
          </div>

          <div className={getGridClass(soon.length)}>
            {soon.map((app) => (
              <ComingSoonCard key={app.id} app={app} />
            ))}
          </div>

          <WaitlistForm />
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div>© {new Date().getFullYear()} Kendra Nix</div>
          <div className="footerLinks">
            <a href="#apps">Apps</a>
            <span>•</span>
            <a href="#waitlist-form">Waitlist</a>
            <span>•</span>
            <a href="https://kendranix.com/privacy-policy/" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="https://kendranix.com/contact" target="_blank" rel="noreferrer">
              Contact
            </a>
          </div>
        </footer>
      </main>
    </div>
  )
}
