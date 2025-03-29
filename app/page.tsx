"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faUser, 
  faTicket 
} from '@fortawesome/free-solid-svg-icons';
import { authApi } from "../utils/auth";
import { useAppState } from "./context/AppContext";
import type { LoginResponse } from "../utils/auth";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAppData } = useAppState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        // Handle login
        const response: LoginResponse = await authApi.login({
          email: formData.email,
          password: formData.password,
        });

        // Store token
        sessionStorage.setItem("loggedInAdmin", response.token);

        // Update app state with the transformed response
        setAppData({
          user: response.user,
          data: response.data,
        });

        // Route based on role
        if (response.user.role === "ADMIN") {
          router.push("/root");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Handle registration
        const response = await authApi.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode,
        });

        setError("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Simplified Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <span className="text-xl font-bold text-gray-900">WebFixx</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`pt-24 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 ${!isLogin ? 'pb-12' : ''}`}>
        <div className="max-w-md w-full">
          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {isLogin 
                  ? "Sign in to access your account" 
                  : "Join us and start your journey"}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {!isLogin && (
                <>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faLock} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faTicket} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="referralCode"
                      name="referralCode"
                      type="text"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Referral Code (Optional)"
                      value={formData.referralCode}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-center px-4 py-3 rounded-lg bg-red-50 text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
              >
                {isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 space-y-4">
              {isLogin && (
                <div className="text-center">
                  <Link
                    href="/reset-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}

              <div className="text-center">
                <button
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin
                    ? "Don't have an account? Create one"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}