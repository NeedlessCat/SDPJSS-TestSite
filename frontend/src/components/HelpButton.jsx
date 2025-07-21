import React, { useState, useEffect } from "react";
import {
  X,
  HelpCircle,
  Users,
  UserPlus,
  CheckCircle,
  LogIn,
  Heart,
  Briefcase,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Info,
} from "lucide-react";

const HelpButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Hide tooltip after 5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    setShowTooltip(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const steps = [
    {
      id: 1,
      title: "Register Family",
      description: "Create your family account",
      icon: <Users className="w-5 h-5 text-red-600" />,
    },
    {
      id: 2,
      title: "Add Members",
      description: "Include all family members",
      icon: <UserPlus className="w-5 h-5 text-rose-600" />,
    },
    {
      id: 3,
      title: "Complete Profiles",
      description: "Fill member details",
      icon: <Edit3 className="w-5 h-5 text-pink-600" />,
    },
    {
      id: 4,
      title: "Wait for Approval",
      description: "Admin review (3-4 days)",
      icon: <CheckCircle className="w-5 h-5 text-red-700" />,
    },
    {
      id: 5,
      title: "Login & Access",
      description: "Use the User Portal",
      icon: <LogIn className="w-5 h-5 text-rose-700" />,
    },
  ];

  const features = [
    {
      title: "Donations",
      icon: <Heart className="w-4 h-4 text-red-500" />,
      description: "Support community",
    },
    {
      title: "Staff Needs",
      icon: <Briefcase className="w-4 h-4 text-rose-500" />,
      description: "Post requirements",
    },
    {
      title: "Job Posts",
      icon: <PlusCircle className="w-4 h-4 text-pink-500" />,
      description: "Share opportunities",
    },
    {
      title: "Manage Ads",
      icon: <Edit3 className="w-4 h-4 text-red-600" />,
      description: "Create & edit ads",
    },
    {
      title: "Full Control",
      icon: <Trash2 className="w-4 h-4 text-rose-600" />,
      description: "Edit & delete content",
    },
    {
      title: "Public View",
      icon: <Eye className="w-4 h-4 text-pink-600" />,
      description: "Everyone can see posts",
    },
  ];

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {/* Improved Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-14 right-0 sm:bottom-16 mb-2 min-w-[150px] sm:min-w-[250px] max-w-[400px] sm:max-w-[500px]">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs sm:text-sm leading-tight">
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">New here?</div>
                  <div className="opacity-90">Quick start guide inside!</div>
                </div>
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-600"></div>
            </div>
          </div>
        )}

        {/* Help Button */}
        <button
          onClick={openModal}
          className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
          aria-label="Help and Guidelines"
        >
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 p-3 sm:p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 sm:w-7 sm:h-7 text-red-600" />
                <span className="hidden sm:inline">Beginner's Guide</span>
                <span className="sm:hidden">Quick Guide</span>
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-600 transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-6">
              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border border-red-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-lg">👋</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                      Welcome to Our Community!
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Get started in 5 simple steps and join our platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                    5
                  </span>
                  Quick Steps
                </h3>

                {/* Mobile: Compact Cards */}
                <div className="block sm:hidden space-y-3">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="bg-white border border-red-100 p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {step.id}
                        </div>
                        {step.icon}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                            {step.title}
                          </h4>
                          <p className="text-gray-600 text-xs leading-tight">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="bg-white border border-red-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {step.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {step.icon}
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-sm">
                    ✨
                  </span>
                  After Approval
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white border border-rose-100 p-2 sm:p-3 rounded-lg text-center hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center">
                          {feature.icon}
                        </div>
                        <h4 className="font-medium text-gray-800 text-xs sm:text-sm leading-tight">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 text-xs leading-tight hidden sm:block">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl">📌</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                      Key Points:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>Approval takes 3-4 days</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>All controls in User Portal</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>Jobs & staff posts are public</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>Community notice board available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base transform active:scale-95"
                >
                  Let's Get Started! 🚀
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;
