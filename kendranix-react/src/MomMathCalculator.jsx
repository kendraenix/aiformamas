import { useState } from "react";

export default function MomMath() {
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");
  const [weeklyValue, setWeeklyValue] = useState(null);

  const calculate = () => {
    const value = Number(hours) * Number(rate);
    setWeeklyValue(value);
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: "auto" }}>
      <h1>Mom Math Calculator</h1>
      <p>Find out what your time is actually worth.</p>

      <input
        placeholder="Hours worked per week"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <input
        placeholder="Hourly rate ($)"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button onClick={calculate}>Calculate</button>

      {weeklyValue !== null && (
        <h2 style={{ marginTop: 20 }}>
          Weekly Value: ${weeklyValue}
        </h2>
      )}
    </div>
  );
}