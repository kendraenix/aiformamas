import React, { useEffect, useRef, useState } from 'react'
import {
  Calculator,
  Clock,
  FileText,
  Workflow,
  BarChart3,
  Layers,
  ArrowRight,
  Check,
  Lock,
  Linkedin,
  Instagram
} from 'lucide-react'

// =================== STYLES ===================
const styles = {
  // CSS Variables as JS object
  colors: {
    fuchsia: '#D91E6B',
    fuchsiaLight: 'rgba(217, 30, 107, 0.1)',
    fuchsiaGlow: 'rgba(217, 30, 107, 0.15)',
    navy: '#3B4A6B',
    deepNavy: '#0F1E3E',
    gold: '#D4AF37',
    teal: '#4DA6A0',
    tealLight: 'rgba(77, 166, 160, 0.05)',
    white: '#FFFFFF',
    warmWhite: '#F8F7F4',
    charcoal: '#2D2D3A',
  },
}

// Global styles injected via useEffect
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 18px;
    font-weight: 400;
    line-height: 1.7;
    color: #2D2D3A;
    background: #F8F7F4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  /* Responsive overrides via CSS */
  @media (max-width: 1199px) {
    .hero-visual-desktop { display: none !important; }
  }

  @media (max-width: 768px) {
    body { font-size: 16px; }
  }
`

// =================== HOOKS ===================
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    }, { threshold: 0.2, ...options })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return [ref, isVisible]
}

function useCountUp(target, isVisible, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const startTime = performance.now()

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - (1 - progress) * (1 - progress)
      const current = Math.floor(easeProgress * target)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(updateCount)
  }, [isVisible, target, duration])

  return count
}

// =================== COMPONENTS ===================

function Hero() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1199px)')

  return (
    <section style={{
      minHeight: isMobile ? 'auto' : '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '80px 24px' : isTablet ? '80px 40px' : '120px 80px',
      background: styles.colors.warmWhite,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '80%',
        height: '150%',
        background: 'radial-gradient(circle, rgba(217, 30, 107, 0.02) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1.5fr 1fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', zIndex: 2, textAlign: isMobile ? 'center' : 'left' }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: styles.colors.teal,
            marginBottom: '16px',
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.1s',
            opacity: 0,
          }}>
            BUSINESS OPERATIONS TOOLS
          </p>

          <h1 style={{
            fontSize: isMobile ? '42px' : isTablet ? '56px' : '72px',
            fontWeight: 800,
            lineHeight: 1.1,
            color: styles.colors.navy,
            marginBottom: '24px',
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.2s',
            opacity: 0,
          }}>
            Stop Guessing.<br />
            Start Using Tools<br />
            <span style={{ color: styles.colors.fuchsia }}>That Actually Work.</span>
          </h1>

          <p style={{
            fontSize: isMobile ? '18px' : '20px',
            color: styles.colors.charcoal,
            maxWidth: '500px',
            marginBottom: '32px',
            lineHeight: 1.6,
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.3s',
            opacity: 0,
            ...(isMobile && { marginLeft: 'auto', marginRight: 'auto' }),
          }}>
            AI-powered operations tools for $100K+ mompreneurs. No fluff. No theory. Just tested tools that reclaim your time and scale your business.
          </p>

          <div style={{
            marginBottom: '24px',
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.4s',
            opacity: 0,
          }}>
            <a
              href="#tools"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: styles.colors.fuchsia,
                color: styles.colors.white,
                fontSize: '18px',
                fontWeight: 600,
                padding: '16px 32px',
                borderRadius: '50px',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 30, 107, 0.15)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Browse Free Tools <span>↓</span>
            </a>
          </div>

          <p style={{
            fontSize: '16px',
            color: styles.colors.navy,
            opacity: 0.6,
            animation: 'fadeInUp 0.8s ease-out forwards',
            animationDelay: '0.5s',
          }}>
            Used by 500+ mompreneurs • $31K average opportunity cost saved
          </p>
        </div>

        {!isTablet && <div style={{
          position: 'relative',
          height: '500px',
        }}>
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: styles.colors.fuchsia,
            opacity: 0.1,
            filter: 'blur(40px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 4s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: styles.colors.teal,
            opacity: 0.15,
            filter: 'blur(30px)',
            top: '30%',
            left: '30%',
            animation: 'pulse 4s ease-in-out infinite 0.5s',
          }} />
          <div style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: styles.colors.gold,
            opacity: 0.1,
            filter: 'blur(35px)',
            bottom: '20%',
            right: '20%',
            animation: 'pulse 4s ease-in-out infinite 1s',
          }} />
        </div>}
      </div>
    </section>
  )
}

function ToolCard({ icon: Icon, title, description, meta, link, linkText, badge, badgeType, comingSoon, size, delay = 0 }) {
  const [ref, isVisible] = useIntersectionObserver()
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1199px)')

  const gridColumn = isMobile ? 'span 12' : isTablet ? 'span 6' : {
    featured: 'span 8',
    medium: 'span 4',
    half: 'span 6',
  }[size] || 'span 6'

  const iconBg = {
    fuchsia: styles.colors.fuchsia,
    teal: styles.colors.teal,
    navy: styles.colors.navy,
  }

  return (
    <div
      ref={ref}
      style={{
        gridColumn,
        background: styles.colors.white,
        border: `2px solid ${isHovered ? styles.colors.fuchsia : styles.colors.teal}`,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: isHovered ? '0 8px 24px rgba(217, 30, 107, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        position: 'relative',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        ...(comingSoon && { opacity: isVisible ? 0.8 : 0 }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {comingSoon && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.5)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: iconBg[badge === 'MOST POPULAR' ? 'fuchsia' : 'teal'] || styles.colors.teal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        color: styles.colors.white,
      }}>
        <Icon size={28} />
      </div>

      {badge && (
        <span style={{
          display: 'inline-block',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '6px 12px',
          borderRadius: '20px',
          marginBottom: '12px',
          background: badgeType === 'coming' ? styles.colors.gold : styles.colors.fuchsia,
          color: badgeType === 'coming' ? styles.colors.deepNavy : styles.colors.white,
        }}>
          {badge}
        </span>
      )}

      <h3 style={{
        fontSize: '28px',
        fontWeight: 600,
        lineHeight: 1.3,
        color: styles.colors.navy,
        marginBottom: '12px',
      }}>
        {title}
      </h3>

      <p style={{
        color: styles.colors.charcoal,
        marginBottom: '16px',
        lineHeight: 1.6,
      }}>
        {description}
      </p>

      <p style={{
        fontSize: '16px',
        color: styles.colors.navy,
        opacity: 0.7,
        marginBottom: '20px',
      }}>
        {meta}
      </p>

      <a
        href={link || '#'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: isHovered ? '12px' : '8px',
          color: styles.colors.fuchsia,
          fontWeight: 600,
          fontSize: '16px',
          transition: 'gap 0.2s ease',
          ...(comingSoon && { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }),
        }}
      >
        {linkText} <ArrowRight size={18} />
      </a>
    </div>
  )
}

function ToolsSection() {
  const [ref, isVisible] = useIntersectionObserver()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const tools = [
    {
      icon: Calculator,
      title: 'Mom Math Calculator',
      description: 'Calculate the exact cost of doing $20/hour work when you should be doing $500/hour strategy.',
      meta: '2 min • See your $31K+ loss',
      link: '/calculator/',
      linkText: 'Calculate Your Cost',
      badge: 'MOST POPULAR',
      size: 'featured',
    },
    {
      icon: Clock,
      title: '15-Hour Work Week Audit',
      description: 'Discover which tasks are stealing your time and which ones actually move the needle.',
      meta: '5 min • Time analysis',
      link: '/audit/',
      linkText: 'Take the Audit',
      size: 'medium',
    },
    {
      icon: FileText,
      title: 'SOP Builder',
      description: 'Create professional standard operating procedures that make delegation effortless.',
      meta: '10 min • Export to PDF/Word',
      link: '/sop-builder/',
      linkText: 'Build Your SOPs',
      size: 'half',
    },
    {
      icon: Workflow,
      title: 'Workflow Mapper',
      description: 'Visualize your business processes and identify bottlenecks holding you back.',
      meta: '15 min • Visual diagrams',
      link: '/workflow-mapper/',
      linkText: 'Map Your Workflow',
      size: 'half',
    },
    {
      icon: BarChart3,
      title: 'Time Audit Tracker',
      description: 'Track where your hours actually go for a week and get actionable insights.',
      meta: 'Ongoing • Weekly tracking',
      link: '/tracker/',
      linkText: 'Start Tracking',
      size: 'medium',
    },
    {
      icon: Layers,
      title: 'Tech Stack Audit',
      description: 'Analyze your current tools and get AI-powered recommendations to optimize your tech stack for maximum efficiency.',
      meta: 'Coming Q1 2026',
      link: null,
      linkText: 'Get Notified',
      badge: 'COMING SOON',
      badgeType: 'coming',
      comingSoon: true,
      size: 'featured',
    },
  ]

  return (
    <section id="tools" style={{
      background: styles.colors.white,
      padding: isMobile ? '60px 24px' : '120px 80px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div
          ref={ref}
          style={{
            marginBottom: '64px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <h2 style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: styles.colors.navy,
            marginBottom: '16px',
          }}>
            Free Operations Tools
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '20px',
            color: styles.colors.charcoal,
            maxWidth: '600px',
          }}>
            Start here. These tools help you understand where your time is going and what it's costing you.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
        }}>
          {tools.map((tool, index) => (
            <ToolCard key={tool.title} {...tool} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ number, suffix = '', prefix = '', label, format, isMobile = false }) {
  const [ref, isVisible] = useIntersectionObserver()
  const count = useCountUp(number, isVisible)

  const displayValue = format === 'currency'
    ? count.toLocaleString()
    : count

  return (
    <div
      ref={ref}
      style={{
        textAlign: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease-out',
      }}
    >
      <p style={{
        fontSize: isMobile ? '56px' : '72px',
        fontWeight: 800,
        color: styles.colors.gold,
        lineHeight: 1,
        letterSpacing: '-2px',
        marginBottom: '8px',
      }}>
        {prefix}{displayValue}{number === count && number === 500 ? '+' : ''}{suffix}
      </p>
      <p style={{
        fontSize: '18px',
        color: styles.colors.white,
        opacity: 0.8,
      }}>
        {label}
      </p>
    </div>
  )
}

function StatsSection() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <section style={{
      background: styles.colors.deepNavy,
      padding: '80px 0',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '0 24px' : '0 80px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '48px',
      }}>
        <StatItem number={500} label="Mompreneurs Using Tools" isMobile={isMobile} />
        <StatItem number={15} suffix=" hrs/week" label="Average Time Reclaimed" isMobile={isMobile} />
        <StatItem number={31200} prefix="$" format="currency" label="Avg Opportunity Cost Saved" isMobile={isMobile} />
      </div>
    </section>
  )
}

function Step({ number, title, description, colorClass, delay, isMobile = false }) {
  const [ref, isVisible] = useIntersectionObserver()

  const bgColor = {
    1: styles.colors.fuchsia,
    2: styles.colors.teal,
    3: styles.colors.navy,
  }[number]

  const shadowColor = {
    1: 'rgba(217, 30, 107, 0.3)',
    2: 'rgba(77, 166, 160, 0.3)',
    3: 'rgba(59, 74, 107, 0.3)',
  }[number]

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        flex: isMobile ? 'none' : 1,
        position: 'relative',
        zIndex: 2,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease-out',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div style={{
        width: isMobile ? '80px' : '120px',
        height: isMobile ? '80px' : '120px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
        background: bgColor,
        color: styles.colors.white,
        fontSize: isMobile ? '32px' : '48px',
        fontWeight: 800,
        boxShadow: `0 8px 24px ${shadowColor}`,
      }}>
        {number}
      </div>
      <h4 style={{
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: 1.3,
        color: styles.colors.navy,
        marginBottom: '12px',
      }}>
        {title}
      </h4>
      <p style={{
        maxWidth: '240px',
        color: styles.colors.charcoal,
      }}>
        {description}
      </p>
    </div>
  )
}

function HowSection() {
  const [ref, isVisible] = useIntersectionObserver()
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <section id="how" style={{
      background: styles.colors.warmWhite,
      padding: isMobile ? '60px 24px' : '120px 80px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          ref={ref}
          style={{
            fontSize: isMobile ? '36px' : '56px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: styles.colors.navy,
            textAlign: 'center',
            marginBottom: isMobile ? '48px' : '80px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          How This Works
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'flex-start',
          position: 'relative',
          gap: isMobile ? '48px' : '0',
        }}>
          {!isMobile && <div style={{
            position: 'absolute',
            top: '60px',
            left: '15%',
            right: '15%',
            height: '2px',
            background: styles.colors.gold,
            zIndex: 1,
          }} />}

          <Step number={1} title="Pick Your Tool" description="Choose based on what you need most right now" delay={0} isMobile={isMobile} />
          <Step number={2} title="Use The Tool" description="Follow the guided prompts and input your data" delay={200} isMobile={isMobile} />
          <Step number={3} title="Get Results" description="Receive actionable insights and next steps" delay={400} isMobile={isMobile} />
        </div>
      </div>
    </section>
  )
}

function DifferentSection() {
  const [ref, isVisible] = useIntersectionObserver()
  const [quoteRef, quoteVisible] = useIntersectionObserver()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1199px)')

  const checklistItems = [
    'Built by a Fractional Chief of Staff with Fortune 500 operations experience',
    'Every tool shows exact ROI and time savings (not vague "productivity tips")',
    'Tested on real $100K+ businesses, not theory',
    'No fluff, no filler—just what actually works',
    'Mom Math framework built into every tool',
  ]

  return (
    <section id="different" style={{
      background: styles.colors.white,
      padding: isMobile ? '60px 24px' : '120px 80px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1.5fr 1fr',
        gap: isMobile ? '48px' : '80px',
        alignItems: 'center',
      }}>
        <div
          ref={ref}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <h2 style={{
            fontSize: isMobile ? '36px' : '48px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: styles.colors.navy,
            marginBottom: '40px',
          }}>
            What Makes These Tools Different
          </h2>

          <ul style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            {checklistItems.map((item, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  minWidth: '28px',
                  background: styles.colors.teal,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: styles.colors.white,
                  marginTop: '2px',
                }}>
                  <Check size={16} />
                </span>
                <p style={{ lineHeight: 1.7 }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={quoteRef}
          style={{
            background: styles.colors.tealLight,
            borderLeft: `4px solid ${styles.colors.gold}`,
            padding: isMobile ? '24px' : '40px',
            borderRadius: '0 16px 16px 0',
            opacity: quoteVisible ? 1 : 0,
            transform: quoteVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <p style={{
            fontSize: isMobile ? '20px' : '24px',
            fontStyle: 'italic',
            color: styles.colors.navy,
            marginBottom: '16px',
            lineHeight: 1.4,
          }}>
            "These tools show me exactly where my money is going. Game changer."
          </p>
          <p style={{
            fontSize: '16px',
            color: styles.colors.charcoal,
          }}>
            — Sarah M., $180K/year
          </p>
        </div>
      </div>
    </section>
  )
}

function LockedCard({ title, description, delay }) {
  const [ref, isVisible] = useIntersectionObserver()

  return (
    <div
      ref={ref}
      style={{
        background: styles.colors.white,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        filter: 'grayscale(0.5)',
        transition: 'all 0.3s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => e.currentTarget.style.filter = 'grayscale(0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.filter = 'grayscale(0.5)'}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: styles.colors.gold,
      }}>
        <Lock size={40} />
      </div>

      <span style={{
        display: 'inline-block',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        padding: '6px 12px',
        borderRadius: '20px',
        marginBottom: '12px',
        background: styles.colors.gold,
        color: styles.colors.deepNavy,
      }}>
        COURSE EXCLUSIVE
      </span>

      <h3 style={{
        fontSize: '22px',
        fontWeight: 600,
        lineHeight: 1.3,
        color: styles.colors.navy,
        marginBottom: '8px',
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: '16px',
        color: styles.colors.charcoal,
        opacity: 0.8,
      }}>
        {description}
      </p>
    </div>
  )
}

function CourseSection() {
  const [ref, isVisible] = useIntersectionObserver()
  const [ctaRef, ctaVisible] = useIntersectionObserver()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1199px)')

  const lockedTools = [
    { title: 'Client Onboarding Builder', description: 'Create seamless client experiences from first contact to kickoff' },
    { title: 'Content Repurposing System', description: 'Turn one piece of content into 10+ without extra work' },
    { title: 'Revenue Operations Dashboard', description: 'Track your numbers that matter with automated reporting' },
    { title: 'AI Prompt Library', description: '500+ tested prompts for every business operation' },
    { title: 'Delegation Framework', description: 'Know exactly what to delegate and how to train anyone' },
  ]

  return (
    <section id="course" style={{
      background: `linear-gradient(180deg, ${styles.colors.warmWhite} 0%, rgba(217, 30, 107, 0.02) 100%)`,
      padding: isMobile ? '60px 24px' : '120px 80px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div
          ref={ref}
          style={{
            marginBottom: '48px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <h2 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: styles.colors.navy,
            marginBottom: '16px',
          }}>
            Premium Tools Inside Automate & Elevate
          </h2>
          <p style={{
            fontSize: isMobile ? '18px' : '20px',
            color: styles.colors.charcoal,
            maxWidth: '600px',
          }}>
            These interactive tools are exclusively available to students of my 8-week operations course.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '24px',
          marginBottom: '48px',
        }}>
          {lockedTools.map((tool, index) => (
            <LockedCard key={tool.title} {...tool} delay={index * 100} />
          ))}
        </div>

        <div
          ref={ctaRef}
          style={{
            background: styles.colors.white,
            border: `2px solid ${styles.colors.fuchsia}`,
            borderRadius: '16px',
            padding: isMobile ? '32px 24px' : '48px',
            textAlign: 'center',
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <h3 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: styles.colors.navy,
            marginBottom: '20px',
          }}>
            Want access to all 5 tools?
          </h3>
          <a
            href="#"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: styles.colors.fuchsia,
              color: styles.colors.white,
              fontSize: '20px',
              fontWeight: 600,
              padding: '20px 40px',
              borderRadius: '50px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 30, 107, 0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Join Automate & Elevate Waitlist
          </a>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const [ref, isVisible] = useIntersectionObserver()
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <section id="cta" style={{
      background: styles.colors.fuchsia,
      padding: isMobile ? '60px 24px' : '120px 80px',
      textAlign: 'center',
    }}>
      <div
        ref={ref}
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.6s ease-out',
        }}
      >
        <h2 style={{
          fontSize: isMobile ? '36px' : '56px',
          fontWeight: 700,
          lineHeight: 1.2,
          color: styles.colors.white,
          marginBottom: '16px',
        }}>
          Ready to Reclaim Your Time?
        </h2>

        <p style={{
          fontSize: isMobile ? '18px' : '20px',
          color: styles.colors.white,
          opacity: 0.9,
          marginBottom: '32px',
        }}>
          Start with a free tool above, or go deeper:
        </p>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <a
            href="#tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: styles.colors.white,
              color: styles.colors.fuchsia,
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              padding: isMobile ? '16px 32px' : '20px 40px',
              borderRadius: '50px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Browse Tools <span>↑</span>
          </a>

          <a
            href="#"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              color: styles.colors.white,
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              padding: isMobile ? '16px 32px' : '20px 40px',
              borderRadius: '50px',
              border: `2px solid ${styles.colors.white}`,
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = styles.colors.white
              e.currentTarget.style.color = styles.colors.fuchsia
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = styles.colors.white
            }}
          >
            Book Strategy Call
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <footer style={{
      background: styles.colors.deepNavy,
      padding: isMobile ? '60px 24px 40px' : '80px 80px 40px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr',
          gap: isMobile ? '40px' : '60px',
          marginBottom: '60px',
        }}>
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: styles.colors.gold,
              marginBottom: '8px',
            }}>
              Kendra Nix
            </h3>
            <p style={{
              fontSize: '16px',
              color: styles.colors.white,
              opacity: 0.7,
              lineHeight: 1.5,
            }}>
              Fractional Chief of Staff &<br />AI Operations Architect
            </p>
          </div>

          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: styles.colors.white,
              marginBottom: '20px',
            }}>
              Quick Links
            </h4>
            {['Tools', 'Services', 'Course', 'Contact'].map((link) => (
              <a
                key={link}
                href={link === 'Tools' ? '#tools' : link === 'Course' ? '#course' : '#'}
                style={{
                  display: 'block',
                  fontSize: '16px',
                  color: styles.colors.white,
                  opacity: 0.8,
                  marginBottom: '12px',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = styles.colors.fuchsia
                  e.currentTarget.style.opacity = 1
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = styles.colors.white
                  e.currentTarget.style.opacity = 0.8
                }}
              >
                {link}
              </a>
            ))}
          </div>

          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: styles.colors.white,
              marginBottom: '20px',
            }}>
              Connect
            </h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Instagram, label: 'Instagram' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(77, 166, 160, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: styles.colors.teal,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = styles.colors.teal
                    e.currentTarget.style.color = styles.colors.white
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(77, 166, 160, 0.2)'
                    e.currentTarget.style.color = styles.colors.teal
                  }}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          paddingTop: '40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <p style={{
            fontSize: '14px',
            color: styles.colors.white,
            opacity: 0.5,
          }}>
            © 2026 Kendra Nix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// =================== MAIN APP ===================
export default function App() {
  useEffect(() => {
    // Inject global styles
    const styleEl = document.createElement('style')
    styleEl.textContent = globalStyles
    document.head.appendChild(styleEl)

    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])

  return (
    <>
      <Hero />
      <ToolsSection />
      <StatsSection />
      <HowSection />
      <DifferentSection />
      <CourseSection />
      <CTASection />
      <Footer />
    </>
  )
}
