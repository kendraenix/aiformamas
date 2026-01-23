import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [hours, setHours] = useState('');
  const [strategicValue, setStrategicValue] = useState('');
  const [weeklyLoss, setWeeklyLoss] = useState(0);
  const [monthlyLoss, setMonthlyLoss] = useState(0);
  const [annualLoss, setAnnualLoss] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (hours && strategicValue && parseFloat(hours) > 0 && parseFloat(strategicValue) > 0) {
      const hoursNum = parseFloat(hours);
      const strategicValueNum = parseFloat(strategicValue);
      const operationalValue = 20;

      const weekly = hoursNum * (strategicValueNum - operationalValue);
      const monthly = weekly * 4;
      const annual = weekly * 52;

      setWeeklyLoss(weekly);
      setMonthlyLoss(monthly);
      setAnnualLoss(annual);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [hours, strategicValue]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleHoursChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setHours(value);
    }
  };

  const handleStrategicValueChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setStrategicValue(value);
    }
  };

  const shareText = `I just calculated my opportunity cost with the Mom Math Calculator. I'm losing ${formatCurrency(annualLoss)} per year doing $20/hour work! Time to reclaim my strategic time. Check it out:`;
  const shareUrl = window.location.href;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="App">
      {/* Hero Section */}
      <section className="hero">
        <h1>Mom Math Calculator</h1>
        <p>Calculate the real cost of doing $20/hour work</p>
      </section>

      {/* Calculator Card */}
      <div className="calculator-container">
        <div className="calculator-card">
          <div className="input-group">
            <label htmlFor="hours">Hours per week on operational work</label>
            <div className="input-wrapper">
              <input
                type="number"
                id="hours"
                value={hours}
                onChange={handleHoursChange}
                placeholder="15"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="strategicValue">Your strategic hourly value</label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="strategicValue"
                value={strategicValue}
                onChange={handleStrategicValueChange}
                placeholder="500"
                min="0"
                step="50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <section className="results-section">
          <h2>Your Opportunity Cost</h2>

          <div className="results-grid">
            <div className="result-card">
              <h3>Weekly Loss</h3>
              <div className="amount">{formatCurrency(weeklyLoss)}</div>
            </div>

            <div className="result-card">
              <h3>Monthly Loss</h3>
              <div className="amount">{formatCurrency(monthlyLoss)}</div>
            </div>

            <div className="result-card annual">
              <h3>Annual Loss</h3>
              <div className="amount">{formatCurrency(annualLoss)}</div>
            </div>
          </div>

          <p className="comparison-text">
            You're doing $20/hour work when you could be doing ${strategicValue}/hour strategy
          </p>

          <div className="mom-math-text">
            <p>
              <strong>You're not tired because you work too much.</strong> You're tired because you're doing the wrong work.
            </p>
            <p>
              Stop trading your peace for pennies. Every hour you spend on operational tasks is an hour you're not spending on building, strategizing, or scaling your empire.
            </p>
            <p>
              The math doesn't lie. And your future self is counting on you to make the right choice today.
            </p>
          </div>

          <div className="divider"></div>

          {/* Social Share Section */}
          <div className="social-share">
            <h3>Share Your Results</h3>
            <div className="social-buttons">
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn twitter"
              >
                🐦 Share on Twitter
              </a>
              <a
                href={linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn linkedin"
              >
                💼 Share on LinkedIn
              </a>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Reclaim Your Time?</h2>
        <div className="cta-buttons">
          <a
            href="https://kendranix.com/services"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary fuchsia"
          >
            Book a Strategy Call →
          </a>
          <a
            href="https://kendranix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Learn More
          </a>
        </div>
      </section>
    </div>
  );
}

export default App;
