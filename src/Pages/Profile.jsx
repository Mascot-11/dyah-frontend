import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { User, Lock } from "lucide-react";

// Set global auth header
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("auth_token")}`;

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/profile")
      .then((res) => setProfile(res.data))
      .catch(() => toast.error("Failed to fetch profile."));
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post("/profile", profile)
      .then(() => toast.success("Profile updated successfully."))
      .catch(() => toast.error("Failed to update profile."))
      .finally(() => setLoading(false));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post("/api/change-password", passwordData)
      .then(() => {
        toast.success("Password changed. Redirecting to login...");
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
        setTimeout(() => {
          localStorage.clear();
          navigate("/login");
        }, 2000);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Password change failed.")
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-6">
      <ToastContainer />
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8 animate-fade-in transition-all duration-300">
        
        {/* Profile Header */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-gray-700 via-gray-600 to-gray-700 flex items-center justify-center shadow-md">
            <User size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mt-4">My Profile</h2>
          <p className="text-gray-400">Manage your account info and credentials</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-400 transition"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-400 transition"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-2 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>

        {/* Divider */}
        <hr className="border-white/10" />

        {/* Change Password */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Lock size={20} /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-300">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-400 transition"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300">New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-400 transition"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300">Confirm New Password</label>
              <input
                type="password"
                name="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white font-bold py-2 rounded-md hover:bg-red-600 transition disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
