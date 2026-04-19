// In-memory storage — no database needed

let wallet = {
  owner: "Ali Raza",
  balance: 50000,
  currency: "PKR",
};

let transactions = [
  {
    id: 1,
    type: "credit",
    amount: 50000,
    description: "Initial deposit",
    timestamp: new Date().toISOString(),
  },
];

let loans = [];

let nextTxId = 2;
let nextLoanId = 1;

function getWallet() {
  return wallet;
}

function updateBalance(amount) {
  wallet.balance += amount;
}

function addTransaction(type, amount, description) {
  const tx = {
    id: nextTxId++,
    type,
    amount,
    description,
    timestamp: new Date().toISOString(),
  };
  transactions.unshift(tx); // newest first
  return tx;
}

function getTransactions() {
  return transactions;
}

function addLoan(loanData) {
  const loan = {
    id: nextLoanId++,
    ...loanData,
    status: "pending",
    appliedAt: new Date().toISOString(),
  };
  loans.push(loan);
  return loan;
}

function getLoans() {
  return loans;
}

function updateLoanStatus(id, status) {
  const loan = loans.find((l) => l.id === parseInt(id));
  if (!loan) return null;
  loan.status = status;
  return loan;
}

module.exports = {
  getWallet,
  updateBalance,
  addTransaction,
  getTransactions,
  addLoan,
  getLoans,
  updateLoanStatus,
};
