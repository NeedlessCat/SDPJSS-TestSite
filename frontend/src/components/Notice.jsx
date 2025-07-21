import React, { useState, useEffect, useContext } from "react";
import {
  Bell,
  Calendar,
  AlertTriangle,
  Info,
  Award,
  Users,
  BookOpen,
  Zap,
  Heart,
  Star,
} from "lucide-react";
import { AppContext } from "../context/AppContext"; // Adjust the import path as needed

// Function to get time ago from timestamp
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMs = now - postTime;

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (months < 12) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
};

// Icon mapping to get the component from string name
const getIconComponent = (iconName) => {
  const iconMap = {
    Bell,
    Calendar,
    AlertTriangle,
    Info,
    Award,
    Users,
    BookOpen,
    Zap,
    Heart,
    Star,
  };
  return iconMap[iconName] || Info; // Default to Info icon if not found
};

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { backendUrl } = useContext(AppContext);

  // Fetch notices from backend
  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/c/notice-list`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Assuming the API returns notices in data.notices or directly as data
      const noticesData = data.notices || data;
      setNotices(noticesData);
    } catch (err) {
      console.error("Error fetching notices:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backendUrl) {
      fetchNotices();
    }
  }, [backendUrl]);

  // Loading state
  if (loading) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-16 text-gray-800"
        id="stepsmenu"
      >
        <h1 className="text-3xl font-medium">Notifications Board</h1>
        <p className="sm:w-1/3 text-center text-sm">
          Stay updated with the latest announcements, events, and important
          community updates here.
        </p>
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-16 text-gray-800"
        id="stepsmenu"
      >
        <h1 className="text-3xl font-medium">Notifications Board</h1>
        <p className="sm:w-1/3 text-center text-sm">
          Stay updated with the latest announcements, events, and important
          community updates here.
        </p>
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Failed to load notifications</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button
                onClick={fetchNotices}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (notices.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-16 text-gray-800"
        id="stepsmenu"
      >
        <h1 className="text-3xl font-medium">Notifications Board</h1>
        <p className="sm:w-1/3 text-center text-sm">
          Stay updated with the latest announcements, events, and important
          community updates here.
        </p>
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-gray-800"
      id="stepsmenu"
    >
      <h1 className="text-3xl font-medium">Notifications Board</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Stay updated with the latest announcements, events, and important
        community updates here.
      </p>
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-[400px] overflow-y-auto">
          {notices.map((notice) => {
            const IconComponent = getIconComponent(notice.icon);
            return (
              <div
                key={notice._id}
                className="p-4 border-b border-orange-100 hover:bg-orange-50 transition-colors duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <IconComponent className={notice.color} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800">
                        {notice.title}
                      </h3>
                      <span className="text-xs text-orange-500">
                        {getTimeAgo(notice.time || notice.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notice.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <span>By {notice.author}</span>
                      <span>•</span>
                      <span className="capitalize">{notice.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notice;
