"use client";

import { useState, useEffect } from "react";
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
import LoadingSpinner from './components/LoadingSpinner';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    referralCode: "",
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Add this state
  const router = useRouter();
  const { appData, setAppData } = useAppState();

  const handleRedirect = (user: LoginResponse['user']) => {
    if (user.role === "ADMIN") {
      router.replace("/root");
    } else if (user.verifyStatus === "FALSE" || !user.verifyStatus) {
      router.replace("/verify");
    } else {
      router.replace("/dashboard");
    }
  };

  // Modified auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (appData?.user && appData.isAuthenticated) {
        handleRedirect(appData.user);
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [appData, router, handleRedirect]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const response = await authApi.login({
          email: formData.email,
          password: formData.password,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        });

        if (response.success && response.token) {
          // Store token in cookies
          document.cookie = `loggedInAdmin=${response.token}; path=/; max-age=2592000`;
          document.cookie = `verifyStatus=${response.user.verifyStatus}; path=/; max-age=2592000`;

          // Update app state (will automatically persist to localStorage)
          setAppData({
            user: response.user,
            data: response.data,
            isAuthenticated: true
          });

          // Handle routing
          handleRedirect(response.user);
        }
      } else {
        console.log('Starting registration with:', formData);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setIsSubmitting(false);
          return;
        }

        const registerResponse = await authApi.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode,
        });

        console.log('Register response:', registerResponse);

        if (registerResponse.success) {
          console.log('Registration successful, attempting login');
          const loginResponse: LoginResponse = await authApi.login({
            email: formData.email,
            password: formData.password,
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language
            }
          });

          console.log('Auto-login response:', loginResponse);

          // Store token in document.cookie
          document.cookie = `loggedInAdmin=${loginResponse.token}; path=/; max-age=2592000`;

          sessionStorage.setItem("loggedInAdmin", loginResponse.token);
          setAppData({
            user: loginResponse.user,
            data: loginResponse.data,
            isAuthenticated: true
          });

          handleRedirect(loginResponse.user);
        } else {
          setError(registerResponse.error || registerResponse.message || 'Registration failed');
          console.error('Registration failed:', registerResponse);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner 
          fullScreen 
          size="large" 
          text="Loading..." 
        />
      </div>
    );
  }

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
                disabled={isSubmitting}
                className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-3">
                    <LoadingSpinner size="small" />
                    <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                  </div>
                ) : (
                  isLogin ? "Sign in" : "Create account"
                )}
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

      {/* Global loading overlay */}
      {isSubmitting && (
        <LoadingSpinner 
          overlay
          size="large"
          text={isLogin ? "Signing in to your account..." : "Creating your account..."}
        />
      )}
    </div>
  );
}
