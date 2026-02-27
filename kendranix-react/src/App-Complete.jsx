import './App-Complete.css'
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
  Brain,
  Mail,
} from 'lucide-react'
import { apps } from './appData.js'

// Map app IDs to icons
const iconMap = {
  'ai-for-mamas': Sparkles,
  'ai-literacy-lab': Brain,
  'fifteen-hour-audit': Clock,
  'mom-math-calculator': Calculator,
  'link-page-blueprint': Link,
  'policy-help-desk': FileText,
  'claim-coach': Shield,
}

const tierMeta = {
  free: { label: 'Free', badgeClass: 'live' },
  paid: { label: 'Paid', badgeClass: 'paid' },
  soon: { label: 'Coming Soon', badgeClass: 'soon' },
}

function AppCard({ app }) {
  const Icon = iconMap[app.id] || Zap
  const { label, badgeClass } = tierMeta[app.tier]
  const isSoon = app.tier === 'soon'

  return (
    <div className={`card ${isSoon ? 'cardSoon' : ''}`}>
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
        <a
          className={`cardCta ${isSoon ? 'secondary' : 'primary'}`}
          href={app.href}
          {...(app.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {app.cta} <ArrowRight size={16} />
        </a>
      </div>
    </div>
  )
}

function SectionBlock({ title, subtitle, items }) {
  if (items.length === 0) return null
  return (
    <section className="section">
      <div className="sectionHead">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="cards">
        {items.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  )
}

export default function App() {
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
              <a className="secondary big" href="#newsletter">
                Get updates
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
          <SectionBlock
            title="Free Apps"
            subtitle="Start here — no cost, no catch."
            items={free}
          />
          <SectionBlock
            title="Paid Apps"
            subtitle="Premium tools built for serious operators."
            items={paid}
          />
        </div>

        {/* ── EMAIL SIGNUP ── */}
        <section className="section" id="newsletter">
          <div className="ctaPanel signupPanel">
            <div className="signupIcon">
              <Mail size={22} />
            </div>
            <div className="ctaCopy">
              <h3>Join the Founder List</h3>
              <p>
                Get early access to new apps, exclusive resources, and updates — straight to your inbox.
              </p>
            </div>
            <a
              className="primary big signupBtn"
              href="https://app.kit.com/forms/9141530/subscriptions"
              target="_blank"
              rel="noreferrer"
            >
              Join the Founder List <ArrowRight size={16} />
            </a>
            <div className="finePrint">No spam. Unsubscribe anytime.</div>
          </div>
        </section>

        {/* ── COMING SOON ── */}
        <SectionBlock
          title="Coming Soon"
          subtitle="On the roadmap — join the waitlist to get notified first."
          items={soon}
        />

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div>© {new Date().getFullYear()} Kendra Nix</div>
          <div className="footerLinks">
            <a href="#apps">Apps</a>
            <span>•</span>
            <a href="#newsletter">Updates</a>
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
