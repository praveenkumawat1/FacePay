import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import GetStartedModal from "./components/GetStartedModal";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CookieConsent from "./components/CookieConsent";

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const location = useLocation();

  // Agar dashboard pe ho to navbar hide karo
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

        {/* Dashboard Page (NO Top Navbar) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Future routes */}
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <CookieConsent />

      {/* Modals */}
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
