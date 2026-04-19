import { useState, useEffect } from "react";
import { formatPKR } from "../utils/currency";
import { useNotify } from "../components/NotificationSystem";

const API = import.meta.env.VITE_API_URL || "https://kind-acceptance-production-393e.up.railway.app/";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const { notify } = useNotify();

  useEffect(() => {
    fetch(`${API}/api/transactions`)
      .then((r) => r.json())
      .then(setTransactions)
      .catch(() => notify("Failed to load transaction history", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortOrder === "oldest") return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortOrder === "highest") return b.amount - a.amount;
      if (sortOrder === "lowest") return a.amount - b.amount;
      return 0;
    });

  const totalIn = filtered.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const net = totalIn - totalOut;

  if (loading) {
    return (
      <div className="page">
        {[...Array(6)].map((_, i) => <div key={i} className="skel skel-row" />)}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">Transaction History</h1>
          <p className="section-desc">{transactions.length} total records</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-tile">
          <div className="stat-tile-label">Total In</div>
          <div className="stat-tile-value success">{formatPKR(totalIn)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Total Out</div>
          <div className="stat-tile-value danger">{formatPKR(totalOut)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Net Flow</div>
          <div className={`stat-tile-value ${net >= 0 ? "success" : "danger"}`}>{formatPKR(net)}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="tx-controls">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {["all", "credit", "debit"].map((f) => (
            <button
              key={f}
              className={`filter-tab${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="sort-select-wrap">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">↕</div>
            <div className="empty-state-text">No transactions match your filters</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr key={tx.id} style={{ animationDelay: `${i * 40}ms` }}>
                    <td>
                      <div className="tx-desc-cell">
                        <div className={`tx-icon-wrap ${tx.type}`}>
                          {tx.type === "credit" ? "↑" : "↓"}
                        </div>
                        <div className="tx-desc-text">{tx.description}</div>
                      </div>
                    </td>
                    <td>
                      <div className="tx-time-text" style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`tx-amount-text ${tx.type}`}>
                        {tx.type === "credit" ? "+" : "−"}{formatPKR(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
