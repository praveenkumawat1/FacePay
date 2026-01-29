import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
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
import CookieConsent from "./components/CookieConsent";

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const location = useLocation();

  // Only show navbar on home (not on dashboard)
  const showNavbar = !location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Home Page with Navbar */}
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

        {/* Dashboard and subpages (blank for main /dashboard) */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* index route BLANK, so nothing shows for /dashboard */}
          <Route index element={<></>} />

          {/* All working dashboard sub-pages */}
          <Route path="profile" element={<Profile />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="send-money" element={<SendMoney />} />
          <Route path="add-money" element={<AddMoney />} />
          <Route path="history" element={<History />} />
          <Route path="security" element={<Security />} />
          <Route path="coupons" element={<CouponsOffers />} />
        </Route>

        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <CookieConsent />

      {/* Auth & Get Started Modals */}
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
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
