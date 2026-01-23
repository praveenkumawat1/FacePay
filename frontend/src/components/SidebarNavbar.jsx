import React from "react";

export default function SidebarNavbar({ user, onLogout }) {
  return (
    <div className="w-56 min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <div className="font-bold text-lime-400 mb-8 text-lg">FacePay Wallet</div>
      <a href="/dashboard" className="mb-4 hover:text-lime-400">
        Dashboard
      </a>
      <a href="/transactions" className="mb-4 hover:text-lime-400">
        Transactions
      </a>
      <a href="/settings" className="mb-4 hover:text-lime-400">
        Settings
      </a>
      <button
        onClick={onLogout}
        className="mt-auto bg-red-500 hover:bg-red-600 rounded py-2"
      >
        Logout
      </button>
    </div>
  );
}
