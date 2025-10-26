"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "../../utils/auth";
import LoadingSpinner from "../components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faMoon, faSun } from "@fortawesome/free-solid-svg-icons"; // Import faMoon and faSun
import { useAppState } from "../context/AppContext"; // Import useAppState

type ResetStep = 'email' | 'code' | 'password';

interface ResetState {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  success: string;
  isLoading: boolean;
  currentStep: ResetStep;
}

export default function ResetPassword() {
  const [state, setState] = useState<ResetState>({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    success: "",
    isLoading: false,
    currentStep: 'email'
  });

  const router = useRouter();
  const { appData } = useAppState(); // Use appData to initialize dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // Prioritize appData for authenticated users, otherwise local storage
      if (appData?.user?.darkMode !== undefined) {
        return appData.user.darkMode;
      }
      const localPreference = localStorage.getItem('darkModePreference');
      return localPreference ? JSON.parse(localPreference) : false;
    }
    return false;
  });

  // Effect to apply dark mode class to HTML element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Effect to sync with appData for authenticated users
  useEffect(() => {
    if (appData?.user?.darkMode !== undefined && appData.isAuthenticated) {
      setIsDarkMode(appData.user.darkMode);
    }
  }, [appData?.user?.darkMode, appData?.isAuthenticated]);

  const updateState = (updates: Partial<ResetState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const validatePassword = (password: string) => {
    const requirements = {
      minLength: 8,
      maxLength: 32,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const errors: string[] = [];

    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters long`);
    }

    if (password.length > requirements.maxLength) {
      errors.push(`Password must be less than ${requirements.maxLength} characters`);
    }

    if (!requirements.hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!requirements.hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!requirements.hasNumber) {
      errors.push('Password must contain at least one number');
    }

    if (!requirements.hasSpecial) {
      errors.push('Password must contain at least one special character');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ error: "", success: "", isLoading: true });

    try {
      const response = await authApi.resetPassword({ email: state.email });
      if (response.success) {
        updateState({
          success: "Verification code sent to your email",
          currentStep: 'code',
          isLoading: false
        });
      } else {
        throw new Error(response.error || "Failed to send reset code");
      }
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Password reset failed",
        isLoading: false
      });
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateState({ error: "", success: "", isLoading: true });

    try {
      const response = await authApi.verifyResetCode({
        email: state.email,
        code: state.code
      });
      
      if (response.success) {
        updateState({
          currentStep: 'password',
          success: "Code verified successfully",
          isLoading: false
        });
      } else {
        throw new Error(response.error || "Invalid code");
      }
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Code verification failed",
        isLoading: false
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password validation
    const validation = validatePassword(state.newPassword);
    if (!validation.isValid) {
      updateState({ error: validation.errors[0] });
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      updateState({ error: "Passwords do not match" });
      return;
    }

    updateState({ error: "", success: "", isLoading: true });

    try {
      const response = await authApi.updatePassword({
        email: state.email,
        newPassword: state.newPassword
      });

      if (response.success) {
        updateState({ 
          success: "Password updated successfully",
          isLoading: false 
        });
        setTimeout(() => router.replace("/"), 1500);
      } else {
        throw new Error(response.error || "Password update failed");
      }
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Password update failed",
        isLoading: false
      });
    }
  };

  const renderPasswordRequirements = () => (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Password Requirements:</h4>
      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
        <li className={`flex items-center ${state.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
          <CheckIcon isValid={state.newPassword.length >= 8} />
          At least 8 characters
        </li>
        <li className={`flex items-center ${/[A-Z]/.test(state.newPassword) ? 'text-green-600' : ''}`}>
          <CheckIcon isValid={/[A-Z]/.test(state.newPassword)} />
          One uppercase letter
        </li>
        <li className={`flex items-center ${/[a-z]/.test(state.newPassword) ? 'text-green-600' : ''}`}>
          <CheckIcon isValid={/[a-z]/.test(state.newPassword)} />
          One lowercase letter
        </li>
        <li className={`flex items-center ${/[0-9]/.test(state.newPassword) ? 'text-green-600' : ''}`}>
          <CheckIcon isValid={/[0-9]/.test(state.newPassword)} />
          One number
        </li>
        <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(state.newPassword) ? 'text-green-600' : ''}`}>
          <CheckIcon isValid={/[!@#$%^&*(),.?":{}|<>]/.test(state.newPassword)} />
          One special character
        </li>
      </ul>
    </div>
  );

  const CheckIcon = ({ isValid }: { isValid: boolean }) => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {isValid ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black" suppressHydrationWarning>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-10 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <span className="text-xl font-bold text-gray-900 dark:text-white">WebFixx</span>
            <button 
              onClick={() => {
                const newDarkMode = !isDarkMode;
                setIsDarkMode(newDarkMode);
                // Store preference locally for unauthenticated pages
                localStorage.setItem('darkModePreference', JSON.stringify(newDarkMode));
                // No API call for unauthenticated pages
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="fixed top-16 left-0 right-0 bg-yellow-50 border-b border-yellow-100 p-4 dark:bg-yellow-900 dark:border-yellow-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              className="h-5 w-5 text-yellow-400 mr-3"
            />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {state.currentStep === 'email' && "Enter your email to receive a verification code"}
              {state.currentStep === 'code' && "Check your email for the verification code"}
              {state.currentStep === 'password' && "Create a strong password for your account"}
            </p>
          </div>
        </div>
      </div>

      {/* Existing Main Content - just add pt-36 to account for header space */}
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-36">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Password Reset
            </h2>
            <div className="mt-2 flex items-center justify-center space-x-1">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              <div className="h-1 w-12 rounded-full bg-blue-600"></div>
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex justify-between items-center">
            {['email', 'code', 'password'].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center 
                  ${state.currentStep === step 
                    ? 'bg-blue-600 text-white'
                    : index < ['email', 'code', 'password'].indexOf(state.currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-300'
                  }
                `}>
                  {index + 1}
                </div>
                <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 capitalize">{step}</span>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl dark:shadow-none sm:rounded-lg sm:px-10">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              {state.currentStep === 'email' && 
                "Enter your email address to reset your password"}
              {state.currentStep === 'code' && 
                "Enter the verification code sent to your email"}
              {state.currentStep === 'password' && 
                "Create a new password for your account"}
            </p>

            {/* Forms */}
            {state.currentStep === 'email' && (
              <form className="space-y-6" onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Email address"
                    value={state.email}
                    onChange={(e) => updateState({ email: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {state.isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    "Send reset code"
                  )}
                </button>
              </form>
            )}

            {state.currentStep === 'code' && (
              <form className="space-y-6" onSubmit={handleCodeSubmit}>
                <div>
                  <label htmlFor="code" className="sr-only">Verification Code</label>
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Enter 6-digit code"
                    value={state.code}
                    onChange={(e) => updateState({ code: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {state.isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>
            )}

            {state.currentStep === 'password' && (
              <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="sr-only">New Password</label>
                    <input
                      id="newPassword"
                    type="password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="New password"
                    value={state.newPassword}
                    onChange={(e) => updateState({ newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Confirm password"
                    value={state.confirmPassword}
                    onChange={(e) => updateState({ confirmPassword: e.target.value })}
                  />
                </div>
              </div>

                {renderPasswordRequirements()}

                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {state.isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Messages */}
          {state.error && (
            <div className="mt-4 bg-red-50 text-red-500 p-3 rounded-md text-sm text-center dark:bg-red-900 dark:text-red-300">
              {state.error}
            </div>
          )}

          {state.success && (
            <div className="mt-4 bg-green-50 text-green-500 p-3 rounded-md text-sm text-center dark:bg-green-900 dark:text-green-300">
              {state.success}
            </div>
          )}

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center space-x-1 dark:text-blue-400 dark:hover:text-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to login</span>
            </Link>
          </div>
        </div>

        {state.isLoading && (
          <LoadingSpinner 
            overlay 
            text={
              state.currentStep === 'email' ? "Sending verification code..." :
              state.currentStep === 'code' ? "Verifying code..." :
              "Updating password..."
            }
          />
        )}
      </main>
    </div>
  );
}
