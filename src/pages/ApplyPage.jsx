import { useState } from "react";
import { useNotify } from "../components/NotificationSystem";

const API = import.meta.env.VITE_API_URL || "https://kind-acceptance-production-393e.up.railway.app/";

const BLANK = { applicant: "", cnic: "", contact: "", amount: "", purpose: "Business", tenure: "" };
const STEPS = ["Personal Info", "Loan Details", "Review"];

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(BLANK);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedId, setSubmittedId] = useState(null);
  const { notify } = useNotify();

  function updateField(key, value) {
    setFormData((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: "" }));
  }

  function validatePersonal() {
    const errs = {};
    if (!formData.applicant.trim()) errs.applicant = "Full name is required";
    if (!/^\d{5}-\d{7}-\d$/.test(formData.cnic)) errs.cnic = "Format: XXXXX-XXXXXXX-X";
    if (!formData.contact.trim()) errs.contact = "Contact number is required";
    return errs;
  }

  function validateLoanDetails() {
    const errs = {};
    const amt = parseFloat(formData.amount);
    const ten = parseInt(formData.tenure);
    if (!formData.amount || isNaN(amt) || amt < 5000 || amt > 5000000)
      errs.amount = "Amount must be between PKR 5,000 – 5,000,000";
    if (!formData.tenure || isNaN(ten) || ten < 3 || ten > 60)
      errs.tenure = "Tenure must be 3 – 60 months";
    return errs;
  }

  function goNext() {
    const errs = step === 1 ? validatePersonal() : validateLoanDetails();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setStep((s) => s + 1);
  }

  async function submitApplication() {
    try {
      const res = await fetch(`${API}/api/loans/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant: formData.applicant,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          tenure: parseInt(formData.tenure),
        }),
      });
      const data = await res.json();
      if (!res.ok) return notify(data.error, "error");
      setSubmittedId(data.loan.id);
      notify("Loan application submitted!", "success");
    } catch {
      notify("Submission failed. Please try again.", "error");
    }
  }

  function resetForm() {
    setSubmittedId(null);
    setFormData(BLANK);
    setStep(1);
    setFieldErrors({});
  }

  if (submittedId) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center" }}>
        <div className="glass-card" style={{ maxWidth: 480, width: "100%" }}>
          <div className="success-splash">
            <div className="success-icon-ring">✓</div>
            <h2 className="success-title">Application Submitted</h2>
            <p className="success-subtitle">Your application is under review. We'll update you shortly.</p>
            <div className="loan-id-chip">Loan ID # {submittedId}</div>
            <span className="badge badge-pending" style={{ marginTop: 4 }}>Pending Review</span>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => window.location.href = "/portfolio"}>
                View Portfolio →
              </button>
              <button className="btn btn-outline-amber" onClick={resetForm}>
                New Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="section-title">Loan Application</h1>
          <p className="section-desc">Complete all steps to submit your request</p>
        </div>
      </div>

      <div className="loan-form-wrap">
        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((label, idx) => {
            const num = idx + 1;
            const state = step > num ? "done" : step === num ? "active" : "";
            return (
              <div key={label} className={`step-node ${state}`}>
                <div className="step-circle">
                  {step > num ? "✓" : num}
                </div>
                <span className="step-label">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="glass-card">
          {step === 1 && (
            <div className="form-fieldset">
              <div className="form-fieldset-title">Personal Information</div>
              <Field label="Full Name" id="applicant" value={formData.applicant} onChange={(v) => updateField("applicant", v)} placeholder="Ali Raza" error={fieldErrors.applicant} />
              <Field label="CNIC Number" id="cnic" value={formData.cnic} onChange={(v) => updateField("cnic", v)} placeholder="XXXXX-XXXXXXX-X" error={fieldErrors.cnic} />
              <Field label="Contact Number" id="contact" value={formData.contact} onChange={(v) => updateField("contact", v)} placeholder="03001234567" error={fieldErrors.contact} />
            </div>
          )}

          {step === 2 && (
            <div className="form-fieldset">
              <div className="form-fieldset-title">Loan Details</div>
              <Field label="Loan Amount (PKR)" id="amount" type="number" value={formData.amount} onChange={(v) => updateField("amount", v)} placeholder="e.g. 100000" error={fieldErrors.amount} />
              <div className="field-group">
                <label className="field-label" htmlFor="purpose">Loan Purpose</label>
                <select id="purpose" className="field-input" value={formData.purpose} onChange={(e) => updateField("purpose", e.target.value)}>
                  {["Business", "Education", "Medical", "Personal"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <Field label="Tenure (months)" id="tenure" type="number" value={formData.tenure} onChange={(v) => updateField("tenure", v)} placeholder="3 to 60" error={fieldErrors.tenure} />
            </div>
          )}

          {step === 3 && (
            <div className="form-fieldset">
              <div className="form-fieldset-title">Review & Confirm</div>
              <div className="review-list">
                {[
                  ["Full Name", formData.applicant],
                  ["CNIC", formData.cnic],
                  ["Contact", formData.contact],
                  ["Amount", `PKR ${parseFloat(formData.amount).toLocaleString()}`],
                  ["Purpose", formData.purpose],
                  ["Tenure", `${formData.tenure} months`],
                ].map(([label, value]) => (
                  <div key={label} className="review-item">
                    <div className="review-item-label">{label}</div>
                    <div className="review-item-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-nav">
            {step > 1 ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setStep((s) => s - 1)}>← Back</button>
            ) : <span />}
            {step < 3 ? (
              <button className="btn btn-amber" onClick={goNext}>Continue →</button>
            ) : (
              <button className="btn btn-emerald" onClick={submitApplication}>Submit Application ✓</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, type = "text", value, onChange, placeholder, error }) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <span className="field-error">⚠ {error}</span>}
    </div>
  );
}
