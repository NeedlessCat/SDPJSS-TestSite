import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [adminRole, setAdminRole] = useState(null);
  const [allowedFeatures, setAllowedFeatures] = useState([]);
  const [adminName, setAdminName] = useState(null); // <-- Add new state for name

  const [guestUserList, setGuestUserList] = useState([]);
  const [guestUserCount, setGuestUserCount] = useState(0);
  // New state variables for lists and counts
  const [familyCount, setFamilyCount] = useState(0);
  const [userList, setUserList] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [staffRequirementList, setStaffRequirementList] = useState([]);
  const [staffRequirementCount, setStaffRequirementCount] = useState(0);
  const [jobOpeningList, setJobOpeningList] = useState([]);
  const [jobOpeningCount, setJobOpeningCount] = useState(0);
  const [advertisementList, setAdvertisementList] = useState([]);
  const [advertisementCount, setAdvertisementCount] = useState(0);
  const [totalDonation, setTotalDonation] = useState(0);
  const [adminStats, setAdminStats] = useState({});

  const [noticeList, setNoticeList] = useState([]);
  const [noticeCount, setNoticeCount] = useState(0);

  const [usersList, setUsersList] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const decodeToken = () => {
      if (aToken) {
        // Save token to local storage on change
        localStorage.setItem("aToken", aToken);
        try {
          const decodedToken = jwtDecode(aToken);
          setAdminRole(decodedToken.role);
          // For superadmin, allowedFeatures might not be in the token, which is fine.
          // For regular admins, set their specific permissions.
          setAllowedFeatures(decodedToken.allowedFeatures || []);
          console.log("decode: ", decodedToken);
          setAdminName(decodedToken.name || null);
        } catch (error) {
          console.error("Invalid token:", error);
          // If token is invalid, log the user out
          setAToken("");
          setAdminRole(null);
          setAllowedFeatures([]);
          localStorage.removeItem("aToken");
        }
      } else {
        // Clear role, permissions, and local storage on logout
        localStorage.removeItem("aToken");
        setAdminRole(null);
        setAllowedFeatures([]);
        setAdminName(null);
      }
    };

    decodeToken();
  }, [aToken]);

  // NEW: Function to get all guest users
  const getGuestUserList = async () => {
    if (!aToken) return;
    try {
      const { data } = await axios.get(
        backendUrl + "/api/additional/all-guest-users",
        {
          headers: { aToken },
        }
      );
      console.log("getALLGuest: ", data);
      if (data.success) {
        setGuestUserList(data.guestUsers);
        setGuestUserCount(data.count);
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get family list with count
  const getFamilyList = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/family-list", {
        headers: { aToken },
      });
      if (data.success) {
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    if (aToken) {
      getUserList();
      getGuestUserList(); // Fetch guest users on load
      // ... any other initial fetches
    }
  }, [aToken]);
  // Load users by khandan ID for father selection
  const loadUsersByKhandan = async (khandanId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/user/get-by-khandan/${khandanId}`
      );
      console.log("Users by khandan:", data);
      if (data.success) {
        // Filter male users for father selection
        const maleUsers = data.users.filter((user) => user.gender === "male");
        setUsersList(maleUsers);
      } else {
        toast.error(data.message);
        setUsersList([]);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setUsersList([]);
    }
  };

  // Get user list with count
  const getUserList = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/user-list", {
        headers: { aToken },
      });
      if (data.success) {
        setUserList(data.users);
        setUserCount(data.count);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get staff requirement list with count
  const getStaffRequirementList = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/staff-requirement",
        { headers: { aToken } }
      );
      if (data.success) {
        setStaffRequirementList(data.staffRequirements);
        setStaffRequirementCount(data.count);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get job opening list with count
  const getJobOpeningList = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/job-opening", {
        headers: { aToken },
      });
      if (data.success) {
        setJobOpeningList(data.jobOpenings);
        setJobOpeningCount(data.count);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get advertisement list with count
  const getAdvertisementList = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/advertisement",
        { headers: { aToken } }
      );
      if (data.success) {
        setAdvertisementList(data.advertisements);
        setAdvertisementCount(data.count);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get family count only
  const getFamilyCountOnly = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/family-count", {
        headers: { aToken },
      });
      if (data.success) {
        setFamilyCount(data.count);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get user count with details
  const getUserCountDetails = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/user-count", {
        headers: { aToken },
      });
      if (data.success) {
        setUserCount(data.totalUsers);
        console.log(data);
        return data; // Return for additional details if needed
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get total donation amount
  const getTotalDonationData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/donation-stats",
        { headers: { aToken } }
      );
      if (data.success) {
        setTotalDonation(data.totalAmount);
        console.log(data);
        return data; // Return for additional donation details
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const [donationList, setDonationList] = useState([]);

  const getDonationList = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/donation-list",
        {
          headers: { aToken },
        }
      );
      console.log(data);
      if (data.success) {
        setDonationList(data.donations);
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get comprehensive admin statistics
  const getAdminStats = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/stats", {
        headers: { aToken },
      });
      if (data.success) {
        setAdminStats(data.stats);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Update user approval status
  const updateUserApproval = async (userId, status) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/admin/update-user-status",
        { userId, isApproved: status },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        console.log(data);
        // Refresh user list after update
        await getUserList();
        return data;
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Get notice list with count
  const getNoticeList = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/notice-list", {
        headers: { aToken },
      });
      if (data.success) {
        setNoticeList(data.notices);
        setNoticeCount(data.count);
        console.log(data);
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add a new notice
  const addNotice = async (noticeData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-notice",
        noticeData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        // Refresh notice list after adding
        await getNoticeList();
        return data;
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Update a notice
  const updateNotice = async (noticeId, noticeData) => {
    console.log("From admin COntext: ", noticeId);
    try {
      const { data } = await axios.put(
        backendUrl + `/api/admin/update-notice/${noticeId}`,
        noticeData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        // Refresh notice list after updating
        await getNoticeList();
        return data;
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Delete a notice
  const deleteNotice = async (noticeId) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/delete-notice/${noticeId}`,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        // Refresh notice list after deleting
        await getNoticeList();
        return data;
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  // Function to format numbers in Indian Rupee standard
  const formatIndianCommas = (num) => {
    if (num === null || num === undefined) {
      return "";
    }
    const parts = num.toString().split(".");
    let integerPart = parts[0];
    let lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    let formattedNumber =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    if (parts.length > 1) {
      formattedNumber += "." + parts[1];
    }
    return formattedNumber;
  };
  const capitalizeEachWord = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Khandan and users data for registration
  const [khandanList, setKhandanList] = useState([]);
  // const [usersList, setUsersList] = useState([]);

  // Load all khandans for registration dropdown
  const loadKhandans = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/khandan/allKhandan");
      console.log("Khandans:", data);
      if (data.success) {
        setKhandanList(data.khandans);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Get khandan by ID
  const getKhandanById = async (khandanId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/khandan/get-khandan/${khandanId}`
      );
      if (data.success) {
        return data.khandan;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return null;
    }
  };

  // Get khandan by khandanid
  const getKhandanByKhandanId = async (khandanid) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/khandan/get-khandan/${khandanid}`
      );
      if (data.success) {
        return data.khandan;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return null;
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    formatIndianCommas,
    capitalizeEachWord,

    // Family related
    familyCount,
    getFamilyList,
    getFamilyCountOnly,

    // User related
    userList,
    userCount,
    getUserList,
    getUserCountDetails,

    // Staff requirement related
    staffRequirementList,
    staffRequirementCount,
    getStaffRequirementList,

    // Job opening related
    jobOpeningList,
    jobOpeningCount,
    getJobOpeningList,

    // Advertisement related
    advertisementList,
    advertisementCount,
    getAdvertisementList,

    // Donation related
    totalDonation,
    getTotalDonationData,

    // Admin statistics
    adminStats,
    getAdminStats,
    updateUserApproval,

    // Notice related
    noticeList,
    noticeCount,
    getNoticeList,
    addNotice,
    updateNotice,
    deleteNotice,

    donationList,
    getDonationList,
    loadUsersByKhandan,
    usersList,
    khandanList,
    loadKhandans,
    loadUsersByKhandan,
    getKhandanById,
    guestUserList,
    guestUserCount,
    adminRole,
    allowedFeatures,
    adminName,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
