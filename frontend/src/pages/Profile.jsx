import { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiKey,
  FiCheckCircle,
  FiCreditCard, // <-- THIS WAS MISSING
} from "react-icons/fi";
import { getUserProfile } from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/";
          return;
        }
        const result = await getUserProfile(token);
        setUser(result.user);
        setWallet(result.wallet);
      } catch (e) {
        localStorage.clear();
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-indigo-700 font-bold">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-8 flex flex-col items-center border border-indigo-100">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${user?.full_name || "User"}&rounded=true&bold=true`
          }
          alt="Profile"
          className="w-28 h-28 rounded-full shadow border-2 border-indigo-400 object-cover mb-2"
        />
        <h1 className="text-2xl font-bold text-indigo-800 mb-1">
          {user?.full_name}
        </h1>
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-6">
          <FiCheckCircle className="text-green-500" /> Face Verified
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <FiMail /> Email:
            </div>
            <div className="font-mono bg-blue-50 rounded px-3 py-1 mb-2">
              {user?.email}
            </div>
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <FiPhone /> Phone:
            </div>
            <div className="font-mono bg-blue-50 rounded px-3 py-1 mb-2">
              {user?.mobile}
            </div>
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <FiCalendar /> Date of Birth:
            </div>
            <div className="font-mono bg-blue-50 rounded px-3 py-1">
              {user?.dob ? new Date(user.dob).toLocaleDateString() : "--"}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <FiKey /> Wallet ID:
            </div>
            <div className="font-mono bg-green-50 rounded px-3 py-1 mb-2">
              {wallet?.wallet_key}
            </div>
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <FiCreditCard /> Wallet Balance:
            </div>
            <div className="font-mono bg-green-50 rounded px-3 py-1 mb-2">
              ₹
              {wallet?.balance?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <FiCalendar /> Created:
            </div>
            <div className="font-mono bg-green-50 rounded px-3 py-1">
              {wallet?.createdAt
                ? new Date(wallet.createdAt).toLocaleDateString() +
                  " " +
                  new Date(wallet.createdAt).toLocaleTimeString()
                : "--"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
