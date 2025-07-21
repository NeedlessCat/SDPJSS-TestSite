import React, { useEffect, useContext } from "react";
import { useState } from "react";
import { AppContext } from "../../context/AppContext";

import {
  Plus,
  Edit,
  Trash2,
  Megaphone,
  MapPin,
  Calendar,
  Phone,
  Mail,
  X,
  Tag,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// AdvertisementModal Component
const AdvertisementModal = ({ isOpen, onClose, editingAd, onSuccess }) => {
  const { utoken, backendUrl } = useContext(AppContext);

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    validFrom: "",
    validUntil: "",
    contact: {
      email: "",
      code: "+91",
      number: "",
    },
  });

  // Set form data when editing
  useEffect(() => {
    if (editingAd) {
      setFormData({
        title: editingAd.title || "",
        category: editingAd.category || "",
        description: editingAd.description || "",
        location: editingAd.location || "",
        validFrom: editingAd.validFrom
          ? new Date(editingAd.validFrom).toISOString().split("T")[0]
          : "",
        validUntil: editingAd.validUntil
          ? new Date(editingAd.validUntil).toISOString().split("T")[0]
          : "",
        contact: {
          email: editingAd.contact?.email || "",
          code: editingAd.contact?.code || "+91",
          number: editingAd.contact?.number || "",
        },
      });
    } else {
      // Reset form for new advertisement
      setFormData({
        title: "",
        category: "",
        description: "",
        location: "",
        validFrom: "",
        validUntil: "",
        contact: {
          email: "",
          code: "+91",
          number: "",
        },
      });
    }
  }, [editingAd, isOpen]);

  // Handle advertisement submission (create/update)
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.validFrom ||
        !formData.validUntil ||
        !formData.contact.email ||
        !formData.contact.number
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate dates
      const fromDate = new Date(formData.validFrom);
      const untilDate = new Date(formData.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fromDate >= untilDate) {
        alert("Valid Until date must be after Valid From date");
        return;
      }

      if (fromDate < today) {
        alert("Valid From date cannot be in the past");
        return;
      }

      // Prepare the data
      const adData = {
        ...formData,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        postedDate: new Date().toLocaleDateString(),
      };

      if (editingAd) {
        adData.adId = editingAd._id;
      }

      const url = editingAd
        ? `${backendUrl}/api/user/edit-advertisement`
        : `${backendUrl}/api/user/add-advertisement`;

      const { data } = await axios.post(url, adData, {
        headers: { utoken },
      });

      console.log(data);

      if (data.success) {
        toast.success(data.message);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-red-600">
            {editingAd ? "Edit Advertisement" : "Post New Advertisement"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advertisement Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Grand Opening Sale, Wedding Services"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Category</option>
                  <option value="Event">Event</option>
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                  <option value="Offer">Offer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From *
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  min={
                    formData.validFrom || new Date().toISOString().split("T")[0]
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Mumbai, Maharashtra"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Describe your advertisement details"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                required
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="contact@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.contact.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            code: e.target.value,
                          },
                        })
                      }
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                      <option value="+971">+971</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.contact.number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            number: e.target.value,
                          },
                        })
                      }
                      placeholder="9876543210"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              {editingAd ? "Update Advertisement" : "Post Advertisement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Advertisements = () => {
  const { utoken, backendUrl } = useContext(AppContext);

  // Advertisements Component
  const [showModal, setShowModal] = useState(false);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAd, setEditingAd] = useState(null);

  // Load user advertisements from backend
  const loadUserAds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(backendUrl + "/api/user/my-advertisements", {
        headers: { utoken },
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setAds(data.advertisements || []);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle advertisement status change (active/inactive)
  const handleStatusChange = async (adId, isActive) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/user/update-advertisement-status",
        { adId, isActive },
        { headers: { utoken } }
      );
      console.log(data);
      if (data.success) {
        setAds(ads.map((ad) => (ad._id === adId ? { ...ad, isActive } : ad)));
        alert(
          `Advertisement ${
            isActive ? "activated" : "deactivated"
          } successfully!`
        );
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  const handleDeactivate = (adId) => {
    handleStatusChange(adId, false);
  };

  const handleActivate = (adId) => {
    handleStatusChange(adId, true);
  };

  // Handle advertisement deletion
  const handleDelete = async (adId) => {
    if (
      !window.confirm("Are you sure you want to delete this advertisement?")
    ) {
      return;
    }

    try {
      const { data } = await axios.delete(
        backendUrl + "/api/user/delete-advertisement",
        {
          headers: { utoken },
          data: { adId },
        }
      );
      console.log(data);
      if (data.success) {
        setAds(ads.filter((ad) => ad._id !== adId));
        alert("Advertisement deleted successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  // Handle advertisement editing
  const handleEdit = (ad) => {
    setEditingAd(ad);
    setShowModal(true);
  };

  // Handle new advertisement
  const handleNewAd = () => {
    setEditingAd(null);
    setShowModal(true);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    loadUserAds();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setEditingAd(null);
  };

  // Check if advertisement is expired
  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const activeAds = ads.filter(
    (ad) => ad.isActive && !isExpired(ad.validUntil)
  ).length;
  const expiredAds = ads.filter((ad) => isExpired(ad.validUntil)).length;

  useEffect(() => {
    if (utoken) {
      loadUserAds();
    } else {
      setAds([]);
      setIsLoading(false);
    }
  }, [utoken]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading advertisements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Advertisements
          </h1>
          <button
            onClick={handleNewAd}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Post Advertisement</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                <Megaphone className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm">Total Ads</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {ads.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <Megaphone className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm">Active Ads</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {activeAds}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <Calendar className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm">Expired Ads</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {expiredAds}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advertisement Listings */}
        <div className="space-y-4 sm:space-y-6">
          {ads.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No advertisements yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by posting your first advertisement.
              </p>
              <button
                onClick={handleNewAd}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Post Your First Ad
              </button>
            </div>
          ) : (
            ads.map((ad) => (
              <div
                key={ad._id}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                      {ad.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-block ${
                          isExpired(ad.validUntil)
                            ? "bg-red-100 text-red-800"
                            : ad.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isExpired(ad.validUntil)
                          ? "Expired"
                          : ad.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                      {ad.category && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                          {ad.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-row gap-2 self-start sm:self-auto flex-shrink-0">
                    {!isExpired(ad.validUntil) &&
                      (ad.isActive ? (
                        <button
                          onClick={() => handleDeactivate(ad._id)}
                          className="px-3 sm:px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(ad._id)}
                          className="px-3 sm:px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
                        >
                          Activate
                        </button>
                      ))}
                    <button
                      onClick={() => handleEdit(ad)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                  {ad.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 text-xs sm:text-sm text-gray-600">
                  {ad.location && (
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={14}
                        className="sm:w-4 sm:h-4 flex-shrink-0 text-gray-400"
                      />
                      <span className="break-words">{ad.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0 text-gray-400"
                    />
                    <span>From: {formatDate(ad.validFrom)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0 text-gray-400"
                    />
                    <span>Until: {formatDate(ad.validUntil)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 border-t pt-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={14} className="flex-shrink-0 text-gray-400" />
                    <span className="break-all">{ad.contact?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="flex-shrink-0 text-gray-400" />
                    <span className="break-words">
                      {ad.contact?.code} {ad.contact?.number}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    Posted: {formatDate(ad.postedDate)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Advertisement Modal */}
        <AdvertisementModal
          isOpen={showModal}
          onClose={handleModalClose}
          editingAd={editingAd}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default Advertisements;
