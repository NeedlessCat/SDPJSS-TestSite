import React, { useState, useEffect, useContext } from "react";
import {
  Search,
  Users,
  Phone,
  MapPin,
  Calendar,
  User,
  UserCheck,
} from "lucide-react";
import { AdminContext } from "../context/AdminContext";

const GuestList = () => {
  const [guestUsers, setGuestUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const { backendUrl } = useContext(AdminContext);

  // Fetch guest users from API
  useEffect(() => {
    fetchGuestUsers();
  }, []);

  // Handle window resize to update cards per row
  useEffect(() => {
    const updateCardsPerRow = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerRow(3);
      } else if (window.innerWidth >= 1024) {
        setCardsPerRow(2);
      } else {
        setCardsPerRow(1);
      }
    };

    updateCardsPerRow();
    window.addEventListener("resize", updateCardsPerRow);
    return () => window.removeEventListener("resize", updateCardsPerRow);
  }, []);

  const fetchGuestUsers = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(
        backendUrl + "/api/additional/all-guest-users"
      );
      const data = await response.json();

      if (data.success) {
        setGuestUsers(data.guestUsers);
        setFilteredUsers(data.guestUsers);
      } else {
        setError("Failed to fetch guest users");
      }
    } catch (err) {
      setError("Error fetching guest users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(guestUsers);
    } else {
      const filtered = guestUsers.filter(
        (user) =>
          user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.father?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.contact?.mobileno?.number?.includes(searchTerm) ||
          user.address?.city
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, guestUsers]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleCardExpansion = (userId, index) => {
    const currentRow = Math.floor(index / cardsPerRow);
    const newExpandedCards = new Set();

    // Find all cards in other rows that are expanded and remove them
    expandedCards.forEach((expandedIndex) => {
      const expandedRow = Math.floor(expandedIndex / cardsPerRow);
      if (expandedRow === currentRow) {
        newExpandedCards.add(expandedIndex);
      }
    });

    // Toggle current card
    if (expandedCards.has(index)) {
      newExpandedCards.delete(index);
    } else {
      newExpandedCards.add(index);
    }

    setExpandedCards(newExpandedCards);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>{error}</p>
            <button
              onClick={fetchGuestUsers}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Guest Users
                </h1>
                <p className="text-gray-600">
                  Manage and view all guest user accounts
                </p>
              </div>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, mobile, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Guest Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No guests found" : "No guest users yet"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Guest users will appear here once they make donations"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user, index) => {
              const isExpanded = expandedCards.has(index);
              return (
                <div
                  key={user._id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 ${
                    isExpanded ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {user.fullname || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCardExpansion(user._id, index)}
                        className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    </div>

                    {/* Expandable User Details */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="space-y-3 pt-2">
                        {/* Father's Name */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Father's Name
                            </p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.father || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                          <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Mobile
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {user.contact?.mobileno?.code}{" "}
                              {user.contact?.mobileno?.number || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Address
                            </p>
                            <div className="text-sm text-gray-900">
                              {user.address?.street &&
                                user.address.street !== "N/A" && (
                                  <p className="truncate">
                                    {user.address.street}
                                  </p>
                                )}
                              <p className="truncate">
                                {[
                                  user.address?.city !== "N/A"
                                    ? user.address?.city
                                    : "",
                                  user.address?.state !== "N/A"
                                    ? user.address?.state
                                    : "",
                                  user.address?.pin !== "N/A"
                                    ? user.address?.pin
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "N/A"}
                              </p>
                              {user.address?.country &&
                                user.address.country !== "N/A" && (
                                  <p className="text-gray-600">
                                    {user.address.country}
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Registration Date */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Registered
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Guest User
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Footer */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-gray-600">
                Showing {filteredUsers.length} of {guestUsers.length} guest
                users
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors self-start sm:self-auto"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestList;
