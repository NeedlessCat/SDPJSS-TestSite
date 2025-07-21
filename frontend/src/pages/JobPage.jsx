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

const JobPage = () => {
  const { backendUrl } = useContext(AppContext);

  // State management
  const [allJobOpenings, setAllJobOpenings] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showJobTypeFilter, setShowJobTypeFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load all job openings from backend
  const loadAllJobOpenings = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/c/get-jobs`);
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setAllJobOpenings(data.jobOpenings || []);
      }
    } catch (error) {
      console.error("Error fetching job openings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllJobOpenings();
  }, []);

  // Get unique locations
  const availableLocations = [
    ...new Set(allJobOpenings.map((job) => job.location)),
  ];

  // Get unique job types
  const availableJobTypes = [
    ...new Set(allJobOpenings.map((job) => job.jobType)),
  ];

  // Get unique date ranges (months)
  const getDateRanges = () => {
    const dates = allJobOpenings.map((job) => new Date(job.postedDate));
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

  // Filter job openings
  useEffect(() => {
    let filtered = allJobOpenings.filter((job) => job.isOpen);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((job) =>
        selectedLocations.includes(job.location)
      );
    }

    // Job type filter
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter((job) =>
        selectedJobTypes.includes(job.jobType)
      );
    }

    // Date range filter
    if (selectedDateRange.length > 0) {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.postedDate);
        const jobMonth = `${jobDate.toLocaleString("default", {
          month: "long",
        })} ${jobDate.getFullYear()}`;
        return selectedDateRange.includes(jobMonth);
      });
    }

    // Sort by posted date (newest first)
    filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    setFilteredJobs(filtered);
  }, [
    allJobOpenings,
    searchTerm,
    selectedLocations,
    selectedDateRange,
    selectedJobTypes,
  ]);

  // Handle location filter
  const handleLocationChange = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
  };

  // Handle job type filter
  const handleJobTypeChange = (jobType) => {
    setSelectedJobTypes((prev) =>
      prev.includes(jobType)
        ? prev.filter((type) => type !== jobType)
        : [...prev, jobType]
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
    setSelectedJobTypes([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job opportunities...</p>
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
                Find Your Next Opportunity
              </h1>
              <div className="w-16 h-1 bg-red-500 mx-auto rounded-full"></div>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover exciting job opportunities across various categories and
              locations. Connect with employers and take the next step in your
              career journey.
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

            {/* Job Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowJobTypeFilter(!showJobTypeFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                  selectedJobTypes.length > 0
                    ? "bg-red-50 border-red-300 text-red-700 shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <Briefcase size={16} />
                Job Type{" "}
                {selectedJobTypes.length > 0 && `(${selectedJobTypes.length})`}
                <ChevronDown size={16} />
              </button>

              {showJobTypeFilter && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      Select Job Types
                    </h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {availableJobTypes.map((jobType) => (
                      <label
                        key={jobType}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedJobTypes.includes(jobType)}
                          onChange={() => handleJobTypeChange(jobType)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{jobType}</span>
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
              selectedDateRange.length > 0 ||
              selectedJobTypes.length > 0) && (
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
          {(selectedLocations.length > 0 ||
            selectedDateRange.length > 0 ||
            selectedJobTypes.length > 0) && (
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
              {selectedJobTypes.map((jobType) => (
                <span
                  key={jobType}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {jobType}
                  <button
                    onClick={() => handleJobTypeChange(jobType)}
                    className="hover:text-green-900 transition-colors"
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
            Showing {filteredJobs.length} of{" "}
            {allJobOpenings.filter((j) => j.isOpen).length} open positions
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No job openings found
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
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                  <div className="flex flex-col gap-3 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Open Position
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {job.jobType}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Salary Display */}
                  <div className="flex-shrink-0 lg:text-right">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl shadow-md">
                      <div className="flex items-center gap-2 justify-center lg:justify-end">
                        <div>
                          <div className="text-2xl font-bold leading-tight">
                            ₹{job.salary?.toLocaleString()}
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
                  {job.description}
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
                        {job.category}
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
                        {job.location}
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
                        {job.availabilityDate
                          ? new Date(job.availabilityDate).toLocaleDateString()
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
                        {job.postedDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Requirements:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
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
                          {job.userFullname}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        <a
                          href={`mailto:${job.contact?.email}`}
                          className="hover:text-red-600 transition-colors break-all font-medium"
                        >
                          {job.contact?.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <a
                          href={`tel:${job.contact?.code}${job.contact?.number}`}
                          className="hover:text-red-600 transition-colors font-medium"
                        >
                          {job.contact?.code} {job.contact?.number}
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
      {(showLocationFilter || showDateFilter || showJobTypeFilter) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowLocationFilter(false);
            setShowDateFilter(false);
            setShowJobTypeFilter(false);
          }}
        />
      )}
    </div>
  );
};

export default JobPage;
