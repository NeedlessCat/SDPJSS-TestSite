import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const AccountStatusModal = () => {
  const { userData, familyData, setUToken } = useContext(AppContext);

  // Determine which data to check based on what's available
  const currentUser = userData || familyData;

  // Check if modal should be shown
  const shouldShowModal = currentUser && currentUser.isApproved === "disabled";

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("utoken");

    setUToken(false);
  };

  // Get appropriate message based on status
  const getMessage = () => {
    if (currentUser?.isApproved === "disabled") {
      return "Your account has been disabled. Please contact support for assistance.";
    }
    return "";
  };

  // Don't render if modal shouldn't be shown
  if (!shouldShowModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 mx-4 max-w-md w-full shadow-xl">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Disabled
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-6">{getMessage()}</p>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Contact Support
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>Helpline: +91-8210701450</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>kumar29.aayush@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountStatusModal;
