import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $isLoading, $error, authActions } from "@starter/lib/auth";

interface LoginFormProps {
  redirectTo?: string;
  className?: string;
}

export function LoginForm({ redirectTo = "/", className = "" }: LoginFormProps) {
  const isLoading = useStore($isLoading);
  const error = useStore($error);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setSelectedProvider(provider);
    authActions.setLoading(true);
    authActions.setError(null);

    try {
      // Redirect to BetterAuth OAuth endpoint
      const redirectUrl = new URL(`/api/auth/signin/${provider}`, window.location.origin);
      redirectUrl.searchParams.set("redirect_to", redirectTo);
      
      window.location.href = redirectUrl.toString();
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      authActions.setError({
        code: "OAUTH_ERROR",
        message: `Failed to sign in with ${provider}`,
        details: error,
      });
      setSelectedProvider(null);
      authActions.setLoading(false);
    }
  };

  const providerButtons = [
    {
      id: "google",
      name: "Google",
      icon: "🌐", // Replace with proper Google icon
      bgColor: "bg-white border border-gray-300 hover:bg-gray-50",
      textColor: "text-gray-700",
    },
    {
      id: "github", 
      name: "GitHub",
      icon: "🐙", // Replace with proper GitHub icon
      bgColor: "bg-gray-900 hover:bg-gray-800",
      textColor: "text-white",
    },
  ];

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Sign in to your account
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error.message || "An error occurred"}</p>
          </div>
        )}

        <div className="space-y-3">
          {providerButtons.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleOAuthSignIn(provider.id as "google" | "github")}
              disabled={isLoading}
              className={`
                w-full flex items-center justify-center px-4 py-3 rounded-md font-medium transition-colors
                ${provider.bgColor} ${provider.textColor}
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
            >
              {selectedProvider === provider.id && isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{provider.icon}</span>
                  <span>Continue with {provider.name}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}