import React, { useState, useEffect, useContext } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User,
  Filter,
  X,
  Search,
  ChevronDown,
  Clock,
} from "lucide-react";
import { AppContext } from "../context/AppContext";

const StaffPage = () => {
  const { backendUrl } = useContext(AppContext);

  // Sample data - replace with actual API call
  const [allStaffRequirements, setAllStaffRequirements] = useState([]);

  //Load all staffs from backend...
  const loadAllStaffs = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/c/get-staffs`);
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setAllStaffRequirements(data.staffRequirements || []);
      }
    } catch (error) {
      console.error("Error fetching staff requirements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllStaffs();
  }, []);

  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get unique locations
  const availableLocations = [
    ...new Set(allStaffRequirements.map((staff) => staff.location)),
  ];

  // Get unique date ranges (months)
  const getDateRanges = () => {
    const dates = allStaffRequirements.map(
      (staff) => new Date(staff.postedDate)
    );
    const uniqueMonths = [
      ...new Set(
        dates.map((date) => {
          return `${date.toLocaleString("default", {
            month: "long",
          })} ${date.getFullYear()}`;
        })
      ),
    ];
    return uniqueMonths.sort((a, b) => new Date(b) - new Date(a));
  };

  const availableDateRanges = getDateRanges();

  // Filter staff requirements
  useEffect(() => {
    let filtered = allStaffRequirements.filter((staff) => staff.isOpen);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (staff) =>
          staff.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((staff) =>
        selectedLocations.includes(staff.location)
      );
    }

    // Date range filter
    if (selectedDateRange.length > 0) {
      filtered = filtered.filter((staff) => {
        const staffDate = new Date(staff.postedDate);
        const staffMonth = `${staffDate.toLocaleString("default", {
          month: "long",
        })} ${staffDate.getFullYear()}`;
        return selectedDateRange.includes(staffMonth);
      });
    }

    // Sort by posted date (newest first)
    filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    setFilteredStaff(filtered);
  }, [allStaffRequirements, searchTerm, selectedLocations, selectedDateRange]);

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Handle location filter
  const handleLocationChange = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
  };

  // Handle date range filter
  const handleDateRangeChange = (dateRange) => {
    setSelectedDateRange((prev) =>
      prev.includes(dateRange)
        ? prev.filter((range) => range !== dateRange)
        : [...prev, dateRange]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocations([]);
    setSelectedDateRange([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            {/* Main Heading */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 tracking-tight text-gray-800">
                Choose Your Step
              </h1>
              <div className="w-16 h-1 bg-red-500 mx-auto rounded-full"></div>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore the range of services we offer below, including community
              interactions, donations, advertisements, and networking
              opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by job title, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
          </div>

          {/* Filter Buttons and Active Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Location Filter */}
            <div className="relative">
              <button
                onClick={() => setShowLocationFilter(!showLocationFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                  selectedLocations.length > 0
                    ? "bg-red-50 border-red-300 text-red-700 shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <Filter size={16} />
                Location{" "}
                {selectedLocations.length > 0 &&
                  `(${selectedLocations.length})`}
                <ChevronDown size={16} />
              </button>

              {showLocationFilter && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      Select Locations
                    </h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {availableLocations.map((location) => (
                      <label
                        key={location}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location)}
                          onChange={() => handleLocationChange(location)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          {location}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                  selectedDateRange.length > 0
                    ? "bg-red-50 border-red-300 text-red-700 shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <Calendar size={16} />
                Posted{" "}
                {selectedDateRange.length > 0 &&
                  `(${selectedDateRange.length})`}
                <ChevronDown size={16} />
              </button>

              {showDateFilter && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      Select Date Range
                    </h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {availableDateRanges.map((dateRange) => (
                      <label
                        key={dateRange}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDateRange.includes(dateRange)}
                          onChange={() => handleDateRangeChange(dateRange)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          {dateRange}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {(searchTerm ||
              selectedLocations.length > 0 ||
              selectedDateRange.length > 0) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedLocations.length > 0 || selectedDateRange.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                >
                  {location}
                  <button
                    onClick={() => handleLocationChange(location)}
                    className="hover:text-red-900 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedDateRange.map((dateRange) => (
                <span
                  key={dateRange}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {dateRange}
                  <button
                    onClick={() => handleDateRangeChange(dateRange)}
                    className="hover:text-blue-900 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            Showing {filteredStaff.length} of{" "}
            {allStaffRequirements.filter((s) => s.isOpen).length} open positions
          </p>
        </div>

        {/* Staff Listings */}
        <div className="space-y-6">
          {filteredStaff.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No staff positions found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <button
                onClick={clearFilters}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredStaff.map((staff) => (
              <div
                key={staff._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                  <div className="flex flex-col gap-3 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {staff.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Open Position
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {staff.staffType}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Salary Display */}
                  <div className="flex-shrink-0 lg:text-right">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl shadow-md">
                      <div className="flex items-center gap-2 justify-center lg:justify-end">
                        <div>
                          <div className="text-2xl font-bold leading-tight">
                            ₹{staff.salary?.toLocaleString()}
                          </div>
                          <div className="text-sm text-red-100 font-medium">
                            per month
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {staff.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Briefcase className="text-red-600 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Category
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {staff.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="text-blue-600 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {staff.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="text-green-600 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Available From
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {staff.availabilityDate
                          ? new Date(
                              staff.availabilityDate
                            ).toLocaleDateString()
                          : "Immediate"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="text-purple-600 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Posted
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {staff.postedDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {staff.requirements && staff.requirements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Requirements:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {staff.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="text-gray-600 w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Posted By
                        </p>
                        <p className="font-semibold text-gray-900">
                          {staff.userFullname}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        <a
                          href={`mailto:${staff.contact?.email}`}
                          className="hover:text-red-600 transition-colors break-all font-medium"
                        >
                          {staff.contact?.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <a
                          href={`tel:${staff.contact?.code}${staff.contact?.number}`}
                          className="hover:text-red-600 transition-colors font-medium"
                        >
                          {staff.contact?.code} {staff.contact?.number}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Click outside to close filters */}
      {(showLocationFilter || showDateFilter) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowLocationFilter(false);
            setShowDateFilter(false);
          }}
        />
      )}
    </div>
  );
};

export default StaffPage;
