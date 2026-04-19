import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav";
import { NotificationProvider } from "./components/NotificationSystem";
import OverviewPage from "./pages/OverviewPage";
import HistoryPage from "./pages/HistoryPage";
import ApplyPage from "./pages/ApplyPage";
import PortfolioPage from "./pages/PortfolioPage";
import CalculatorPage from "./pages/CalculatorPage";

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <div className="app-shell">
          <TopNav />
          <main>
            <div className="page-wrapper">
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/apply" element={<ApplyPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </NotificationProvider>
    </BrowserRouter>
  );
}
