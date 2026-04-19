import { useState, useEffect } from "react";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { useNotify } from "../components/NotificationSystem";
import { formatPKR } from "../utils/currency";

const API = import.meta.env.VITE_API_URL || "https://kind-acceptance-production-393e.up.railway.app/";

export default function OverviewPage() {
  const [wallet, setWallet] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [loading, setLoading] = useState(true);
  const [heroPulse, setHeroPulse] = useState("");
  const { notify } = useNotify();

  const animatedBalance = useAnimatedNumber(wallet?.balance || 0);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/wallet`).then((r) => r.json()),
      fetch(`${API}/api/transactions`).then((r) => r.json()),
    ])
      .then(([w, txs]) => {
        setWallet(w);
        setRecentTx(txs.slice(0, 5));
      })
      .catch(() => notify("Failed to load account data", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeposit(e) {
    e.preventDefault();
    const amount = parseFloat(depositAmt);
    if (!amount || amount <= 0) return notify("Enter a valid amount", "error");
    try {
      const res = await fetch(`${API}/api/wallet/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) return notify(data.error, "error");
      setWallet(data.wallet);
      setRecentTx((prev) => [
        { id: Date.now(), type: "credit", amount, description: `Deposit of PKR ${amount}`, timestamp: new Date().toISOString() },
        ...prev.slice(0, 4),
      ]);
      setDepositAmt("");
      triggerPulse("pulse-up");
      notify(`${formatPKR(amount)} deposited successfully`, "success");
    } catch {
      notify("Deposit failed", "error");
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    const amount = parseFloat(withdrawAmt);
    if (!amount || amount <= 0) return notify("Enter a valid amount", "error");
    try {
      const res = await fetch(`${API}/api/wallet/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerPulse("shake-err");
        return notify(data.error, "error");
      }
      setWallet(data.wallet);
      setRecentTx((prev) => [
        { id: Date.now(), type: "debit", amount, description: `Withdrawal of PKR ${amount}`, timestamp: new Date().toISOString() },
        ...prev.slice(0, 4),
      ]);
      setWithdrawAmt("");
      triggerPulse("pulse-down");
      notify(`${formatPKR(amount)} withdrawn successfully`, "success");
    } catch {
      notify("Withdrawal failed", "error");
    }
  }

  function triggerPulse(cls) {
    setHeroPulse(cls);
    setTimeout(() => setHeroPulse(""), 700);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="skel skel-hero" />
        <div className="skel skel-row" />
        <div className="skel skel-row" />
        <div className="skel skel-row" />
      </div>
    );
  }

  return (
    <div className="page">
      {/* Hero balance card */}
      <div className={`balance-hero ${heroPulse}`}>
        <div className="balance-meta">
          <span className="balance-tag">⬡ Live Balance</span>
          <span className="balance-owner-chip">{wallet?.owner} · {wallet?.currency}</span>
        </div>
        <div className="balance-figure">{formatPKR(animatedBalance)}</div>
        <div className="balance-sub">Available funds · Updated just now</div>
      </div>

      {/* Action panels */}
      <div className="action-grid">
        <form className="action-panel" onSubmit={handleDeposit}>
          <div className="action-panel-header">
            <div className="action-icon deposit">↑</div>
            <span className="action-panel-title">Add Funds</span>
          </div>
          <div className="float-field">
            <input
              type="number"
              placeholder="Amount"
              value={depositAmt}
              onChange={(e) => setDepositAmt(e.target.value)}
              min="1"
            />
            <label>Amount (PKR)</label>
          </div>
          <button type="submit" className="btn btn-emerald btn-full">Deposit →</button>
        </form>

        <form className="action-panel" onSubmit={handleWithdraw}>
          <div className="action-panel-header">
            <div className="action-icon withdraw">↓</div>
            <span className="action-panel-title">Withdraw Funds</span>
          </div>
          <div className="float-field">
            <input
              type="number"
              placeholder="Amount"
              value={withdrawAmt}
              onChange={(e) => setWithdrawAmt(e.target.value)}
              min="1"
            />
            <label>Amount (PKR)</label>
          </div>
          <button type="submit" className="btn btn-rose btn-full">Withdraw →</button>
        </form>
      </div>

      {/* Recent transactions */}
      {recentTx.length > 0 && (
        <div className="glass-card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-title" style={{ fontSize: "1rem" }}>Recent Activity</div>
            </div>
            <a href="/history" style={{ fontSize: "0.8rem", color: "var(--amber)", textDecoration: "none" }}>View all →</a>
          </div>
          <table className="tx-table">
            <tbody>
              {recentTx.map((tx, i) => (
                <tr key={tx.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <td>
                    <div className="tx-desc-cell">
                      <div className={`tx-icon-wrap ${tx.type}`}>
                        {tx.type === "credit" ? "↑" : "↓"}
                      </div>
                      <div>
                        <div className="tx-desc-text">{tx.description}</div>
                        <div className="tx-time-text">{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={`tx-amount-text ${tx.type}`}>
                      {tx.type === "credit" ? "+" : "−"}{formatPKR(tx.amount)}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
