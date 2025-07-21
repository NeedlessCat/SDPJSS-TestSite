import React, { useState, useMemo, useContext } from "react";
import {
  Calendar,
  Filter,
  DollarSign,
  Package,
  Clock,
  CreditCard,
  Truck,
  Heart,
  RefreshCw,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";

const DonationSection = () => {
  const { donations, donationsLoading, loadUserDonations, userData } =
    useContext(AppContext);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get unique years and categories
  const availableYears = useMemo(() => {
    if (!donations || donations.length === 0) return [currentYear];

    const years = [
      ...new Set(
        donations.map((donation) => new Date(donation.date).getFullYear())
      ),
    ];
    return years.sort((a, b) => b - a);
  }, [donations]);

  const availableCategories = useMemo(() => {
    if (!donations || donations.length === 0) return ["All"];

    const categories = new Set(["All"]);
    donations.forEach((donation) => {
      donation.list.forEach((item) => categories.add(item.category));
    });
    return Array.from(categories);
  }, [donations]);

  // Filter donations based on selected year and category
  const filteredDonations = useMemo(() => {
    if (!donations || donations.length === 0) return [];

    return donations.filter((donation) => {
      const donationYear = new Date(donation.date).getFullYear();
      const yearMatch = donationYear === selectedYear;

      if (selectedCategory === "All") return yearMatch;

      const categoryMatch = donation.list.some(
        (item) => item.category === selectedCategory
      );
      return yearMatch && categoryMatch;
    });
  }, [donations, selectedYear, selectedCategory]);

  // Calculate total donation for the selected year
  const totalYearlyDonation = useMemo(() => {
    if (!donations || donations.length === 0) return 0;

    const yearDonations = donations.filter(
      (donation) => new Date(donation.date).getFullYear() === selectedYear
    );
    return yearDonations.reduce(
      (total, donation) =>
        total + donation.amount + (donation.courierCharge || 0),
      0
    );
  }, [donations, selectedYear]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleRefresh = () => {
    loadUserDonations();
  };

  if (donationsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center mb-4">
          <Heart className="w-8 h-8 text-red-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
          <Heart className="w-8 h-8 text-red-500 ml-3" />
        </div>
        <p className="text-gray-600">
          Track your contributions and make a difference in the world
        </p>
      </div>

      {/* Total Donation Card */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">
              Total Donations for {selectedYear}
            </h2>
            <p className="text-3xl font-bold mt-2">
              ₹{totalYearlyDonation.toLocaleString()}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Filter by Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="space-y-4">
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
            <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No donations found
            </h3>
            <p className="text-gray-500">
              {donations.length === 0
                ? "You haven't made any donations yet. Start your journey of giving today!"
                : "No donations match your current filters. Try adjusting your search criteria."}
            </p>
          </div>
        ) : (
          filteredDonations.map((donation) => (
            <div
              key={donation._id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-lg hover:border-red-200 transition-all duration-200"
            >
              <div className="p-4 sm:p-6 relative">
                {/* Decorative heart */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <DollarSign className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        ₹{donation.amount.toLocaleString()}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(donation.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        donation.paymentStatus
                      )}`}
                    >
                      {donation.paymentStatus.charAt(0).toUpperCase() +
                        donation.paymentStatus.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {donation.method}
                    </span>
                  </div>
                </div>

                {/* Donation Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Donation Items:
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {donation.list.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.category}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                            {item.isPacket && (
                              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-1">
                                Packet
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{item.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-4 h-4 mr-1" />
                    Courier Charge: ₹{donation.courierCharge || 0}
                  </div>

                  {donation.transactionId && (
                    <div className="text-sm text-gray-600">
                      Transaction ID:{" "}
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {donation.transactionId}
                      </span>
                    </div>
                  )}
                </div>

                {donation.remarks && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <p className="text-sm text-red-900">
                      <strong>Remarks:</strong> {donation.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredDonations.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredDonations.length}
              </p>
              <p className="text-sm text-gray-600">Total Donations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-600">
                ₹
                {filteredDonations
                  .reduce((sum, d) => sum + d.amount, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Donation Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">
                ₹
                {filteredDonations
                  .reduce((sum, d) => sum + (d.courierCharge || 0), 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Courier Charges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationSection;
