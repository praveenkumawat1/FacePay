import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import GetStartedModal from "./components/GetStartedModal";
import Home from "./pages/Home"; // ← yeh sahi import hai

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar hamesha dikhega */}
        <Navbar
          openLogin={() => setShowLogin(true)}
          openGetStarted={() => setShowGetStarted(true)}
        />

        {/* Home page ab yahan show hoga */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* agar future mein aur pages add karna ho toh yahan likh dena */}
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>

        {/* Login popup */}
        {showLogin && <AuthModal closeModal={() => setShowLogin(false)} />}

        {/* Get Started popup */}
        {showGetStarted && (
          <GetStartedModal close={() => setShowGetStarted(false)} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
