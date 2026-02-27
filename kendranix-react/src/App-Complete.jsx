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
} from 'lucide-react'

const apps = [
  {
    name: 'Policy Help Desk',
    desc: 'Understand your policy. Protect your home.',
    status: 'Live',
    icon: FileText,
    cta: 'Open',
    href: '#',
    bullets: ['Plain-English summaries', 'Coverage & exclusions', 'Claim-ready notes'],
  },
  {
    name: 'Claim Coach',
    desc: 'Step-by-step guidance for smarter claims.',
    status: 'Coming Soon',
    icon: Shield,
    cta: 'Join Waitlist',
    href: '#',
    bullets: ['Upload docs & organize', 'Timeline + next actions', 'Negotiation prep'],
  },
  {
    name: 'Vision Activated',
    desc: 'Turn vision into action with systems that stick.',
    status: 'Coming Soon',
    icon: Sparkles,
    cta: 'Preview',
    href: '#',
    bullets: ['Quarterly focus boards', 'Action plan generator', 'Progress rituals'],
  },
]

export default function App() {
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
              A growing ecosystem of apps that turn overwhelm into a plan — from insurance policy clarity to
              mom-friendly systems that help you move.
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
                  <div className="miniIcon">
                    <Zap size={16} />
                  </div>
                  <div className="miniText">
                    <div className="miniHead">Fast clarity</div>
                    <div className="miniSub">Less Googling, more doing</div>
                  </div>
                </div>

                <div className="mini">
                  <div className="miniIcon">
                    <Shield size={16} />
                  </div>
                  <div className="miniText">
                    <div className="miniHead">Better protection</div>
                    <div className="miniSub">Know what’s covered</div>
                  </div>
                </div>

                <div className="mini">
                  <div className="miniIcon">
                    <FileText size={16} />
                  </div>
                  <div className="miniText">
                    <div className="miniHead">Cleaner docs</div>
                    <div className="miniSub">Organize in minutes</div>
                  </div>
                </div>

                <div className="mini">
                  <div className="miniIcon">
                    <Sparkles size={16} />
                  </div>
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
                <div className="tinyNote">New tools drop as they’re ready.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="apps">
          <div className="sectionHead">
            <h2>Apps</h2>
            <p>Pick a tool, get a plan, move forward.</p>
          </div>

          <div className="cards">
            import { apps } from "./appData";

function Section({ title, tier }) {
  const filtered = apps.filter(app => app.tier === tier);

  if (filtered.length === 0) return null;

  return (
    <div style={{ marginBottom: "3rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>{title}</h2>

      <div style={{ display: "grid", gap: "1rem" }}>
        {filtered.map((app, index) => (
          <div
            key={index}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px"
            }}
          >
            <h3>{app.name}</h3>
            <p>{app.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppComplete() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Kendra Nix App Store</h1>

      <Section title="Free Apps" tier="free" />
      <Section title="Paid Apps" tier="paid" />
      <Section title="Coming Soon" tier="soon" />
    </div>
  );
}
              const Icon = a.icon
              const isLive = a.status.toLowerCase() === 'live'
              return (
                <div className="card" key={a.name}>
                  <div className="cardTop">
                    <div className="cardIcon">
                      <Icon size={18} />
                    </div>
                    <span className={`badge ${isLive ? 'live' : 'soon'}`}>{a.status}</span>
                  </div>

                  <div className="cardBody">
                    <div className="cardTitle">{a.name}</div>
                    <div className="cardDesc">{a.desc}</div>

                    <ul className="bullets">
                      {a.bullets.map((b) => (
                        <li key={b}>
                          <CheckCircle2 size={16} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="cardFooter">
                    <a className={`cardCta ${isLive ? 'primary' : 'secondary'}`} href={a.href}>
                      {a.cta} <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="section" id="newsletter">
          <div className="ctaPanel">
            <div className="ctaCopy">
              <h3>Get notified when new apps go live</h3>
              <p>
                Drop your email and I’ll send updates when tools ship (no spam, just releases and helpful
                resources).
              </p>
            </div>

            <form className="ctaForm" onSubmit={(e) => e.preventDefault()}>
              <input className="input" type="email" placeholder="you@email.com" />
              <button className="primary big" type="submit">
                Notify me <ArrowRight size={16} />
              </button>
            </form>

            <div className="finePrint">You can unsubscribe anytime.</div>
          </div>
        </section>

        <footer className="footer">
          <div>© {new Date().getFullYear()} Kendra Nix</div>
          <div className="footerLinks">
            <a href="#apps">Apps</a>
            <span>•</span>
            <a href="#newsletter">Updates</a>
          </div>
        </footer>
      </main>
    </div>
  )
}