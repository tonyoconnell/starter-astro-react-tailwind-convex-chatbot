import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $user, $isLoading, authActions } from "@starter/lib/auth";

interface DeleteAccountProps {
  onCancel?: () => void;
  className?: string;
}

export function DeleteAccount({ onCancel, className = "" }: DeleteAccountProps) {
  const user = useStore($user);
  const isLoading = useStore($isLoading);

  const [step, setStep] = useState<"warning" | "confirmation" | "final">("warning");
  const [confirmationText, setConfirmationText] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");

  const requiredConfirmationText = "DELETE MY ACCOUNT";

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // TODO: Implement account deletion API call
      const response = await fetch("/api/auth/profile", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          feedback,
        }),
      });

      if (response.ok) {
        // Clear auth state and redirect
        authActions.clearAuth();
        window.location.href = "/?account-deleted";
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      alert("Failed to delete account. Please try again or contact support.");
    }
  };

  const isConfirmationValid = confirmationText === requiredConfirmationText;

  const deletionReasons = [
    "I no longer need this service",
    "I'm switching to a different platform",
    "Privacy concerns",
    "Too expensive",
    "Poor user experience",
    "Technical issues",
    "Other",
  ];

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">Unable to load account deletion options.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md max-w-2xl mx-auto ${className}`}>
      {/* Warning Step */}
      {step === "warning" && (
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Delete Account</h2>
            <p className="text-gray-600">
              This action cannot be undone. Please read the information below carefully.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-red-800 mb-3">What will be deleted:</h3>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                Your profile information and settings
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                All chat history and conversations
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                Account preferences and customizations
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                Any uploaded files or attachments
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Before you delete:</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Consider exporting your data first (in Account Settings)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                You can temporarily deactivate instead of deleting
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Contact support if you're having issues we can help with
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep("confirmation")}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Continue with Deletion
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Step */}
      {step === "confirmation" && (
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Account Deletion</h2>
            <p className="text-gray-600">
              Please help us understand why you're leaving and confirm your decision.
            </p>
          </div>

          <div className="space-y-6">
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you deleting your account? (Optional)
              </label>
              <div className="space-y-2">
                {deletionReasons.map((reasonOption) => (
                  <label key={reasonOption} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={reason === reasonOption}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Additional feedback (Optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Help us improve by sharing your experience..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Confirmation Text */}
            <div>
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Type <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-mono">{requiredConfirmationText}</code> to confirm
              </label>
              <input
                type="text"
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type the confirmation text..."
                className={`block w-full rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 ${
                  isConfirmationValid
                    ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setStep("warning")}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              onClick={() => setStep("final")}
              disabled={!isConfirmationValid}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Final Step
            </button>
          </div>
        </div>
      )}

      {/* Final Confirmation Step */}
      {step === "final" && (
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Final Confirmation</h2>
            <p className="text-gray-600">
              This is your last chance to cancel. Once you click "Delete Account", your account and all data will be permanently removed.
            </p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">👋</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Goodbye, {user.name}</h3>
                <p className="text-red-700">Account: {user.email}</p>
              </div>
            </div>
            <p className="text-sm text-red-600">
              Thank you for using our service. We're sorry to see you go.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep("confirmation")}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting Account...</span>
                </div>
              ) : (
                "Delete Account Forever"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}