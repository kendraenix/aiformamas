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
// Email Gate Box (for Free Apps)
// ─────────────────────────────────────────────────────────────
function EmailGateBox({ onUnlock }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    localStorage.setItem('freeAppsUnlocked', 'true')
    localStorage.setItem('userEmail', email)
    onUnlock()
  }

  return (
    <div className="gateBox">
      <div className="gateIcon">
        <Lock size={20} />
      </div>
      <div className="gateCopy">
        <h3>Unlock Free Tools</h3>
        <p>Enter your email to get instant access to all free apps.</p>
      </div>
      <form className="gateForm" onSubmit={handleSubmit}>
        <input
          type="email"
          className="input"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="primary big">
          Unlock <Unlock size={16} />
        </button>
      </form>
      {error && <div className="gateError">{error}</div>}
      <div className="finePrint">No spam. We respect your privacy.</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// App Card (Free / Paid)
// ─────────────────────────────────────────────────────────────
function AppCard({ app, locked = false }) {
  const Icon = iconMap[app.id] || Zap
  const { label, badgeClass } = tierMeta[app.tier]

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
        {locked ? (
          <span className="cardCta secondary disabled">
            <Lock size={14} /> Unlock above
          </span>
        ) : (
          <a
            className="cardCta primary"
            href={app.href}
            {...(app.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {app.cta} <ArrowRight size={16} />
          </a>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Coming Soon Card (no link, inline waitlist form)
// ─────────────────────────────────────────────────────────────
function ComingSoonCard({ app }) {
  const Icon = iconMap[app.id] || Zap

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
        <span className="cardCta secondary disabled">
          <Clock size={14} /> Coming Soon
        </span>
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
    // Open Kit form in new tab with pre-filled email (Kit doesn't support direct POST)
    const kitUrl = `${KIT_FORM_URL}?email_address=${encodeURIComponent(email)}&first_name=${encodeURIComponent(name)}`
    window.open(kitUrl, '_blank')
    setSubmitted(true)
    setError('')
  }

  if (submitted) {
    return (
      <div className="waitlistBox waitlistSuccess">
        <CheckCircle2 size={24} />
        <div>
          <h4>You're on the list!</h4>
          <p>We'll email you when these tools are ready.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="waitlistBox">
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
      {error && <div className="gateError">{error}</div>}
      <div className="finePrint">No spam. Unsubscribe anytime.</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('freeAppsUnlocked')
    if (stored === 'true') {
      setUnlocked(true)
    }
  }, [])

  const free = apps.filter((a) => a.tier === 'free')
  const paid = apps.filter((a) => a.tier === 'paid')
  const soon = apps.filter((a) => a.tier === 'soon')

  return (
    <div className="bg">
      <header className="nav">
        <div className="brand">
          <div className="logo">
            <LayoutGrid size={18} />
          </div>
          <div className="brandText">
            <div className="brandName">Kendra Nix</div>
            <div className="brandSub">Apps</div>
          </div>
        </div>

        <div className="navActions">
          <a className="ghost" href="#apps">
            Browse Apps
          </a>
          <a className="primary" href="#get-started">
            Get Started <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <main className="wrap">
        {/* ── HERO ── */}
        <section className="hero">
          <div className="heroLeft">
            <div className="pill">
              <Lock size={14} />
              <span>Private, practical, and built for real life</span>
            </div>

            <h1 className="headline">
              Your tools for clarity, confidence, and better decisions —
              <span className="accent"> all in one place</span>.
            </h1>

            <p className="subhead">
              A growing ecosystem of apps that turn overwhelm into a plan — from free productivity
              tools to mom-friendly systems that help you move.
            </p>

            <div className="ctaRow" id="get-started">
              <a className="primary big" href="#apps">
                Explore the Apps <ArrowRight size={16} />
              </a>
              <a className="secondary big" href="#coming-soon">
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
                  <div className="miniIcon"><Shield size={16} /></div>
                  <div className="miniText">
                    <div className="miniHead">Better protection</div>
                    <div className="miniSub">Know what's covered</div>
                  </div>
                </div>
                <div className="mini">
                  <div className="miniIcon"><FileText size={16} /></div>
                  <div className="miniText">
                    <div className="miniHead">Cleaner docs</div>
                    <div className="miniSub">Organize in minutes</div>
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

            {!unlocked && <EmailGateBox onUnlock={() => setUnlocked(true)} />}

            <div className="cards">
              {free.map((app) => (
                <AppCard key={app.id} app={app} locked={!unlocked} />
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
              <div className="cards">
                {paid.map((app) => (
                  <AppCard key={app.id} app={app} />
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

          <div className="cards">
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
            <a href="#coming-soon">Waitlist</a>
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
