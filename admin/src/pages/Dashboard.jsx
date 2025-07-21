import React, { useState, useEffect, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { assets } from "../assets/assets";
import axios from "axios";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalUsers: 0,
    totalDonations: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("families");

  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock API call - replace with actual API endpoints
  // Replace the fetchDashboardData function with this updated version:

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // First, get available years
        const yearsResponse = await axios.get(
          backendUrl + "/api/admin/available-years",
          { headers: { aToken } }
        );

        // Use real years data if available, otherwise fallback to mock
        if (yearsResponse.data.years && yearsResponse.data.years.length > 0) {
          setAvailableYears(yearsResponse.data.years);
        } else {
          // Fallback mock years
          const currentYear = new Date().getFullYear();
          const mockYears = [];
          for (let year = 2024; year <= currentYear; year++) {
            mockYears.push(year);
          }
          setAvailableYears(mockYears.reverse());
        }

        // Fetch data for selected year
        const [familiesResponse, usersResponse] = await Promise.all([
          axios.get(
            backendUrl + `/api/admin/family-count?year=${selectedYear}`,
            { headers: { aToken } }
          ),
          axios.get(backendUrl + `/api/admin/user-count?year=${selectedYear}`, {
            headers: { aToken },
          }),
        ]);

        // Extract real data from API responses
        const familyData = familiesResponse.data;
        const userData = usersResponse.data;

        // Calculate totals from monthly data
        const totalFamilies = familyData.totalCount || 0;

        const totalUsers = userData.totalUsers || 0;

        // Combine monthly data from both APIs
        const monthlyData = [];
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        for (let i = 0; i < 12; i++) {
          const familyMonth = familyData.monthlyData
            ? familyData.monthlyData.find((m) => m.month === months[i])
            : null;
          const userMonth = userData.monthlyData
            ? userData.monthlyData.find((m) => m.month === months[i])
            : null;

          monthlyData.push({
            month: months[i],
            families: familyMonth ? familyMonth.families : 0,
            users: userMonth
              ? userMonth.completeUsers + userMonth.incompleteUsers
              : 0,
            donations: Math.floor(Math.random() * 3000) + 1000, // Keep mock for now since no donations API
          });
        }

        const realStats = {
          totalFamilies: totalFamilies,
          totalUsers: totalUsers,
          totalDonations: Math.floor(Math.random() * 50000) + 10000, // Keep mock for now
          monthlyData: monthlyData,
        };
        console.log(realStats);
        setStats(realStats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Fallback to mock data on error
        const currentYear = new Date().getFullYear();
        const mockYears = [];
        for (let year = 2024; year <= currentYear; year++) {
          mockYears.push(year);
        }
        setAvailableYears(mockYears.reverse());

        // Your existing mock data as fallback
        const mockStats = {
          totalFamilies:
            selectedYear === currentYear
              ? 156
              : Math.floor(Math.random() * 200) + 50,
          totalUsers:
            selectedYear === currentYear
              ? 428
              : Math.floor(Math.random() * 500) + 100,
          totalDonations:
            selectedYear === currentYear
              ? 25000
              : Math.floor(Math.random() * 50000) + 10000,
          monthlyData: [
            // Your existing mock monthly data...
          ],
        };

        setStats(mockStats);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear, backendUrl, aToken]); // Updated dependencies

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, isLoading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          ) : (
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>
              {typeof value === "number" && title.includes("Donation")
                ? formatCurrency(value)
                : value.toLocaleString()}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <img src={icon} alt={title} className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      </div>
    </div>
  );

  const ChartToggle = ({ activeChart, setActiveChart }) => (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => setActiveChart("families")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeChart === "families"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Families
      </button>
      <button
        onClick={() => setActiveChart("users")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeChart === "users"
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Users
      </button>
      <button
        onClick={() => setActiveChart("donations")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeChart === "donations"
            ? "bg-purple-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Donations
      </button>
    </div>
  );

  const YearSelector = ({ selectedYear, setSelectedYear, availableYears }) => (
    <div className="flex items-center gap-3">
      <label
        htmlFor="year-select"
        className="text-sm font-medium text-gray-700"
      >
        Year:
      </label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your community.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Families"
          value={stats.totalFamilies}
          icon={assets.family_list}
          color="text-blue-600"
          isLoading={loading}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={assets.user_list}
          color="text-green-600"
          isLoading={loading}
        />
        <StatCard
          title="Total Donations"
          value={stats.totalDonations}
          icon={assets.donation_list}
          color="text-purple-600"
          isLoading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold text-gray-900">
              Monthly Analytics
            </h2>
            <YearSelector
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableYears={availableYears}
            />
          </div>
          <ChartToggle
            activeChart={activeChart}
            setActiveChart={setActiveChart}
          />
        </div>

        {loading ? (
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <div className="h-80 sm:h-96 -ml-10 sm:-ml-6">
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === "donations" ? (
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [formatCurrency(value), "Donations"]}
                  />
                  <Bar
                    dataKey="donations"
                    fill="#9333ea"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  {activeChart === "families" && (
                    <Line
                      type="monotone"
                      dataKey="families"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: "#2563eb", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#2563eb", strokeWidth: 2 }}
                      name="New Families"
                    />
                  )}
                  {activeChart === "users" && (
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ fill: "#16a34a", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#16a34a", strokeWidth: 2 }}
                      name="New Users"
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/family-list")}
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <img
              src={assets.family_list}
              alt="Family"
              className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Get Family
            </span>
          </button>

          <button
            onClick={() => navigate("/user-list")}
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <img
              src={assets.user_list}
              alt="See Users"
              className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              See Users
            </span>
          </button>

          <button
            onClick={() => navigate("/donation-list")}
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <img
              src={assets.donation_list}
              alt="Record Donation"
              className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Record Donation
            </span>
          </button>

          <button
            onClick={() => navigate("/notice-board")}
            className="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <img
              src={assets.notice_board}
              alt="Add Notice"
              className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Add Notice
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
