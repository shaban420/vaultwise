# VaultWise — Personal Finance Dashboard

A fully redesigned fintech web application built with React + Express.

## Features
- **Overview** — Live wallet balance with animated counter, deposit/withdraw with micro-animations
- **Transaction History** — Full table view with search, filter by type, sort by date/amount
- **Loan Application** — 3-step form with validation and progress stepper
- **Loan Portfolio** — Dashboard with status cards and inline approve/reject actions
- **EMI Calculator** — Loan repayment calculator with amortisation schedule

## Stack
- Frontend: React 18 + Vite, CSS custom properties, Google Fonts (Syne + DM Sans)
- Backend: Node.js + Express, in-memory data store

## Design System
- Dark obsidian theme (`#0d0d0f`) with warm amber accents (`#f59e0b`)
- Glassmorphism cards with `backdrop-filter: blur`
- Syne (display) + DM Sans (body) typography
- Spring easing animations throughout

## Setup
```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd frontend && npm install && npm run dev
```
