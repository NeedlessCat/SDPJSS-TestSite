import { useEffect } from "react";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [state, setState] = useState("Register");

  // Token for the user login
  const [utoken, setUToken] = useState(
    localStorage.getItem("utoken") ? localStorage.getItem("utoken") : false
  );

  // User data state
  const [userData, setUserData] = useState(false);
  const [loading, setLoading] = useState(true);

  // Khandan and users data for registration
  const [khandanList, setKhandanList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Load user profile data
  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { utoken },
      });
      console.log(data);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load user jobs
  const [jobs, setJobs] = useState(false);
  const loadUserJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/my-jobs", {
        headers: { utoken },
      });
      console.log(data);
      if (data.success) {
        setJobs(data.jobOpenings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

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
        // toast.error(data.message);
        setUsersList([]);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setUsersList([]);
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
  // Add donations state
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);

  // Function to fetch user donations
  const loadUserDonations = async () => {
    try {
      if (!userData || !userData._id) {
        console.log("User data not available yet");
        return;
      }

      setDonationsLoading(true);
      const { data } = await axios.get(
        backendUrl + "/api/user/my-donations", // Adjust the endpoint as needed
        {
          headers: {
            utoken,
          },
        }
      );

      console.log("Donations data:", data);
      if (data.success) {
        setDonations(data.donations);
      } else {
        toast.error(data.message);
        setDonations([]);
      }
    } catch (error) {
      console.log("Error loading donations:", error);
      toast.error("Failed to load donations");
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  const [publicFeatures, setPublicFeatures] = useState([]);

  // --- NEW FUNCTION TO LOAD PUBLIC FEATURES ---
  const loadPublicFeatures = async () => {
    try {
      // Use the new public endpoint
      const response = await axios.get(`${backendUrl}/api/c/public-features`);
      if (response.data.success) {
        const allowedLinks = [
          "/jobs",
          "/staff-requirements",
          "/advertisements",
        ];

        // Filter the data using the .includes() method
        const filterData = response.data.data.filter((feature) =>
          allowedLinks.includes(feature.link)
        );
        setPublicFeatures(filterData);
      }
    } catch (error) {
      console.error("Failed to load public features:", error);
      // Don't toast here, as it's a background task for public users
    }
  };

  const value = {
    backendUrl,
    state,
    setState,
    utoken,
    setUToken,
    loadUserData,
    userData,
    setUserData,
    jobs,
    setJobs,
    loadUserJobs,
    loading,
    setLoading,
    khandanList,
    setKhandanList,
    usersList,
    setUsersList,
    loadKhandans,
    loadUsersByKhandan,
    getKhandanById,
    getKhandanByKhandanId,
    donations,
    setDonations,
    donationsLoading,
    loadUserDonations,
    publicFeatures,
  };

  useEffect(() => {
    if (utoken) {
      loadUserData();
      loadUserJobs();
      loadPublicFeatures();
    } else {
      setUserData(false);
      setJobs(false);
      setDonations([]);
    }
  }, [utoken]);
  // Load donations when userData is available
  useEffect(() => {
    if (userData && userData._id) {
      loadUserDonations();
    }
  }, [userData]);
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
