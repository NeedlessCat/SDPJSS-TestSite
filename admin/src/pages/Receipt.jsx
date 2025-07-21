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
  const [remarks, setRemarks] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    gender: "",
    dob: "",
    khandanid: "",
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

  // Validation helpers
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  // Validation message component
  const ValidationMessage = ({ show, message }) => {
    if (!show) return null;
    return <p className="text-red-500 text-sm mt-1">{message}</p>;
  };

  // Validation state
  const emailError =
    newUser.contact.email && !validateEmail(newUser.contact.email);
  const mobileError =
    newUser.contact.mobileno.number &&
    !validateMobile(newUser.contact.mobileno.number);

  // Location options with auto-fill data
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
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (aToken) {
        setLoading(true);
        try {
          await getUserList();
          await fetchCategories();
          const khandanData = await getFamilyList();
          console.log("Data: ", khandanData);
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

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

  const loadDonations = async () => {
    try {
      await getDonationList();
    } catch (error) {
      console.error("Error loading donations:", error);
    }
  };

  // Get khandan name by ID
  const getKhandanName = (khandanId) => {
    console.log("khandans: ", khandans);
    const khandan = khandans.find((k) => k._id === khandanId._id);
    console.log(khandanId);
    return khandan ? khandan.name : "Unknown Khandan";
  };

  // Filter users based on search
  useEffect(() => {
    if (userSearch.length > 0) {
      const filtered = userList.filter(
        (user) =>
          user.fullname.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.contact.mobileno.number.includes(userSearch) ||
          user.contact.email.toLowerCase().includes(userSearch.toLowerCase()) ||
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

  // Get available categories (exclude already selected ones)
  const getAvailableCategories = () => {
    const selectedCategoryIds = donations.map((d) => d.categoryId);
    return categories.filter(
      (cat) => !selectedCategoryIds.includes(cat._id) && cat.isActive
    );
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserSearch("");
    setShowUserDropdown(false);
    // Unfocus the search input
    if (userSearchRef.current) {
      userSearchRef.current.blur();
    }
  };

  // Handle add donation
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

    console.log("New DDonaion: ", newDonation);

    setDonations([...donations, newDonation]);
    setSelectedCategory("");
    setQuantity("");
  };

  // Remove donation
  const removeDonation = (id) => {
    setDonations(donations.filter((donation) => donation.id !== id));
  };

  // Calculate totals
  const totalAmount = donations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );
  const totalWeight = donations.reduce(
    (sum, donation) => sum + donation.weight,
    0
  );
  const totalPackets = donations.reduce(
    (count, donation) => count + (donation.packet ? 1 : 0),
    0
  );
  const courierCharge = willCome === "NO" ? 600 : 0;
  const netPayableAmount = totalAmount + courierCharge;

  // Handle nested object updates for newUser
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

  // Handle location change and auto-fill address
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

  // Updated handleRegisterUser function to align with backend validation
  const handleRegisterUser = async () => {
    try {
      setLoading(true);

      // Validate required fields (matching backend validation)
      if (
        !newUser.fullname ||
        !newUser.gender ||
        !newUser.dob ||
        !newUser.khandanid ||
        !newUser.address.currlocation // This is required in backend
      ) {
        alert(
          "Please fill in all required fields: fullname, gender, dob, khandan, and address"
        );
        return;
      }

      // Validate that at least one contact method is provided
      const hasEmail =
        newUser.contact.email && newUser.contact.email.trim() !== "";
      const hasMobile =
        newUser.contact.mobileno.number &&
        newUser.contact.mobileno.number.trim() !== "";

      if (!hasEmail && !hasMobile) {
        alert("At least one contact method (email or mobile) is required");
        return;
      }

      // Validate mobile number format if provided
      if (hasMobile && !validateMobile(newUser.contact.mobileno.number)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
      }

      // Validate email format if provided
      if (hasEmail && !validateEmail(newUser.contact.email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Prepare userData for backend - remove the username generation
      const userData = {
        fullname: newUser.fullname,
        gender: newUser.gender,
        dob: newUser.dob,
        khandanid: newUser.khandanid,
        email: hasEmail ? newUser.contact.email : undefined, // Backend expects email at root level
        mobile: hasMobile ? newUser.contact.mobileno : undefined, // Backend expects mobile at root level
        address: newUser.address,
      };

      // Use the correct endpoint - should match your backend route
      const response = await axios.post(
        backendUrl + "/api/admin/register", // or "/api/user/register" - check your backend route
        userData,
        {
          headers: {
            aToken,
          },
        }
      );

      if (response.data.success) {
        // Backend returns the saved user data
        const { token, userId, username, notifications } = response.data;

        // Create user object to match your userList format
        const newUserData = {
          _id: userId,
          fullname: newUser.fullname,
          username: username,
          gender: newUser.gender,
          dob: newUser.dob,
          khandanid: newUser.khandanid,
          contact: newUser.contact,
          address: newUser.address,
        };

        // Refresh user list from context
        await getUserList();

        // Select the new user
        handleUserSelect(newUserData);

        // Reset form
        setNewUser({
          fullname: "",
          gender: "",
          dob: "",
          khandanid: "",
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
        setShowAddUserForm(false);

        // Show success message with notifications
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

  // Handle Razorpay payment
  const handleRazorpayPayment = async (orderData) => {
    try {
      setPaymentLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please try again.");
        return false;
      }

      // Create payment order
      const response = await axios.post(
        backendUrl + "/api/admin/create-donation-order",
        orderData,
        {
          headers: {
            aToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        alert(`Error: ${response.data.message}`);
        return false;
      }

      const { order, donationId } = response.data;

      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your Razorpay key ID
        amount: order.amount,
        currency: order.currency,
        name: "Donation Portal",
        description: "Donation Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              backendUrl + "/api/admin/verify-donation-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: donationId,
              },
              {
                headers: {
                  aToken,
                  "Content-Type": "application/json",
                },
              }
            );

            if (verifyResponse.data.success) {
              alert("Payment successful! Donation recorded.");

              // Refresh donation list
              await getDonationList();

              // Reset form
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
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: () => {
            alert("Payment cancelled");
          },
        },
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

  // Reset form after successful submission
  const resetForm = () => {
    setSelectedUser(null);
    setUserSearch("");
    setDonations([]);
    setWillCome("YES");
    setCourierAddress("");
    setPaymentMethod("");
    setRemarks("");
  };

  // Handle form submission
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

      // Prepare order data according to API expectations
      console.log("Admin Dontions: ", donations);
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
        // Handle cash payment
        const response = await axios.post(
          backendUrl + "/api/admin/create-donation-order",
          orderData,
          {
            headers: {
              aToken,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          alert("Cash donation recorded successfully!");

          // Refresh donation list
          await getDonationList();

          // Reset form
          resetForm();
        } else {
          alert(`Error: ${response.data.message}`);
        }
      } else if (paymentMethod === "Online") {
        // Handle online payment
        const paymentSuccess = await handleRazorpayPayment(orderData);
        if (!paymentSuccess) {
          return;
        }
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
                              {user.contact.mobileno.code}{" "}
                              {user.contact.mobileno.number} •{" "}
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
                          {selectedUser.contact.mobileno.code}{" "}
                          {selectedUser.contact.mobileno.number}
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

          {/* Add User Form Modal */}
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
                          setNewUser({ ...newUser, fullname: e.target.value })
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
                          setNewUser({ ...newUser, khandanid: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Khandan</option>
                        {khandans.map((khandan) => (
                          <option key={khandan._id} value={khandan._id}>
                            {khandan.khandan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email{" "}
                          <span className="text-blue-500 text-xs">
                            (at least one contact required)
                          </span>
                        </label>
                        <input
                          type="email"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                            emailError ? "border-red-500" : "border-gray-300"
                          }`}
                          value={newUser.contact.email}
                          onChange={(e) =>
                            updateNestedField("contact.email", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number
                        </label>
                        <div className="flex">
                          <select
                            className="w-20 px-2 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.contact.mobileno.code}
                            onChange={(e) =>
                              updateNestedField(
                                "contact.mobileno.code",
                                e.target.value
                              )
                            }
                          >
                            <option value="+91">+91</option>
                          </select>
                          <input
                            type="tel"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.contact.mobileno.number}
                            onChange={(e) =>
                              updateNestedField(
                                "contact.mobileno.number",
                                e.target.value
                              )
                            }
                            placeholder="Mobile number"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={newUser.contact.whatsappno}
                        onChange={(e) =>
                          updateNestedField(
                            "contact.whatsappno",
                            e.target.value
                          )
                        }
                        placeholder="WhatsApp number"
                      />
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                        Address Details
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Location *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newUser.address.currlocation}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          required
                        >
                          <option value="">Select Location</option>
                          {locationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.country}
                            onChange={(e) =>
                              updateNestedField(
                                "address.country",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.district}
                            onChange={(e) =>
                              updateNestedField(
                                "address.district",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.city}
                            onChange={(e) =>
                              updateNestedField("address.city", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.state}
                            onChange={(e) =>
                              updateNestedField("address.state", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Post Office
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.postoffice}
                            onChange={(e) =>
                              updateNestedField(
                                "address.postoffice",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PIN Code
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.pin}
                            onChange={(e) =>
                              updateNestedField("address.pin", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newUser.address.street}
                          onChange={(e) =>
                            updateNestedField("address.street", e.target.value)
                          }
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apartment
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.apartment}
                            onChange={(e) =>
                              updateNestedField(
                                "address.apartment",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Floor
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.floor}
                            onChange={(e) =>
                              updateNestedField("address.floor", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.room}
                            onChange={(e) =>
                              updateNestedField("address.room", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Landmark
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newUser.address.landmark}
                          onChange={(e) =>
                            updateNestedField(
                              "address.landmark",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Profession Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                        Profession Details (Optional)
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.profession.category}
                            onChange={(e) =>
                              updateNestedField(
                                "profession.category",
                                e.target.value
                              )
                            }
                            placeholder="e.g., IT, Healthcare, Education"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.profession.job}
                            onChange={(e) =>
                              updateNestedField(
                                "profession.job",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Software Engineer, Doctor"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specialization
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={newUser.profession.specialization}
                          onChange={(e) =>
                            updateNestedField(
                              "profession.specialization",
                              e.target.value
                            )
                          }
                          placeholder="e.g., React.js, Cardiology, Mathematics"
                        />
                      </div>
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
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="willCome"
                  value="NO"
                  checked={willCome === "NO"}
                  onChange={(e) => setWillCome(e.target.value)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium">NO</span>
              </label>
            </div>
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
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                  value={selectedCategory.packet ? 1 : quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  disabled={selectedCategory.packet}
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
                    ? 1
                    : 0}
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
                          {donation.packet ? 1 : 0}
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
                  <span className="font-medium">₹{courierCharge}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Net Payable Amount:</span>
                  <span className="font-bold text-green-600">
                    ₹{netPayableAmount}
                  </span>
                </div>
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
