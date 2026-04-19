import { useState } from "react";
import { useNotify } from "../components/NotificationSystem";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { formatPKR } from "../utils/currency";

const API = import.meta.env.VITE_API_URL || "https://kind-acceptance-production-393e.up.railway.app/";

function AnimatedStat({ label, value }) {
  const n = useAnimatedNumber(Math.round(value));
  return (
    <div className="emi-result-card">
      <div className="emi-result-label">{label}</div>
      <div className="emi-result-value">{formatPKR(n)}</div>
    </div>
  );
}

export default function CalculatorPage() {
  const [inputs, setInputs] = useState({ principal: "", annualRate: "", months: "" });
  const [result, setResult] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [busy, setBusy] = useState(false);
  const { notify } = useNotify();

  function setInput(key, val) {
    setInputs((f) => ({ ...f, [key]: val }));
  }

  async function runCalculation() {
    const { principal, annualRate, months } = inputs;
    if (!principal || !annualRate || !months) return notify("All three fields are required", "error");

    setBusy(true);
    try {
      const url = `${API}/api/emi-calculator?principal=${principal}&annualRate=${annualRate}&months=${months}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) return notify(data.error, "error");
      setResult(data);

      // Build amortisation schedule client-side
      const r = parseFloat(annualRate) / 100 / 12;
      const emi = data.emi;
      let balance = parseFloat(principal);
      const rows = [];
      for (let m = 1; m <= parseInt(months); m++) {
        const interest = parseFloat((balance * r).toFixed(2));
        const principalPart = parseFloat((emi - interest).toFixed(2));
        balance = parseFloat((balance - principalPart).toFixed(2));
        rows.push({ month: m, principal: principalPart, interest, balance: Math.max(0, balance) });
      }
      setSchedule(rows);
      notify("Calculation complete", "success");
    } catch {
      notify("Calculation failed", "error");
    } finally {
      setBusy(false);
    }
  }

  const principalPct = result
    ? ((parseFloat(inputs.principal) / result.totalPayable) * 100).toFixed(1)
    : 0;

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">EMI Calculator</h1>
          <p className="section-desc">Plan your loan repayments with full amortisation breakdown</p>
        </div>
      </div>

      {/* Input card */}
      <div className="glass-card" style={{ marginBottom: 24 }}>
        <div className="emi-input-grid">
          <InputField label="Principal (PKR)" id="principal" value={inputs.principal} onChange={(v) => setInput("principal", v)} placeholder="e.g. 500000" />
          <InputField label="Annual Interest Rate (%)" id="rate" value={inputs.annualRate} onChange={(v) => setInput("annualRate", v)} placeholder="e.g. 12" />
          <InputField label="Tenure (months)" id="months" value={inputs.months} onChange={(v) => setInput("months", v)} placeholder="e.g. 24" />
        </div>
        <button
          className="btn btn-amber"
          onClick={runCalculation}
          disabled={busy}
          style={{ minWidth: 180 }}
        >
          {busy ? "Calculating..." : "Calculate EMI →"}
        </button>
      </div>

      {result && (
        <>
          {/* Result cards */}
          <div className="emi-result-grid">
            <AnimatedStat label="Monthly EMI" value={result.emi} />
            <AnimatedStat label="Total Payable" value={result.totalPayable} />
            <AnimatedStat label="Total Interest" value={result.totalInterest} />
          </div>

          {/* Breakdown bar */}
          <div className="glass-card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-2)", marginBottom: 12 }}>
              Principal vs Interest Breakdown
            </div>
            <div className="breakdown-wrap">
              <div className="breakdown-track">
                <div className="breakdown-bar-p" style={{ width: `${principalPct}%` }}>
                  {principalPct > 12 ? `Principal ${principalPct}%` : ""}
                </div>
                <div className="breakdown-bar-i" style={{ width: `${100 - parseFloat(principalPct)}%` }}>
                  {(100 - parseFloat(principalPct)) > 12 ? `Interest ${(100 - parseFloat(principalPct)).toFixed(1)}%` : ""}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-2)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--amber)", display: "inline-block" }} />
                Principal: {formatPKR(parseFloat(inputs.principal))} ({principalPct}%)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-2)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--rose)", display: "inline-block" }} />
                Interest: {formatPKR(result.totalInterest)} ({(100 - parseFloat(principalPct)).toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Amortisation schedule */}
          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>Monthly Schedule</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: 3 }}>{schedule.length} payments</div>
            </div>
            <div className="table-wrap">
              <table className="amort-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Principal (PKR)</th>
                    <th>Interest (PKR)</th>
                    <th>Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.month} className="amort-row" style={{ animationDelay: `${row.month * 15}ms` }}>
                      <td style={{ color: "var(--text-3)" }}>{row.month}</td>
                      <td style={{ color: "var(--emerald)" }}>{formatPKR(row.principal)}</td>
                      <td style={{ color: "var(--rose)" }}>{formatPKR(row.interest)}</td>
                      <td style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{formatPKR(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InputField({ label, id, value, onChange, placeholder }) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
