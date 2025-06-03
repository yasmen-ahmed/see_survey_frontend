import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: "", password: "" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // try {
    //   const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData);
    //   if (response.data.token) {
    //     localStorage.setItem("token", response.data.token);
    //     localStorage.setItem("name", response.data.user.firstName + " " + response.data.user.lastName);
    //     localStorage.setItem("role", response.data.user.role);
    // Dummy login: username 'admin', password 'admin123'
    setTimeout(() => {
      if (formData.login === 'admin' && formData.password === 'admin123') {
        localStorage.setItem("token", "dummy-token");
        localStorage.setItem("name", "Admin User");
        localStorage.setItem("role", "admin");
        setError("");
        setSuccess("Login successful! Redirecting...");
        // setTimeout(() => {
        //   navigate('/landingpage');
        // }, 3000);
        navigate('/landingpage');
      } else {
        // setError(response.data.message || "Login failed. Please check your credentials.");
        setError("Login failed. Please use username 'admin' and password 'admin123'.");
      }
      setLoading(false);
    // }
    }, 1000);
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
      </form>
    </div>
  );
};

export default LoginForm;
