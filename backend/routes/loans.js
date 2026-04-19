const express = require("express");
const router = express.Router();
const store = require("../data/store");

// POST /api/loans/apply
router.post("/apply", (req, res) => {
  const { applicant, amount, purpose, tenure } = req.body;

  if (!applicant || !amount || !purpose || !tenure) {
    return res.status(400).json({ error: "All fields are required: applicant, amount, purpose, tenure" });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "Loan amount must be greater than 0" });
  }

  if (tenure <= 0) {
    return res.status(400).json({ error: "Tenure must be greater than 0" });
  }

  const loan = store.addLoan({ applicant, amount, purpose, tenure });
  res.status(201).json({ message: "Loan application submitted", loan });
});

// GET /api/loans
router.get("/", (req, res) => {
  res.json(store.getLoans());
});

// PATCH /api/loans/:id/status
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const validStatuses = ["approved", "rejected"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }

  const loan = store.updateLoanStatus(req.params.id, status);

  if (!loan) {
    return res.status(404).json({ error: "Loan not found" });
  }

  res.json({ message: "Status updated", loan });
});

// GET /api/emi-calculator
router.get("/emi-calculator", (req, res) => {
  const { principal, annualRate, months } = req.query;

  if (!principal || !annualRate || !months) {
    return res.status(400).json({ error: "principal, annualRate, and months are required" });
  }

  const P = parseFloat(principal);
  const r = parseFloat(annualRate) / 100 / 12;
  const n = parseInt(months);

  if (P <= 0 || r <= 0 || n <= 0) {
    return res.status(400).json({ error: "All values must be positive numbers" });
  }

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - P;

  res.json({
    emi: parseFloat(emi.toFixed(2)),
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
  });
});

module.exports = router;
