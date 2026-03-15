import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import GetStartedModal from "./components/GetStartedModal";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import SendMoney from "./pages/SendMoney";
import AddMoney from "./pages/AddMoney";
import History from "./pages/History";
import Security from "./pages/Security";
import CouponsOffers from "./pages/CouponsOffers";
import MobileScanPage from "./pages/MobileScanPage";
import CookieConsent from "./components/CookieConsent";
import KYCVerification from "./pages/KYCVerification";
import LoadingScreen from "./pages/LoadingScreen";

// ✅ Correct import — aapki file ke actual export names
import { DashboardProvider } from "./pages/DashboardContext";

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const location = useLocation();

  const showNavbar = !location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={
            <>
              {showNavbar && (
                <Navbar
                  openLogin={() => setShowLogin(true)}
                  openGetStarted={() => setShowGetStarted(true)}
                />
              )}
              <Home />
            </>
          }
        />

        <Route path="/scan" element={<MobileScanPage />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<></>} />
          <Route path="profile" element={<Profile />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="send-money" element={<SendMoney />} />
          <Route path="add-money" element={<AddMoney />} />
          <Route path="history" element={<History />} />
          <Route path="security" element={<Security />} />
          <Route path="coupons" element={<CouponsOffers />} />
          <Route path="kyc-verification" element={<KYCVerification />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <CookieConsent />

      {showLogin && (
        <AuthModal
          closeModal={() => setShowLogin(false)}
          switchToSignup={() => {
            setShowLogin(false);
            setShowGetStarted(true);
          }}
        />
      )}
      {showGetStarted && (
        <GetStartedModal close={() => setShowGetStarted(false)} />
      )}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen loading={loading} />
      {!loading && (
        <BrowserRouter>
          {/* ✅ DashboardProvider — saare pages mein dark mode, language, currency real-time */}
          <DashboardProvider>
            <AppContent />
          </DashboardProvider>
        </BrowserRouter>
      )}
    </>
  );
}
