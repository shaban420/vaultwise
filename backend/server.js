const express = require("express");
const cors = require("cors");
const walletRouter = require("./routes/wallet");
const loansRouter = require("./routes/loans");
const store = require("./data/store");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/wallet", walletRouter);

app.get("/api/transactions", (req, res) => {
  const { type } = req.query;
  let txs = store.getTransactions();
  if (type) txs = txs.filter((t) => t.type === type);
  res.json(txs);
});

app.use("/api/loans", loansRouter);

app.get("/api/emi-calculator", (req, res) => {
  const { principal, annualRate, months } = req.query;
  if (!principal || !annualRate || !months) {
    return res.status(400).json({ error: "principal, annualRate, and months are required" });
  }
  const P = parseFloat(principal);
  const r = parseFloat(annualRate) / 100 / 12;
  const n = parseInt(months);
  if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r <= 0 || n <= 0) {
    return res.status(400).json({ error: "All values must be valid positive numbers" });
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

app.get("/", (req, res) => res.json({ message: "FintechFlow API is running" }));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
