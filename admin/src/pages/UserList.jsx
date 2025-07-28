import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Search,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Briefcase,
  GraduationCap,
  User,
  Activity,
  Loader2,
} from "lucide-react";
import { AdminContext } from "../context/AdminContext"; // Adjust import path as needed

const UserList = () => {
  const { userList, updateUserApproval, getUserList, aToken, backendUrl } =
    useContext(AdminContext);

  const [expandedUser, setExpandedUser] = useState(null); // Changed from Set to single string/null
  const [activeTab, setActiveTab] = useState("approved"); // new, approved, disapproved
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set()); // Track users being updated

  // Load users when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        await getUserList();
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (aToken) {
      loadUsers();
    }
  }, [aToken]);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = userList || [];

    // Filter by approval status
    if (activeTab === "new") {
      filtered = filtered.filter((user) => user.isApproved === "pending");
    } else if (activeTab === "approved") {
      filtered = filtered.filter((user) => user.isApproved === "approved");
    } else if (activeTab === "disapproved") {
      filtered = filtered.filter((user) => user.isApproved === "disabled");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, searchTerm, userList]);

  // Statistics
  const totalUsers = userList?.length || 0;
  const approvedUsers =
    userList?.filter((user) => user.isApproved === "approved").length || 0;
  const disapprovedUsers =
    userList?.filter((user) => user.isApproved === "disabled").length || 0;

  const toggleUserExpansion = (userId) => {
    // If clicking on the same user that's already expanded, collapse it
    // Otherwise, expand the clicked user (and collapse any previously expanded user)
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const handleApprovalChange = async (userId, newStatus) => {
    setUpdating((prev) => new Set(prev).add(userId));

    try {
      const response = await updateUserApproval(userId, newStatus);

      if (response && response.success) {
        // Success handled by updateUserApproval function
        console.log("User status updated successfully");
      } else {
        console.error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
        isActive
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label} ({count})
    </button>
  );

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage and view all registered users and their details
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
          color="text-blue-600"
        />
        <StatCard
          title="Approved Users"
          value={approvedUsers}
          icon={<UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />}
          color="text-green-600"
        />

        <StatCard
          title="Disapproved Users"
          value={disapprovedUsers}
          icon={<UserX className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />}
          color="text-red-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 sm:p-6">
          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search users by full name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
            />
          </div>

          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <TabButton
              id="approved"
              label="Approved"
              count={approvedUsers}
              isActive={activeTab === "approved"}
              onClick={setActiveTab}
            />
            <TabButton
              id="disapproved"
              label="Disapproved"
              count={disapprovedUsers}
              isActive={activeTab === "disapproved"}
              onClick={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm
                  ? "No users found matching your search."
                  : "No users in this category."}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isExpanded = expandedUser === user._id; // Changed from expandedUsers.has(user._id)
              const age = calculateAge(user.dob);
              const isUpdating = updating.has(user._id);

              return (
                <div key={user._id} className="p-3 sm:p-6">
                  {/* User Header */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1"
                      onClick={() => toggleUserExpansion(user._id)}
                    >
                      {/* User Image/Icon - Hidden on mobile, shown in expanded section */}
                      <div className="hidden sm:block w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.fullname}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">
                            {user.fullname || "N/A"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              ID:{" "}
                              {user.fatherid || user._id?.slice(-6) || "N/A"}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                user.gender === "male"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {user.gender === "male" ? "Male" : "Female"}
                            </span>
                          </div>
                        </div>

                        {/* Mobile-only status indicator */}
                        <div className="block sm:hidden text-xs text-gray-600">
                          <span
                            className={`font-medium ${
                              user.isApproved === "pending"
                                ? "text-orange-600"
                                : user.isApproved === "approved"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {user.isApproved === "pending"
                              ? "Pending"
                              : user.isApproved === "approved"
                              ? "Approved"
                              : "Disapproved"}
                          </span>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Approval Buttons */}
                    <div className="flex gap-2 justify-start sm:justify-end">
                      {/* Show appropriate buttons based on current status and tab */}
                      {activeTab === "new" && (
                        <>
                          <button
                            onClick={() =>
                              handleApprovalChange(user._id, "approved")
                            }
                            disabled={isUpdating}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve User"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleApprovalChange(user._id, "disabled")
                            }
                            disabled={isUpdating}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Disapprove User"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}

                      {activeTab === "approved" && (
                        <button
                          onClick={() =>
                            handleApprovalChange(user._id, "disabled")
                          }
                          disabled={isUpdating}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Disapprove User"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {activeTab === "disapproved" && (
                        <button
                          onClick={() =>
                            handleApprovalChange(user._id, "approved")
                          }
                          disabled={isUpdating}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve User"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded User Details */}
                  {isExpanded && (
                    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
                      {/* User Image/Icon - Only shown when expanded */}
                      <div className="flex items-center gap-3 sm:hidden">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.fullname}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Age: {age}</div>
                          <div>Job: {user.profession?.job || "N/A"}</div>
                          <div className="truncate">
                            {user.contact?.email || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                          <User className="w-4 h-4 sm:w-5 sm:h-5" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span>DOB: {formatDate(user.dob)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span>Blood Group: {user.bloodgroup || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span>
                              Status: {user.marriage?.maritalstatus || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Mother:</span>
                            <span>{user.mother || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Health:</span>
                            <span>{user.healthissue || "N/A"}</span>
                          </div>
                          {user.marriage?.spouse?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Spouse:</span>
                              <span>{user.marriage.spouse.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate">
                              {user.contact?.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span>
                              {user.contact?.mobileno?.code || ""}{" "}
                              {user.contact?.mobileno?.number || "N/A"}
                            </span>
                          </div>
                          {user.address && (
                            <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                              <span className="break-words">
                                {[
                                  user.address.apartment,
                                  user.address.street,
                                  user.address.city,
                                  user.address.state,
                                  user.address.pin,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "N/A"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional & Educational Information */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                          <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                            Professional Details
                          </h4>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-500">Category:</span>{" "}
                              {user.profession?.category || "N/A"}
                            </div>
                            <div>
                              <span className="text-gray-500">Job:</span>{" "}
                              {user.profession?.job || "N/A"}
                            </div>
                            {user.profession?.specialization && (
                              <div>
                                <span className="text-gray-500">
                                  Specialization:
                                </span>{" "}
                                {user.profession.specialization}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                          <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                            Educational Details
                          </h4>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-500">Level:</span>{" "}
                              {user.education?.upto || "N/A"}
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Qualification:
                              </span>{" "}
                              {user.education?.qualification || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Registration Info */}
                      <div className="bg-blue-50 rounded-xl p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-600">
                              Registered on:
                            </span>
                            <span className="font-medium ml-2">
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-xs sm:text-sm">
                              <span className="text-gray-600">
                                Profile Complete:
                              </span>
                              <span
                                className={`font-medium ml-2 ${
                                  user.isComplete
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}
                              >
                                {user.isComplete ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm">
                              <span className="text-gray-600">Status:</span>
                              <span
                                className={`font-medium ml-2 ${
                                  user.isApproved === "pending"
                                    ? "text-orange-600"
                                    : user.isApproved === "approved"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {user.isApproved === "pending"
                                  ? "Pending"
                                  : user.isApproved === "approved"
                                  ? "Approved"
                                  : "Disapproved"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
