import React, { useContext } from "react";
import {
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

import Advertisement from "../components/userfiles/Advertisement";
import ProfileSection from "../components/userfiles/ProfileSection";
import JobOpenings from "../components/userfiles/JobOpenings";
import StaffRequirements from "../components/userfiles/StaffRequirements";
import DonationSection from "../components/userfiles/DonationSection";

// Verification Pending Component
const VerificationPending = () => {
  const { setUToken, setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("utoken");
    setUToken(false);
    setUserData(false);
    toast.success("Logged out successfully");
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Under Verification
          </h2>
          <p className="text-gray-600 mb-6">
            Your account is currently being reviewed by our team. This process
            typically takes 24-48 hours.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm mb-3">
            For any queries regarding your account verification, please contact
            us:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="font-medium text-blue-900">
                Helpline: +91-9876543210
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium text-blue-900">
                Email: support@familyportal.com
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          <p>We'll notify you via email once your account is approved.</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const tabs = [
  { label: "Profile", path: "profile" },
  { label: "Job Openings", path: "jobs" },
  { label: "Staff Requirements", path: "staff-requirements" },
  { label: "Donations", path: "donations" },
  { label: "Advertisements", path: "advertisements" },
];

const UserPortal = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/")[2] || "profile";
  const { userData, loading, setUToken, setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("utoken");
    setUToken(false);
    setUserData(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user account is pending approval
  if (userData && userData.isApproved === "pending") {
    return <VerificationPending />;
  }

  // Check if user account is disabled
  if (userData && userData.isApproved === "disabled") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Disabled
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been disabled. Please contact support for
            assistance.
          </p>
          <div className="space-y-2 text-sm mb-6">
            <p className="font-medium">Contact Support:</p>
            <p>📞 Helpline: +91-9876543210</p>
            <p>📧 Email: support@familyportal.com</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div
          className="flex gap-1 sm:gap-2 overflow-x-auto py-4"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="flex gap-1 sm:gap-2 min-w-max">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={`/user-portal/${tab.path}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-red-100 text-red-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <Routes>
          <Route path="profile" element={<ProfileSection />} />
          <Route path="jobs" element={<JobOpenings />} />
          <Route path="staff-requirements" element={<StaffRequirements />} />
          <Route path="donations" element={<DonationSection />} />
          <Route path="advertisements" element={<Advertisement />} />
          {/* Fallback to profile */}
          <Route path="*" element={<ProfileSection />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserPortal;
