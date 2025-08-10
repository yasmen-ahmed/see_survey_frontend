import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [changePasswordData, setChangePasswordData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangePasswordChange = (e) => {
    setChangePasswordData({ ...changePasswordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordLoading(true);

    // Validation
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setChangePasswordError("New passwords do not match");
      setChangePasswordLoading(false);
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setChangePasswordError("New password must be at least 6 characters long");
      setChangePasswordLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        email: changePasswordData.email,
        oldPassword: changePasswordData.oldPassword,
        newPassword: changePasswordData.newPassword
      });

      if (response.data.success) {
        setChangePasswordSuccess("Password changed successfully!");
        setChangePasswordData({
          email: "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowChangePassword(false);
          setChangePasswordSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Change password error:", err);
      setChangePasswordError(err.response?.data?.error || "Failed to change password. Please try again.");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", response.data.user.firstName + " " + response.data.user.lastName);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userId", response.data.user.id);
        // Store user roles for role switching functionality
        if (response.data.user.roles && response.data.user.roles.length > 0) {
          localStorage.setItem("userRoles", JSON.stringify(response.data.user.roles));
        }
        setError("");
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate('/landingpage');
        }, 3000);
      } else {
        setError(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="text-center mb-6">
        <img src="/Nokia.png" alt="Logo" className="w-50 mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Welcome to SEE-Survey</h1>

      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        
        {loading && (
          <div className="text-blue-600 mb-4">Processing... Please wait...</div>
        )}
<label className="block mb-2 font-bold">Username</label>
        <input
          type="text"
          name="login"
          placeholder="Username"
          value={formData.login}
          onChange={handleChange}
          required
          className="w-full mb-3 px-4 py-2 border rounded-md"
        />
<label className="block mb-2 font-bold">Password</label>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full mb-3 px-4 py-2 border rounded-md"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-green-700"
        >
          Login
        </button>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowChangePassword(true)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Change Password
          </button>
        </div>
      </form>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChangePassword(false);
              setChangePasswordError("");
              setChangePasswordSuccess("");
              setChangePasswordData({
                email: "",
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
              });
            }
          }}
        >
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setChangePasswordError("");
                  setChangePasswordSuccess("");
                  setChangePasswordData({
                    email: "",
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              {changePasswordError && (
                <div className="text-red-600 mb-4 text-sm">{changePasswordError}</div>
              )}
              {changePasswordSuccess && (
                <div className="text-green-600 mb-4 text-sm">{changePasswordSuccess}</div>
              )}

              <div className="mb-4">
                <label className="block mb-2 font-bold text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={changePasswordData.email}
                  onChange={handleChangePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-md text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold text-sm">Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={changePasswordData.oldPassword}
                  onChange={handleChangePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-md text-sm"
                  placeholder="Enter current password"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold text-sm">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={changePasswordData.newPassword}
                  onChange={handleChangePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-md text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-bold text-sm">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={changePasswordData.confirmPassword}
                  onChange={handleChangePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-md text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {changePasswordLoading ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setChangePasswordError("");
                    setChangePasswordSuccess("");
                    setChangePasswordData({
                      email: "",
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
