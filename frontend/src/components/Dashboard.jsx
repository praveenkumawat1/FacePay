import React, { useEffect, useState } from "react";
import SidebarNavbar from "../components/SidebarNavbar";
import axios from "axios";

export default function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch wallet and user data after login/signup
    axios
      .get("/api/user/me") // Backend endpoint for logged in user + wallet
      .then((res) => {
        setUser(res.data.user);
        setWallet(res.data.wallet);
      })
      .catch(() => {
        // redirect or show error
        window.location.href = "/";
      });
  }, []);

  if (!wallet) {
    return (
      <div className="flex">
        <SidebarNavbar user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading wallet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SidebarNavbar
        user={user}
        onLogout={() => {
          // add logout logic if needed
          localStorage.clear();
          window.location.href = "/";
        }}
      />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Welcome {user?.name || ""}</h2>
        <div className="bg-white rounded shadow p-4 max-w-lg">
          <div>
            <b>Wallet Key:</b> {wallet.walletKey}
          </div>
          <div>
            <b>Balance:</b> ₹ {wallet.balance}
          </div>
        </div>
      </div>
    </div>
  );
}
