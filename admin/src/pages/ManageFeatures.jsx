import React, { useState, useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";

// This page will serve as the admin panel for your sidebar features.
const ManageFeatures = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState({
    featureName: "",
    link: "",
    iconName: "home_icon", // Default icon
  });
  const [editFeature, setEditFeature] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const iconOptions = [
    "home_icon",
    "family_list",
    "advertisement_list",
    "user_list",
    "staff_requirement_list",
    "job_opening_list",
    "notice_board",
    "donation_list",
    "manage_team",
    "user_receipt",
    "guest_receipt",
    "guest_list",
    "team_list",
    "family_tree",
    "printing_portal",
  ];

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/admin/list`, {
        headers: { aToken },
      });
      if (response.data.success) {
        setFeatures(response.data.data);
      } else {
        alert("Failed to fetch features");
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      alert("Error fetching features");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewFeature({ ...newFeature, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFeature({ ...editFeature, [e.target.name]: e.target.value });
  };

  const handleAddFeature = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/admin/add`,
        newFeature,
        {
          headers: { aToken },
        }
      );
      if (response.data.success) {
        // Success notification
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
        notification.textContent = "Feature added successfully!";
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);

        setNewFeature({ featureName: "", link: "", iconName: "home_icon" });
        fetchFeatures(); // Refresh list
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error adding feature:", error);
      alert("Error adding feature");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFeature = (feature) => {
    setEditFeature({
      _id: feature._id,
      featureName: feature.featureName,
      link: feature.link,
      iconName: feature.iconName,
      isActive: feature.isActive,
    });
    setShowEditModal(true);
  };

  const handleUpdateFeature = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        `${backendUrl}/api/admin/update/${editFeature._id}`,
        {
          featureName: editFeature.featureName,
          link: editFeature.link,
          iconName: editFeature.iconName,
          isActive: editFeature.isActive,
        },
        {
          headers: { aToken },
        }
      );
      if (response.data.success) {
        // Success notification
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
        notification.textContent = "Feature updated successfully!";
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);

        setShowEditModal(false);
        setEditFeature(null);
        fetchFeatures(); // Refresh list
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error updating feature:", error);
      alert("Error updating feature");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFeature = async (id, featureName) => {
    if (window.confirm(`Are you sure you want to delete "${featureName}"?`)) {
      try {
        setLoading(true);
        const response = await axios.post(
          `${backendUrl}/api/admin/remove`,
          { id },
          {
            headers: { aToken },
          }
        );
        if (response.data.success) {
          // Success notification
          const notification = document.createElement("div");
          notification.className =
            "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
          notification.textContent = "Feature deleted successfully!";
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);

          fetchFeatures(); // Refresh list
        } else {
          alert("Error removing feature");
        }
      } catch (error) {
        console.error("Error removing feature:", error);
        alert("Error removing feature");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActiveStatus = async (feature) => {
    try {
      const updatedStatus = { isActive: !feature.isActive };
      const response = await axios.put(
        `${backendUrl}/api/admin/update/${feature._id}`,
        updatedStatus,
        {
          headers: { aToken },
        }
      );
      if (response.data.success) {
        fetchFeatures(); // Refresh list
      } else {
        alert("Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFeature(null);
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ isActive, onToggle, disabled }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        isActive ? "bg-green-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  useEffect(() => {
    fetchFeatures();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Sidebar Features
          </h1>
          <p className="text-gray-600">
            Add, edit, and manage your application's sidebar features
          </p>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        )}

        {/* Add Feature Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add New Feature
            </h2>
          </div>

          <form
            onSubmit={handleAddFeature}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feature Name
              </label>
              <input
                type="text"
                name="featureName"
                value={newFeature.featureName}
                onChange={handleInputChange}
                placeholder="e.g., Dashboard"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link/Route
              </label>
              <input
                type="text"
                name="link"
                value={newFeature.link}
                onChange={handleInputChange}
                placeholder="e.g., /dashboard"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                name="iconName"
                value={newFeature.iconName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 font-medium shadow-sm"
                disabled={loading}
              >
                Add Feature
              </button>
            </div>
          </form>
        </div>

        {/* Features Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Features List
                </h2>
              </div>
              <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                {features.length} feature{features.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No features found
                        </h3>
                        <p className="text-gray-500">
                          Get started by adding your first sidebar feature
                          above.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  features.map((item, index) => (
                    <tr
                      key={item._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
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
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {item.featureName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {item.link}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.iconName
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <ToggleSwitch
                            isActive={item.isActive}
                            onToggle={() => toggleActiveStatus(item)}
                            disabled={loading}
                          />
                          <span
                            className={`text-xs font-medium ${
                              item.isActive ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleEditFeature(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                            disabled={loading}
                            title="Edit feature"
                          >
                            <svg
                              className="w-4 h-4 group-hover:scale-110 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleRemoveFeature(item._id, item.featureName)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                            disabled={loading}
                            title="Delete feature"
                          >
                            <svg
                              className="w-4 h-4 group-hover:scale-110 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Feature Modal */}
        {showEditModal && editFeature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl transform transition-all">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Edit Feature
                  </h3>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateFeature} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    name="featureName"
                    value={editFeature.featureName}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link/Route
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={editFeature.link}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <select
                    name="iconName"
                    value={editFeature.iconName}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Feature Status
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable or disable this feature
                    </p>
                  </div>
                  <ToggleSwitch
                    isActive={editFeature.isActive}
                    onToggle={() =>
                      setEditFeature({
                        ...editFeature,
                        isActive: !editFeature.isActive,
                      })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 font-medium"
                    disabled={loading}
                  >
                    Update Feature
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 transition-colors font-medium"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFeatures;
