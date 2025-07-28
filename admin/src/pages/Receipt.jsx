import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  X,
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  Clock, // Added for previous donations icon
} from "lucide-react";
import axios from "axios";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";

const Receipt = () => {
  const {
    backendUrl,
    aToken,
    userList,
    getUserList,
    getFamilyList,
    getDonationList,
    donationList,
  } = useContext(AdminContext);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [willCome, setWillCome] = useState("YES");
  const [courierAddress, setCourierAddress] = useState("");
  const [donations, setDonations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [khandans, setKhandans] = useState([]);
  const [courierCharges, setCourierCharges] = useState([]);
  const [userPreviousDonations, setUserPreviousDonations] = useState([]); // <-- New state for previous donations

  // Add these states for the new user form
  const [isEldest, setIsEldest] = useState(false);
  const [usersInSelectedKhandan, setUsersInSelectedKhandan] = useState([]); // To store users of the selected khandan for father dropdown

  const [remarks, setRemarks] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    gender: "",
    dob: "",
    khandanid: "",
    fatherid: "", // Now properly handled
    contact: {
      email: "",
      mobileno: {
        code: "+91",
        number: "",
      },
      whatsappno: "",
    },
    address: {
      currlocation: "",
      country: "",
      state: "",
      district: "",
      city: "",
      postoffice: "",
      pin: "",
      landmark: "",
      street: "",
      apartment: "",
      floor: "",
      room: "",
    },
    profession: {
      category: "",
      job: "",
      specialization: "",
    },
  });

  const userSearchRef = useRef(null);

  const paymentMethods = ["Cash", "Online"];

  const genderOptions = ["male", "female", "other"];

  // Validation helpers (Keep them as is)
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  // Validation message component (Keep it as is)
  const ValidationMessage = ({ show, message }) => {
    if (!show) return null;
    return <p className="text-red-500 text-sm mt-1">{message}</p>;
  };

  // Validation state (Keep them as is)
  const emailError =
    newUser.contact.email && !validateEmail(newUser.contact.email);
  const mobileError =
    newUser.contact.mobileno.number &&
    !validateMobile(newUser.contact.mobileno.number);

  // Location options with auto-fill data (Keep them as is)
  const locationOptions = [
    {
      value: "in_manpur",
      label: "In Manpur",
      address: {
        city: "Gaya",
        state: "Bihar",
        district: "Gaya",
        country: "India",
        pin: "823003",
        postoffice: "Buniyadganj",
        street: "Manpur",
      },
    },
    {
      value: "in_gaya_outside_manpur",
      label: "In Gaya but outside Manpur",
      address: {
        city: "Gaya",
        state: "Bihar",
        district: "Gaya",
        country: "India",
        pin: "",
        postoffice: "",
        street: "",
      },
    },
    {
      value: "in_bihar_outside_gaya",
      label: "In Bihar but outside Gaya",
      address: {
        city: "",
        state: "Bihar",
        district: "",
        country: "India",
        pin: "",
        postoffice: "",
        street: "",
      },
    },
    {
      value: "in_india_outside_bihar",
      label: "In India but outside Bihar",
      address: {
        city: "",
        state: "",
        district: "",
        country: "India",
        pin: "",
        postoffice: "",
        street: "",
      },
    },
    {
      value: "outside_india",
      label: "Outside India",
      address: {
        city: "",
        state: "",
        district: "",
        country: "",
        pin: "",
        postoffice: "",
        street: "",
      },
    },
  ];

  // Helper to capitalize each word for fullname and address fields
  const capitalizeEachWord = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Replace the existing handleKhandanChangeForNewUser function
  const handleKhandanChangeForNewUser = (khandanId) => {
    setNewUser((prev) => ({ ...prev, khandanid: khandanId }));
    setNewUser((prev) => ({ ...prev, fatherid: "" })); // Reset fatherId on khandan change
    setIsEldest(false); // Reset eldest on khandan change
    console.log(userList);
    if (khandanId) {
      // Filter from the complete userList (not filteredUsers) based on selected khandan and gender
      const allUsersInKhandan = userList.filter(
        (user) => user.khandanid._id === khandanId && user.gender === "male"
      );
      setUsersInSelectedKhandan(allUsersInKhandan);
    } else {
      setUsersInSelectedKhandan([]);
    }
  };

  // Helper to convert amount to words
  const convertAmountToWords = (amount) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const numToWords = (num) => {
      if (num === 0) return "";
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      const digit = num % 10;
      return `${tens[Math.floor(num / 10)]} ${ones[digit]}`.trim();
    };

    if (amount === 0) return "Zero Rupees Only";
    let words = "";
    let num = Math.floor(amount);

    if (num >= 10000000) {
      words += `${numToWords(Math.floor(num / 10000000))} Crore `;
      num %= 10000000;
    }
    if (num >= 100000) {
      words += `${numToWords(Math.floor(num / 100000))} Lakh `;
      num %= 100000;
    }
    if (num >= 1000) {
      words += `${numToWords(Math.floor(num / 1000))} Thousand `;
      num %= 1000;
    }
    if (num >= 100) {
      words += `${numToWords(Math.floor(num / 100))} Hundred `;
      num %= 100;
    }
    if (num > 0) {
      words += numToWords(num);
    }

    return `${words.trim()} Rupees Only`;
  };

  // New: Handle eldest checkbox for new user
  const handleEldestChangeForNewUser = (checked) => {
    setIsEldest(checked);
    if (checked && newUser.khandanid) {
      setNewUser((prev) => ({ ...prev, fatherid: newUser.khandanid }));
    } else {
      setNewUser((prev) => ({ ...prev, fatherid: "" }));
    }
  };

  const fetchCourierCharges = async () => {
    try {
      const response = await axios.get(
        backendUrl + "/api/admin/courier-charges",
        {
          headers: { aToken },
        }
      );
      if (response.data.success) {
        setCourierCharges(response.data.courierCharges || []);
      }
    } catch (error) {
      console.error("Error fetching courier charges:", error);
    }
  };

  // Effect to load initial data
  useEffect(() => {
    const fetchData = async () => {
      if (aToken) {
        setLoading(true);
        try {
          await getUserList();
          await fetchCategories();
          await fetchCourierCharges();
          const khandanData = await getFamilyList();
          if (khandanData && khandanData.success) {
            setKhandans(khandanData.families || []);
          }
          await loadDonations();
        } catch (error) {
          console.error("Error fetching initial data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [aToken]);

  // Load Razorpay script (Keep it as is)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fetch categories (Keep it as is)
  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/categories", {
        headers: {
          aToken,
        },
      });
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getCourierChargeForUser = (user) => {
    if (!user?.address?.currlocation) return 0;

    // Map user's current location to courier charge regions
    const locationToCourierRegionMap = {
      in_gaya_outside_manpur: "in_gaya_outside_manpur",
      in_bihar_outside_gaya: "in_bihar_outside_gaya",
      in_india_outside_bihar: "in_india_outside_bihar",
      outside_india: "outside_india",
    };

    const courierRegion = locationToCourierRegionMap[user.address.currlocation];
    if (!courierRegion) return 0; // No charge for "in_manpur"

    const courierCharge = courierCharges.find(
      (charge) => charge.region === courierRegion
    );
    return courierCharge ? courierCharge.amount : 0;
  };

  // Load donations (Keep it as is)
  const loadDonations = async () => {
    try {
      await getDonationList();
    } catch (error) {
      console.error("Error loading donations:", error);
    }
  };

  // Get khandan name by ID (Keep it as is)
  const getKhandanName = (khandanId) => {
    const khandan = khandans.find((k) => k._id === khandanId._id);
    return khandan ? khandan.name : "Unknown Khandan";
  };

  // Helper function to format khandan option display for `Add New User` modal
  const formatKhandanOption = (khandan) => {
    let displayText = khandan.name;
    if (khandan.address.landmark) {
      displayText += `, ${khandan.address.landmark}`;
    }
    if (khandan.address.street) {
      displayText += `, ${khandan.address.street}`;
    }
    displayText += ` (${khandan.khandanid})`;
    return displayText;
  };

  // Filter users based on search (Keep it as is)
  useEffect(() => {
    if (userSearch.length > 0) {
      const filtered = userList.filter(
        (user) =>
          user.fullname.toLowerCase().includes(userSearch.toLowerCase()) ||
          (user.contact.mobileno &&
            user.contact.mobileno.number.includes(userSearch)) ||
          (user.contact.email &&
            user.contact.email
              .toLowerCase()
              .includes(userSearch.toLowerCase())) ||
          getKhandanName(user.khandanid)
            .toLowerCase()
            .includes(userSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  }, [userSearch, userList, khandans]);

  // --- NEW ---
  // Effect to filter previous donations when a user is selected
  // Effect to filter previous donations when a user is selected
  useEffect(() => {
    if (selectedUser && donationList) {
      const previous = donationList
        .filter((donation) => donation.userId?._id === selectedUser._id)
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by most recent first
        .slice(0, 2); // <-- MODIFIED: Get only the last 2 donations
      setUserPreviousDonations(previous);
    } else {
      setUserPreviousDonations([]);
    }
  }, [selectedUser, donationList]);

  // Get available categories (exclude already selected ones) (Keep it as is)
  const getAvailableCategories = () => {
    const selectedCategoryIds = donations.map((d) => d.categoryId);
    return categories.filter(
      (cat) => !selectedCategoryIds.includes(cat._id) && cat.isActive
    );
  };

  // Handle user selection (Keep it as is)
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserSearch("");
    setShowUserDropdown(false);
    // Unfocus the search input
    if (userSearchRef.current) {
      userSearchRef.current.blur();
    }
  };

  // Handle add donation (Keep it as is)
  const handleAddDonation = () => {
    if (!selectedCategory || !quantity) {
      alert("Please select category and enter quantity");
      return;
    }

    const category = categories.find((cat) => cat._id === selectedCategory);
    if (!category) return;

    const amount = category.rate * parseInt(quantity);
    const weight = category.weight * parseInt(quantity);

    const newDonation = {
      id: Date.now(),
      categoryId: category._id,
      category: category.categoryName,
      quantity: parseInt(quantity),
      amount: amount,
      weight: weight,
      packet: category.packet,
    };

    setDonations([...donations, newDonation]);
    setSelectedCategory("");
    setQuantity("");
  };

  // Remove donation (Keep it as is)
  const removeDonation = (id) => {
    setDonations(donations.filter((donation) => donation.id !== id));
  };

  // --- NEW ---
  // Check if user is in a location where courier is not an option
  const isLocalUser =
    selectedUser &&
    ["in_manpur", "in_gaya_outside_manpur"].includes(
      selectedUser.address.currlocation
    );

  // --- NEW ---
  // Effect to reset `willCome` to "YES" if a local user is selected
  useEffect(() => {
    if (isLocalUser) {
      setWillCome("YES");
    }
  }, [isLocalUser]);

  // Calculate totals (Keep it as is)
  const totalAmount = donations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );
  const totalWeight = donations.reduce(
    (sum, donation) => sum + donation.weight,
    0
  );
  const totalPackets = donations.reduce(
    (count, donation) => count + (donation.packet ? donation.quantity : 0),
    0
  );
  const courierCharge =
    willCome === "NO" && selectedUser
      ? getCourierChargeForUser(selectedUser)
      : 0;
  const netPayableAmount = totalAmount + courierCharge;

  // Handle nested object updates for newUser (Keep it as is)
  const updateNestedField = (path, value) => {
    const pathArray = path.split(".");
    setNewUser((prev) => {
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < pathArray.length - 1; i++) {
        current[pathArray[i]] = { ...current[pathArray[i]] };
        current = current[pathArray[i]];
      }

      current[pathArray[pathArray.length - 1]] = value;
      return newState;
    });
  };

  // Handle location change and auto-fill address (Keep it as is)
  const handleLocationChange = (locationValue) => {
    updateNestedField("address.currlocation", locationValue);

    const selectedLocation = locationOptions.find(
      (option) => option.value === locationValue
    );

    if (selectedLocation) {
      // Auto-fill address fields based on selected location
      Object.keys(selectedLocation.address).forEach((key) => {
        updateNestedField(`address.${key}`, selectedLocation.address[key]);
      });
    }
  };

  // Updated handleRegisterUser function (Keep as is)
  const handleRegisterUser = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (
        !newUser.fullname ||
        !newUser.gender ||
        !newUser.dob ||
        !newUser.khandanid ||
        !newUser.address.currlocation ||
        (!isEldest && !newUser.fatherid)
      ) {
        alert(
          "Please fill in all required fields: fullname, gender, dob, khandan, father (or check eldest), and address"
        );
        return;
      }

      const hasEmail =
        newUser.contact.email && newUser.contact.email.trim() !== "";
      const hasMobile =
        newUser.contact.mobileno.number &&
        newUser.contact.mobileno.number.trim() !== "";

      if (!hasEmail && !hasMobile) {
        alert("At least one contact method (email or mobile) is required");
        return;
      }
      if (hasMobile && !validateMobile(newUser.contact.mobileno.number)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
      }
      if (hasEmail && !validateEmail(newUser.contact.email)) {
        alert("Please enter a valid email address");
        return;
      }
      const userData = {
        fullname: newUser.fullname,
        gender: newUser.gender,
        dob: newUser.dob,
        khandanid: newUser.khandanid,
        fatherid: newUser.fatherid,
        email: hasEmail ? newUser.contact.email : undefined,
        mobile: hasMobile ? newUser.contact.mobileno : undefined,
        address: newUser.address,
      };

      const response = await axios.post(
        backendUrl + "/api/admin/register",
        userData,
        { headers: { aToken } }
      );

      if (response.data.success) {
        const { userId, username, notifications } = response.data;
        const newUserData = {
          _id: userId,
          fullname: newUser.fullname,
          username: username,
          gender: newUser.gender,
          dob: newUser.dob,
          khandanid: newUser.khandanid,
          fatherid: newUser.fatherid,
          contact: newUser.contact,
          address: newUser.address,
        };
        await getUserList();
        handleUserSelect(newUserData);
        setNewUser({
          fullname: "",
          gender: "",
          dob: "",
          khandanid: "",
          fatherid: "",
          contact: {
            email: "",
            mobileno: { code: "+91", number: "" },
            whatsappno: "",
          },
          address: {
            currlocation: "",
            country: "",
            state: "",
            district: "",
            city: "",
            postoffice: "",
            pin: "",
            landmark: "",
            street: "",
            apartment: "",
            floor: "",
            room: "",
          },
          profession: { category: "", job: "", specialization: "" },
        });
        setIsEldest(false);
        setUsersInSelectedKhandan([]);
        setShowAddUserForm(false);
        alert(
          `User registered successfully! ${
            notifications ? notifications.join(", ") : ""
          }`
        );
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert(
        `Error registering user: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Razorpay payment (Keep as is)
  const handleRazorpayPayment = async (orderData) => {
    try {
      setPaymentLoading(true);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please try again.");
        return false;
      }

      const response = await axios.post(
        backendUrl + "/api/admin/create-donation-order",
        orderData,
        {
          headers: { aToken, "Content-Type": "application/json" },
        }
      );

      if (!response.data.success) {
        alert(`Error: ${response.data.message}`);
        return false;
      }
      const { order, donationId } = response.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Donation Portal",
        description: "Donation Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              backendUrl + "/api/admin/verify-donation-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: donationId,
              },
              { headers: { aToken, "Content-Type": "application/json" } }
            );

            if (verifyResponse.data.success) {
              alert("Payment successful! Donation recorded.");
              await getDonationList();
              resetForm();
            } else {
              alert(
                `Payment verification failed: ${verifyResponse.data.message}`
              );
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Error verifying payment");
          }
        },
        prefill: {
          name: selectedUser?.fullname || "",
          email: selectedUser?.contact?.email || "",
          contact: selectedUser?.contact?.mobileno?.number || "",
        },
        theme: { color: "#16a34a" },
        modal: { ondismiss: () => alert("Payment cancelled") },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      return true;
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment");
      return false;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Reset form (Keep as is)
  const resetForm = () => {
    setSelectedUser(null);
    setUserSearch("");
    setDonations([]);
    setWillCome("YES");
    setCourierAddress("");
    setPaymentMethod("");
    setRemarks("");
  };

  // Handle form submission (Keep as is)
  const handleSubmit = async () => {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }
    if (donations.length === 0) {
      alert("Please add at least one donation");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    if (willCome === "NO" && !courierAddress.trim()) {
      alert("Please provide courier address");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        userId: selectedUser._id,
        list: donations.map((donation) => ({
          categoryId: donation.categoryId,
          category: donation.category,
          number: donation.quantity,
          amount: donation.amount,
          isPacket: donation.packet ? 1 : 0,
          quantity: donation.weight,
        })),
        amount: netPayableAmount,
        method: paymentMethod,
        courierCharge,
        remarks,
        postalAddress:
          willCome === "NO"
            ? courierAddress
            : `${selectedUser.address.street}, ${selectedUser.address.city}, ${selectedUser.address.state} - ${selectedUser.address.pin}`,
      };

      if (paymentMethod === "Cash") {
        const response = await axios.post(
          backendUrl + "/api/admin/create-donation-order",
          orderData,
          {
            headers: { aToken, "Content-Type": "application/json" },
          }
        );
        if (response.data.success) {
          alert("Cash donation recorded successfully!");
          await getDonationList();
          resetForm();
        } else {
          alert(`Error: ${response.data.message}`);
        }
      } else if (paymentMethod === "Online") {
        const paymentSuccess = await handleRazorpayPayment(orderData);
        if (!paymentSuccess) return;
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("Error submitting donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6" />
            Donation Receipt Form
          </h1>
        </div>

        <div className="p-6 space-y-6">
          {/* User Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select User
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={userSearchRef}
                  type="text"
                  placeholder="Search by name, phone, email, or khandan..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onFocus={() =>
                    userSearch.length > 0 && setShowUserDropdown(true)
                  }
                />
              </div>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.fullname}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.contact.mobileno?.code}{" "}
                              {user.contact.mobileno?.number} •{" "}
                              {user.contact.email}
                            </div>
                            <div className="text-xs text-blue-600">
                              Khandan: {getKhandanName(user.khandanid)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-gray-500 mb-2">No users found</p>
                      <button
                        onClick={() => {
                          setShowAddUserForm(true);
                          setShowUserDropdown(false);
                        }}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add New User
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected User Display */}
            {selectedUser && (
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedUser.fullname}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {selectedUser.contact.mobileno?.code}{" "}
                          {selectedUser.contact.mobileno?.number}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {selectedUser.contact.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {selectedUser.address.street},{" "}
                          {selectedUser.address.city},{" "}
                          {selectedUser.address.state} -{" "}
                          {selectedUser.address.pin}
                        </div>
                        <div className="text-blue-600 font-medium">
                          Khandan: {getKhandanName(selectedUser.khandanid)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserSearch("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add User Form Modal (Keep As Is) */}
          {showAddUserForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Add New User</h2>
                    <button
                      onClick={() => setShowAddUserForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={newUser.fullname}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            fullname: capitalizeEachWord(e.target.value),
                          })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newUser.gender}
                          onChange={(e) =>
                            setNewUser({ ...newUser, gender: e.target.value })
                          }
                          required
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map((gender) => (
                            <option key={gender} value={gender}>
                              {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newUser.dob}
                          onChange={(e) =>
                            setNewUser({ ...newUser, dob: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Khandan <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={newUser.khandanid}
                        onChange={(e) =>
                          handleKhandanChangeForNewUser(e.target.value)
                        }
                        required
                      >
                        <option value="">Select Khandan</option>
                        {khandans.map((khandan) => (
                          <option key={khandan._id} value={khandan._id}>
                            {formatKhandanOption(khandan)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <label className="text-sm font-medium text-gray-700">
                          Father <span className="text-red-500">*</span>
                        </label>
                        {newUser.khandanid && (
                          <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={isEldest}
                              onChange={(e) =>
                                handleEldestChangeForNewUser(e.target.checked)
                              }
                              className="w-4 h-4 text-green-600 rounded"
                            />
                            <span>Eldest</span>
                          </label>
                        )}
                      </div>
                      <select
                        className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-100"
                        onChange={(e) =>
                          setNewUser({ ...newUser, fatherid: e.target.value })
                        }
                        value={newUser.fatherid}
                        disabled={isEldest || !newUser.khandanid}
                        required={!isEldest}
                      >
                        <option value="">Select Father</option>
                        {usersInSelectedKhandan.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.fullname} ({user._id})
                          </option>
                        ))}
                      </select>
                      {!isEldest && newUser.khandanid && (
                        <p className="mt-2 text-xs text-red-600">
                          {usersInSelectedKhandan.length === 0
                            ? "No male users found. Check 'Eldest' if this is the first member."
                            : "Select father. If not found, register father first."}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddUserForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegisterUser}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Register User"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visit Question */}
          <div className="bg-blue-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Will you come to Durga Sthan, Manpur, Patwatoli to get your
              Mahaprasad?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="willCome"
                  value="YES"
                  checked={willCome === "YES"}
                  onChange={(e) => setWillCome(e.target.value)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium">YES</span>
              </label>
              <label
                className={`flex items-center gap-2 ${
                  isLocalUser
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  name="willCome"
                  value="NO"
                  checked={willCome === "NO"}
                  onChange={(e) => setWillCome(e.target.value)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                  disabled={isLocalUser}
                />
                <span className="text-sm font-medium">NO</span>
              </label>
            </div>
            {isLocalUser && (
              <p className="text-xs text-gray-500 mt-2">
                Courier option is not available for your location. Please select
                "YES".
              </p>
            )}
          </div>

          {/* Courier Address */}
          {willCome === "NO" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Courier/Postal Address for Mahaprasad
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="Enter complete address for courier delivery..."
                value={courierAddress}
                onChange={(e) => setCourierAddress(e.target.value)}
              />
            </div>
          )}

          {/* --- NEW: Previous Donations Section --- */}
          {userPreviousDonations.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Previous Donations
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {userPreviousDonations.map((donation) => (
                  <div
                    key={donation._id}
                    className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2 pb-2 border-b">
                      <span className="font-semibold text-blue-800">
                        Date:{" "}
                        {new Date(donation.date).toLocaleDateString("en-IN")}
                      </span>
                      <span className="font-bold text-gray-800">
                        Total: ₹{donation.amount}
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium text-gray-600 py-1 px-2">
                            Category
                          </th>
                          <th className="text-right font-medium text-gray-600 py-1 px-2">
                            Qty
                          </th>
                          <th className="text-right font-medium text-gray-600 py-1 px-2">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {donation.list.map((item, index) => (
                          <tr key={index}>
                            <td className="py-1 px-2">{item.category}</td>
                            <td className="text-right py-1 px-2">
                              {item.number}
                            </td>
                            <td className="text-right py-1 px-2">
                              ₹{item.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Donation Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Donation Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    const selectedCat = categories.find(
                      (cat) => cat._id === e.target.value
                    );
                    if (selectedCat && selectedCat.packet) {
                      setQuantity("1");
                    } else {
                      setQuantity(""); // Reset quantity for non-packet categories
                    }
                  }}
                >
                  <option value="">Select Category</option>
                  {getAvailableCategories().map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={
                    categories.find((cat) => cat._id === selectedCategory)
                      ?.packet
                      ? 1
                      : quantity
                  }
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  disabled={
                    categories.find((cat) => cat._id === selectedCategory)
                      ?.packet
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>

                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {selectedCategory && quantity
                    ? `₹${
                        (categories.find((cat) => cat._id === selectedCategory)
                          ?.rate || 0) * parseInt(quantity || 0)
                      }`
                    : "₹0"}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddDonation}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add More
                </button>
              </div>
            </div>

            {/* Selected Category Details */}
            {selectedCategory && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Category Details:</strong>{" "}
                  {
                    categories.find((cat) => cat._id === selectedCategory)
                      ?.categoryName
                  }
                  <br />
                  <strong>Weight per unit:</strong>{" "}
                  {
                    categories.find((cat) => cat._id === selectedCategory)
                      ?.weight
                  }{" "}
                  kg
                  <br />
                  <strong>Packet:</strong>{" "}
                  {categories.find((cat) => cat._id === selectedCategory)
                    ?.packet
                    ? "Yes" // Changed from 1 to "Yes" for better readability
                    : "No"}
                  <br />
                  <strong>Rate per unit:</strong> ₹{" "}
                  {categories.find((cat) => cat._id === selectedCategory)?.rate}
                </div>
              </div>
            )}

            {/* Donations List */}
            {donations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Weight (kg)
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Packet
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {donations.map((donation) => (
                      <tr
                        key={donation.id}
                        className="border-t border-gray-200"
                      >
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {donation.category}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {donation.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ₹{donation.amount}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {donation.weight}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {donation.packet ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeDonation(donation.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mahaprasad Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Mahaprasad Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-medium">
                    {totalWeight.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Packet:</span>
                  <span className="font-medium">{totalPackets}</span>
                </div>
              </div>
            </div>

            {/* Donation Summary */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Donation Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Donation Amount:</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Charge:</span>
                  <span className="font-medium">
                    ₹{courierCharge}
                    {willCome === "NO" && selectedUser && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({selectedUser.address.currlocation?.replace(/_/g, " ")}
                        )
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Net Payable Amount:</span>
                  <span className="font-bold text-green-600">
                    ₹{netPayableAmount}
                  </span>
                </div>
                {netPayableAmount > 0 && (
                  <div className="text-xs text-gray-600 capitalize pt-2 border-t">
                    <strong>In Words:</strong>{" "}
                    {convertAmountToWords(netPayableAmount)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Option
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows="3"
              placeholder="Enter any additional remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400"
              disabled={loading || paymentLoading}
            >
              <CreditCard className="h-5 w-5" />
              {loading || paymentLoading ? "Processing..." : "Submit Receipt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
