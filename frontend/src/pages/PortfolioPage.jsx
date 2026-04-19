import { useState, useEffect } from "react";
import { useNotify } from "../components/NotificationSystem";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { formatPKR } from "../utils/currency";

const API = import.meta.env.VITE_API_URL || "https://kind-acceptance-production-393e.up.railway.app";

function CountBadge({ value, color }) {
  const n = useAnimatedNumber(value);
  return <span className="loan-stat-num" style={{ color }}>{n}</span>;
}

export default function PortfolioPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [updating, setUpdating] = useState(null);
  const { notify } = useNotify();

  useEffect(() => {
    fetch(`${API}/api/loans`)
      .then((r) => r.json())
      .then(setLoans)
      .catch(() => notify("Failed to load loan portfolio", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id, status) {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/loans/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) return notify(data.error, "error");
      setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      notify(`Loan #${id} marked as ${status}`, "success");
    } catch {
      notify("Update failed", "error");
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = loans.filter((l) => l.status === "pending").length;
  const approvedCount = loans.filter((l) => l.status === "approved").length;
  const rejectedCount = loans.filter((l) => l.status === "rejected").length;

  const displayed = [...loans]
    .filter((l) => filter === "all" || l.status === filter)
    .filter((l) => l.applicant.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "amount-high") return b.amount - a.amount;
      if (sortBy === "amount-low") return a.amount - b.amount;
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  if (loading) {
    return (
      <div className="page">
        <div className="skel skel-hero" />
        {[...Array(4)].map((_, i) => <div key={i} className="skel skel-row" />)}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">Loan Portfolio</h1>
          <p className="section-desc">{loans.length} total applications</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="loans-overview">
        <div className="loan-stat-card pending">
          <CountBadge value={pendingCount} color="var(--amber)" />
          <span className="loan-stat-label">Pending</span>
        </div>
        <div className="loan-stat-card approved">
          <CountBadge value={approvedCount} color="var(--emerald)" />
          <span className="loan-stat-label">Approved</span>
        </div>
        <div className="loan-stat-card rejected">
          <CountBadge value={rejectedCount} color="var(--rose)" />
          <span className="loan-stat-label">Rejected</span>
        </div>
      </div>

      {/* Controls */}
      <div className="tx-controls">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search by applicant name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {["all", "pending", "approved", "rejected"].map((f) => (
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
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default order</option>
            <option value="amount-high">Amount: High → Low</option>
            <option value="amount-low">Amount: Low → High</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⬡</div>
            <div className="empty-state-text">No loan applications found</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Purpose</th>
                  <th>Tenure</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((loan, i) => (
                  <tr key={loan.id} style={{ animationDelay: `${i * 40}ms` }}>
                    <td>
                      <div className="loan-applicant-cell">
                        <div className="applicant-avatar">
                          {loan.applicant.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="applicant-name">{loan.applicant}</div>
                          <div className="loan-id-text">ID #{loan.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-2)" }}>{loan.purpose}</td>
                    <td style={{ color: "var(--text-2)" }}>{loan.tenure} mo</td>
                    <td>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
                        {formatPKR(loan.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${loan.status}`}>{loan.status}</span>
                    </td>
                    <td>
                      {loan.status === "pending" ? (
                        <div className="action-btn-group">
                          <button
                            className="btn btn-emerald btn-xs"
                            disabled={updating === loan.id}
                            onClick={() => changeStatus(loan.id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-rose btn-xs"
                            disabled={updating === loan.id}
                            onClick={() => changeStatus(loan.id, "rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontStyle: "italic" }}>
                          {loan.status === "approved" ? "✓ Done" : "✗ Closed"}
                        </span>
                      )}
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
