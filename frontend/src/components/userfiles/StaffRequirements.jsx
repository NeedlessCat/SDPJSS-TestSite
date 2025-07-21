import React, { useEffect, useContext } from "react";
import { useState } from "react";
import { AppContext } from "../../context/AppContext";

import {
  Plus,
  Edit,
  Trash2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// StaffModal Component
const StaffModal = ({ isOpen, onClose, editingStaff, onSuccess }) => {
  const { utoken, backendUrl } = useContext(AppContext);

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    salary: "",
    staffType: "Full-time",
    availabilityDate: "",
    requirements: "",
    contact: {
      email: "",
      code: "+91",
      number: "",
    },
  });

  // Set form data when editing
  useEffect(() => {
    if (editingStaff) {
      setFormData({
        title: editingStaff.title || "",
        category: editingStaff.category || "",
        location: editingStaff.location || "",
        salary: editingStaff.salary?.toString() || "",
        staffType: editingStaff.staffType || "Full-time",
        availabilityDate: editingStaff.availabilityDate || "",
        description: editingStaff.description || "",
        requirements: editingStaff.requirements?.join(", ") || "",
        contact: {
          email: editingStaff.contact?.email || "",
          code: editingStaff.contact?.code || "+91",
          number: editingStaff.contact?.number || "",
        },
      });
    } else {
      // Reset form for new staff
      setFormData({
        title: "",
        category: "",
        location: "",
        salary: "",
        staffType: "Full-time",
        availabilityDate: "",
        description: "",
        requirements: "",
        contact: {
          email: "",
          code: "+91",
          number: "",
        },
      });
    }
  }, [editingStaff, isOpen]);

  // Handle staff requirement submission (create/update)
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.category ||
        !formData.location ||
        !formData.salary ||
        !formData.description ||
        !formData.contact.email ||
        !formData.contact.number
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Prepare the data
      const staffData = {
        ...formData,
        salary: parseFloat(formData.salary),
        requirements: formData.requirements
          .split(",")
          .map((req) => req.trim())
          .filter((req) => req),
        postedDate: new Date().toLocaleDateString(),
      };

      if (editingStaff) {
        staffData.staffId = editingStaff._id;
      }

      const url = editingStaff
        ? `${backendUrl}/api/user/edit-staff`
        : `${backendUrl}/api/user/add-staff`;

      const { data } = await axios.post(url, staffData, {
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
            {editingStaff
              ? "Edit Staff Requirement"
              : "Post New Staff Requirement"}
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
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Driver, Caretaker, Cook"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Transportation, Healthcare, Household"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Mumbai, Maharashtra"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary (₹) *
                </label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  placeholder="e.g., 25000"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.staffType}
                  onChange={(e) =>
                    setFormData({ ...formData, staffType: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  value={formData.availabilityDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availabilityDate: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Describe the staff role and responsibilities"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements (comma-separated)
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                rows={3}
                placeholder="e.g., Valid license, 3+ years experience, Good communication"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
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
              {editingStaff
                ? "Update Staff Requirement"
                : "Post Staff Requirement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffRequirements = () => {
  const { utoken, backendUrl } = useContext(AppContext);

  // Staff Requirements Component
  const [showModal, setShowModal] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState(null);

  // Load user staffs from backend
  const loadUserStaffs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(backendUrl + "/api/user/my-staffs", {
        headers: { utoken },
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setStaffs(data.staffRequirements || []);
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

  // Handle staff status change (open/close)
  const handleStatusChange = async (staffId, isOpen) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/user/update-staff-status",
        { staffId, isOpen },
        { headers: { utoken } }
      );
      console.log(data);
      if (data.success) {
        setStaffs(
          staffs.map((staff) =>
            staff._id === staffId ? { ...staff, isOpen } : staff
          )
        );
        alert(`Staff ${isOpen ? "opened" : "closed"} successfully!`);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  const handleClose = (staffId) => {
    handleStatusChange(staffId, false);
  };

  const handleOpen = (staffId) => {
    handleStatusChange(staffId, true);
  };

  // Handle staff deletion
  const handleDelete = async (staffId) => {
    if (
      !window.confirm("Are you sure you want to delete this staff requirement?")
    ) {
      return;
    }

    try {
      const { data } = await axios.delete(
        backendUrl + "/api/user/delete-staff",
        {
          headers: { utoken },
          data: { staffId },
        }
      );
      console.log(data);
      if (data.success) {
        setStaffs(staffs.filter((staff) => staff._id !== staffId));
        alert("Staff deleted successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  // Handle staff editing
  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setShowModal(true);
  };

  // Handle new staff
  const handleNewStaff = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    loadUserStaffs();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  const activeStaffs = staffs.filter((staff) => staff.isOpen).length;

  useEffect(() => {
    if (utoken) {
      loadUserStaffs();
    } else {
      setJobs([]);
      setIsLoading(false);
    }
  }, [utoken]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff openings...</p>
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
            Staff Openings
          </h1>
          <button
            onClick={handleNewStaff}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Post Staff Opening</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                <Briefcase className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Total Openings
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {staffs.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <Briefcase className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Active Openings
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {activeStaffs}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Listings */}
        <div className="space-y-4 sm:space-y-6">
          {staffs.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No staff openings yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by posting your first staff opening.
              </p>
              <button
                onClick={handleNewStaff}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Post Your First Staff Req.
              </button>
            </div>
          ) : (
            staffs.map((staff) => (
              <div
                key={staff._id}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                      {staff.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-block ${
                          staff.isOpen
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {staff.isOpen ? "Open" : "Closed"}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                        {staff.staffType}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-row gap-2 self-start sm:self-auto flex-shrink-0">
                    {staff.isOpen ? (
                      <button
                        onClick={() => handleClose(staff._id)}
                        className="px-3 sm:px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpen(staff._id)}
                        className="px-3 sm:px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        Open
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(staff)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={() => handleDelete(staff._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                  {staff.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Briefcase
                      size={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0 text-gray-400"
                    />
                    <span className="break-words">{staff.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0 text-gray-400"
                    />
                    <span className="break-words">{staff.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign
                      size={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0 text-gray-400"
                    />
                    <span>₹{staff.salary?.toLocaleString()}/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0 text-gray-400"
                    />
                    <span>From: {staff.availabilityDate || "Immediate"}</span>
                  </div>
                </div>

                {staff.requirements && staff.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                      Requirements:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {staff.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm break-words"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 border-t pt-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={14} className="flex-shrink-0 text-gray-400" />
                    <span className="break-all">{staff.contact?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="flex-shrink-0 text-gray-400" />
                    <span className="break-words">
                      {staff.contact?.code} {staff.contact?.number}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    Posted: {staff.postedDate}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Staff Modal */}
        <StaffModal
          isOpen={showModal}
          onClose={handleModalClose}
          editingStaff={editingStaff}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default StaffRequirements;
