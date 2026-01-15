import { useState, useEffect } from "react";
import { getUserProfile } from "../services/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("facepay_token");

        if (!token) {
          window.location.href = "/";
          return;
        }

        const result = await getUserProfile(token);
        setUser(result.user);
      } catch (error) {
        console.error("Failed to load profile:", error);
        localStorage.clear();
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">💳 FacePay</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your payments with ease using FacePay
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-xl p-8 text-white mb-8">
          <p className="text-sm opacity-90 mb-2">Available Balance</p>
          <h3 className="text-5xl font-bold mb-4">
            ₹{user?.balance?.toFixed(2) || "0.00"}
          </h3>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition">
              Send Money
            </button>
            <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition">
              Request Money
            </button>
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mobile</p>
                <p className="font-semibold">{user?.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-semibold">
                  {user?.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Bank Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-semibold">{user?.bank_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Holder</p>
                <p className="font-semibold">{user?.account_holder_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-semibold">
                  ****{user?.account_number?.slice(-4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IFSC Code</p>
                <p className="font-semibold">{user?.ifsc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-center">
              <div className="text-3xl mb-2">💸</div>
              <p className="font-semibold">Pay</p>
            </button>
            <button className="p-6 border-2 border-gray-200 rounded-xl hover: border-blue-500 hover:bg-blue-50 transition text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="font-semibold">History</p>
            </button>
            <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-center">
              <div className="text-3xl mb-2">➕</div>
              <p className="font-semibold">Add Money</p>
            </button>
            <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition text-center">
              <div className="text-3xl mb-2">👤</div>
              <p className="font-semibold">Profile</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
