import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import GetStartedModal from "./components/GetStartedModal";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Routes */}
        <Routes>
          {/* Home Page with Navbar */}
          <Route
            path="/"
            element={
              <>
                <Navbar
                  openLogin={() => setShowLogin(true)}
                  openGetStarted={() => setShowGetStarted(true)}
                />
                <Home />
              </>
            }
          />

          {/* Dashboard Page (No Navbar) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Future routes */}
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
        </Routes>

        {/* Login Modal */}
        {showLogin && (
          <AuthModal
            closeModal={() => setShowLogin(false)}
            switchToSignup={() => {
              setShowLogin(false);
              setShowGetStarted(true);
            }}
          />
        )}

        {/* Get Started (Signup) Modal */}
        {showGetStarted && (
          <GetStartedModal close={() => setShowGetStarted(false)} />
        )}
      </div>
    </BrowserRouter>
  );
}
export default App;
