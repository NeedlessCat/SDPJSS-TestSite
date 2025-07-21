import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import {
  Calendar,
  DollarSign,
  Filter,
  X,
  Search,
  Check,
  X as Cross,
  AlertCircle,
} from "lucide-react";

const DonationList = () => {
  const [expandedDonation, setExpandedDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    user: "",
    search: "",
  });
  const [availableYears, setAvailableYears] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Get context values
  const {
    donationList,
    getDonationList,
    aToken,
    totalDonation,
    getTotalDonationData,
    userList,
    getUserList,
  } = useContext(AdminContext);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!aToken) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await getTotalDonationData();
        await getDonationList();
        await getUserList();
        setError(null);
      } catch (err) {
        setError("Failed to fetch donations");
        console.error("Error fetching donations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [aToken]);

  // Extract available years from donations
  useEffect(() => {
    if (donationList && donationList.length > 0) {
      const years = [
        ...new Set(
          donationList.map((d) => new Date(d.createdAt).getFullYear())
        ),
      ].sort((a, b) => b - a);
      setAvailableYears(years);
    }
  }, [donationList]);

  // Prepare user options for filter
  useEffect(() => {
    if (userList && userList.length > 0) {
      const users = userList.map((user) => ({
        value: user._id,
        label: user.fullname,
      }));
      setAvailableUsers(users);
    }
  }, [userList]);

  // Group donations by user
  const groupDonationsByUser = (donations) => {
    const grouped = {};
    donations.forEach((donation) => {
      const userId = donation.userId._id;
      if (!grouped[userId]) {
        grouped[userId] = {
          userId: userId,
          username: donation.userId.fullname || "Unknown User",
          userEmail: donation.userId.email || "No email provided",
          donations: [],
        };
      }
      grouped[userId].donations.push(donation);
    });

    return Object.values(grouped);
  };

  // Filter donations based on filters
  const filteredDonations = donationList
    ? donationList.filter((donation) => {
        const donationDate = new Date(donation.createdAt);
        const donationMonth = donationDate.getMonth() + 1;
        const donationYear = donationDate.getFullYear();

        if (filters.month && donationMonth !== parseInt(filters.month)) {
          return false;
        }
        if (filters.year && donationYear !== parseInt(filters.year)) {
          return false;
        }
        if (filters.user && donation.userId._id !== filters.user) {
          return false;
        }
        if (
          filters.search &&
          !donation.userId.fullname
            .toLowerCase()
            .includes(filters.search.toLowerCase()) &&
          !donation.purpose.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
    : [];

  // Calculate statistics
  const totalDonations = filteredDonations.length;
  const completedDonations = filteredDonations.filter(
    (d) => d.paymentStatus === "completed"
  ).length;
  const totalAmount = filteredDonations
    .filter((d) => d.paymentStatus === "completed")
    .reduce((sum, d) => sum + d.amount, 0);
  const groupedData = groupDonationsByUser(filteredDonations);
  const totalDonors = groupedData.length;

  const toggleDonationExpansion = (donationId) => {
    setExpandedDonation(expandedDonation === donationId ? null : donationId);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 sm:p-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-sm sm:text-base font-bold ${color}`}>
            {typeof value === "number" && title.includes("Amount")
              ? `₹${value.toLocaleString("en-IN")}`
              : value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-1 sm:p-2 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <span className="text-sm sm:text-base">{icon}</span>
        </div>
      </div>
    </div>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <Check size={14} className="text-green-600" />;
      case "failed":
        return <Cross size={14} className="text-red-600" />;
      case "pending":
        return <AlertCircle size={14} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "Cash":
        return "bg-yellow-100 text-yellow-800";
      case "UPI":
        return "bg-blue-100 text-blue-800";
      case "Card":
        return "bg-purple-100 text-purple-800";
      case "Online":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!donationList || donationList.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <div className="w-full max-w-none px-2 sm:px-4 lg:px-8 py-2 sm:py-6 lg:py-8">
          <div className="mb-3 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Donations
            </h1>
            <p className="text-xs sm:text-sm lg:text-lg text-gray-600">
              View all donations made by users
            </p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-6xl mb-4">💸</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Donations Available
            </h2>
            <p className="text-gray-600">
              There are currently no donations recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-8 py-2 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
            Donations
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            View all donations made by users
          </p>
        </div>

        {/* Statistics Cards - Compact */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard
            title="Total"
            value={totalDonations}
            icon="💸"
            color="text-blue-600"
          />
          <StatCard
            title="Completed"
            value={completedDonations}
            icon={<Check size={14} />}
            color="text-green-600"
          />
          <StatCard
            title="Amount"
            value={totalAmount}
            icon="₹"
            color="text-purple-600"
          />
        </div>

        {/* Filters - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="text-blue-500 w-4 h-4" />
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Month Filter */}
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: e.target.value })
              }
              className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const date = new Date(2000, month - 1, 1);
                return (
                  <option key={month} value={month}>
                    {date.toLocaleString("default", { month: "short" })}
                  </option>
                );
              })}
            </select>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* User Filter */}
            <select
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 col-span-2"
            >
              <option value="">All Users</option>
              {availableUsers.map((user) => (
                <option key={user.value} value={user.value}>
                  {user.label}
                </option>
              ))}
            </select>

            {/* Search Filter */}
            <div className="relative col-span-2">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search..."
                className="w-full pl-7 p-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-2 flex justify-end">
            <button
              onClick={() =>
                setFilters({
                  month: "",
                  year: "",
                  user: "",
                  search: "",
                })
              }
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
            >
              <X size={12} />
              Clear
            </button>
          </div>
        </div>

        {/* Donations List - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              All Donations ({totalDonations})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {groupedData.map((user) => (
              <div key={user.userId}>
                {user.donations.map((donation, index) => {
                  const isExpanded = expandedDonation === donation._id;
                  const isFirstDonation = index === 0;

                  return (
                    <div key={donation._id}>
                      {/* Donor Separator - only show for first donation of each donor */}
                      {isFirstDonation && (
                        <div className="px-3 py-1 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-500 truncate">
                              {user.username}
                            </span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                          </div>
                        </div>
                      )}

                      {/* Donation Item - Compact */}
                      <div className="p-2">
                        <div
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors gap-1"
                          onClick={() => toggleDonationExpansion(donation._id)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {getStatusIcon(donation.paymentStatus)}
                            </div>

                            {/* Main Content */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-semibold text-gray-900 truncate">
                                  ₹{donation.amount.toLocaleString("en-IN")}
                                </span>
                                <span className="hidden xs:inline text-xs text-gray-500 truncate">
                                  - {donation.purpose}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span
                                  className={`px-1 py-0.5 rounded text-xs ${getMethodColor(
                                    donation.method
                                  )}`}
                                >
                                  {donation.method}
                                </span>
                                <span>{formatDate(donation.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow Button */}
                          <button className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded transition-colors">
                            <span className="text-gray-500 text-xs font-mono">
                              {isExpanded ? "v" : ">"}
                            </span>
                          </button>
                        </div>

                        {/* Expanded Details - Compact */}
                        {isExpanded && (
                          <div className="mt-1 space-y-1 bg-gray-50 rounded p-2 text-xs">
                            <div className="grid grid-cols-2 gap-1">
                              <div>
                                <p className="text-gray-500">Transaction ID</p>
                                <p className="font-medium truncate">
                                  {donation.transactionId || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-medium">
                                  {new Date(
                                    donation.createdAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              {donation.profession && (
                                <div className="col-span-2">
                                  <p className="text-gray-500">Profession</p>
                                  <p className="font-medium">
                                    {donation.profession}
                                  </p>
                                </div>
                              )}
                            </div>

                            {donation.remarks && (
                              <div>
                                <p className="text-gray-500">Remarks</p>
                                <p className="font-medium">
                                  {donation.remarks}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationList;
