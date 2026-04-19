const express = require("express");
const router = express.Router();
const store = require("../data/store");

// GET /api/wallet
router.get("/", (req, res) => {
  res.json(store.getWallet());
});

// POST /api/wallet/deposit
router.post("/deposit", (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }

  store.updateBalance(amount);
  store.addTransaction("credit", amount, `Deposit of PKR ${amount}`);

  res.json({ message: "Deposit successful", wallet: store.getWallet() });
});

// POST /api/wallet/withdraw
router.post("/withdraw", (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }

  const wallet = store.getWallet();
  if (wallet.balance < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  store.updateBalance(-amount);
  store.addTransaction("debit", amount, `Withdrawal of PKR ${amount}`);

  res.json({ message: "Withdrawal successful", wallet: store.getWallet() });
});

// GET /api/transactions
router.get("/transactions", (req, res) => {
  const { type } = req.query;
  let txs = store.getTransactions();

  if (type) {
    txs = txs.filter((t) => t.type === type);
  }

  res.json(txs);
});

module.exports = router;
