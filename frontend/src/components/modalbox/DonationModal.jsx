import React, { useState, useEffect, useContext } from "react";
import {
  X,
  Heart,
  MapPin,
  Package,
  CreditCard,
  Plus,
  Minus,
  User,
  Baby,
  Edit,
  Trash2,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";

const DonationModal = ({
  isOpen,
  onClose,
  backendUrl,
  userToken,
  onTransactionComplete,
}) => {
  // --- STATE MANAGEMENT ---
  const [userProfile, setUserProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [courierCharges, setCourierCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [childNameError, setChildNameError] = useState("");

  // Donation Mode State
  const [donationMode, setDonationMode] = useState("self"); // 'self' or 'child'

  // Child-Related State
  const [childUsers, setChildUsers] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(""); // Stores the ID of the selected child
  const [showChildForm, setShowChildForm] = useState(false);
  const [isEditingChild, setIsEditingChild] = useState(false);
  const [childFormData, setChildFormData] = useState({
    _id: null,
    fullname: "",
    gender: "",
    dob: "",
  });
  const [dobError, setDobError] = useState("");

  const initialFormData = {
    willCome: "YES",
    courierAddress: "",
    donationItems: [
      {
        categoryId: "",
        category: "",
        quantity: 1,
        rate: 0,
        weight: 0,
        packet: 0,
        unitAmount: 0,
        unitWeight: 0,
        unitPacket: 0,
        isPacketBased: false,
        isDynamic: false,
        minvalue: 0,
      },
    ],
    paymentMethod: "Online",
    remarks: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [totals, setTotals] = useState({
    totalAmount: 0,
    courierCharge: 0,
    netPayable: 0,
  });

  // --- HELPER FUNCTIONS ---
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const capitalizeEachWord = (str) =>
    !str
      ? ""
      : str
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

  // --- DATA FETCHING & LIFECYCLE ---
  useEffect(() => {
    if (isOpen && userToken) {
      setLoading(true);
      fetchUserProfile().then((profile) => {
        if (profile) {
          Promise.all([
            fetchCategories(),
            fetchCourierCharges(),
            fetchChildUsers(profile._id),
          ]).finally(() => setLoading(false));
        } else {
          setLoading(false); // Stop loading if user profile fails
        }
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      resetForm();
    }
  }, [isOpen, userToken]);

  useEffect(() => {
    if (userProfile) {
      setFormData((prev) => ({ ...prev, courierAddress: getPrefillAddress() }));
    }
  }, [userProfile]);

  useEffect(() => {
    calculateTotals();
  }, [
    formData.donationItems,
    formData.willCome,
    formData.courierAddress,
    courierCharges,
  ]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/get-profile`, {
        headers: { utoken: userToken },
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.userData);
        return data.userData;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
    return null;
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/categories`, {
        headers: { utoken: userToken },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCourierCharges = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/courier-charges`, {
        headers: { utoken: userToken },
      });
      if (response.ok) {
        const data = await response.json();
        setCourierCharges(data.courierCharges);
      }
    } catch (error) {
      console.error("Error fetching courier charges:", error);
    }
  };

  const fetchChildUsers = async (parentId) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/user/child/my-children/${parentId}`,
        { headers: { utoken: userToken } }
      );
      if (response.ok) {
        const data = await response.json();
        setChildUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching child users:", error);
    }
  };

  // --- CHILD MANAGEMENT HANDLERS ---
  const handleChildSelect = (childId) => {
    setSelectedChildId(childId);
    setShowChildForm(false);
    setIsEditingChild(false);
  };

  const handleAddNewChildClick = () => {
    setSelectedChildId("new");
    setIsEditingChild(false);
    setChildFormData({ _id: null, fullname: "", gender: "", dob: "" });
    setShowChildForm(true);
  };

  const handleEditChildClick = (child) => {
    setSelectedChildId(child._id);
    setIsEditingChild(true);
    const formattedDob = child.dob ? child.dob.split("T")[0] : "";
    setChildFormData({
      _id: child._id,
      fullname: child.fullname,
      gender: child.gender,
      dob: formattedDob,
    });
    setShowChildForm(true);
  };

  const handleDeleteChildClick = async (childId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this child's profile? This cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`${backendUrl}/api/user/child/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", utoken: userToken },
          body: JSON.stringify({ childId, parentId: userProfile._id }),
        });
        const result = await response.json();
        if (result.success) {
          alert("Child profile deleted successfully.");
          fetchChildUsers(userProfile._id);
          setSelectedChildId("");
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        alert("An error occurred while deleting the child profile.");
      }
    }
  };

  const handleChildFormChange = (field, value) => {
    if (field === "fullname") {
      value = capitalizeEachWord(value);
      // Check for multiple spaces
      const hasMultipleSpaces = /\s{2,}/.test(value);
      setChildNameError(
        hasMultipleSpaces ? "Multiple spaces between words are not allowed" : ""
      );
    }

    if (field === "dob") {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // More accurate age calculation
      const actualAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      setDobError(
        actualAge >= 10
          ? "Age must be less than 10. For others, please register them separately."
          : ""
      );
    }
    setChildFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- FORM LOGIC ---
  const getPrefillAddress = () => {
    if (!userProfile?.address) return "";
    const {
      room,
      floor,
      apartment,
      street,
      landmark,
      postoffice,
      city,
      district,
      state,
      country,
      pin,
    } = userProfile.address;
    return [
      room,
      floor,
      apartment,
      street,
      landmark,
      postoffice,
      city,
      district,
      state,
      country,
      pin,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getCourierChargeForUser = () => {
    if (
      formData.willCome === "YES" ||
      !formData.courierAddress ||
      courierCharges.length === 0
    )
      return 0;

    const location = formData.courierAddress.toLowerCase();

    // Check if all keywords are present together
    const hasManpur = location.includes("manpur");
    const hasGaya = location.includes("gaya");
    const hasBihar = location.includes("bihar");
    const hasIndia = location.includes("india");

    // Priority based matching - most specific to least specific
    if (hasManpur && hasGaya && hasBihar && hasIndia) {
      return 0; // in_manpur
    } else if (hasGaya && hasBihar && hasIndia && !hasManpur) {
      return (
        courierCharges.find((c) => c.region === "in_gaya_outside_manpur")
          ?.amount || 600
      );
    } else if (hasBihar && hasIndia && !hasGaya && !hasManpur) {
      return (
        courierCharges.find((c) => c.region === "in_bihar_outside_gaya")
          ?.amount || 600
      );
    } else if (hasIndia && !hasBihar && !hasGaya && !hasManpur) {
      return (
        courierCharges.find((c) => c.region === "in_india_outside_bihar")
          ?.amount || 600
      );
    } else {
      return (
        courierCharges.find((c) => c.region === "outside_india")?.amount || 600
      );
    }
  };

  const calculateTotals = () => {
    const totalAmount = formData.donationItems.reduce(
      (sum, item) => sum + (parseFloat(item.rate) || 0),
      0
    );
    const courierCharge = getCourierChargeForUser();
    const netPayable = totalAmount + courierCharge;
    setTotals({ totalAmount, courierCharge, netPayable });
  };

  const getAvailableCategories = (currentIndex) => {
    const selectedCategoryIds = formData.donationItems
      .map((item, index) => (index !== currentIndex ? item.categoryId : null))
      .filter(Boolean);
    const available = categories.filter(
      (cat) => !selectedCategoryIds.includes(cat._id)
    );
    return donationMode === "child"
      ? available.filter((cat) => cat.dynamic?.isDynamic)
      : available;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDonationItemChange = (index, field, value) => {
    const updatedItems = [...formData.donationItems];
    const item = { ...updatedItems[index] };

    if (field === "categoryId") {
      const selectedCategory = categories.find((cat) => cat._id === value);
      if (!selectedCategory) return;

      item.categoryId = value;
      item.category = selectedCategory.categoryName;
      item.unitAmount = selectedCategory.rate || 0;
      item.isPacketBased = selectedCategory.packet || false;
      item.isDynamic = selectedCategory.dynamic?.isDynamic || false;
      item.minvalue = selectedCategory.dynamic?.minvalue || 0;

      const isService =
        selectedCategory.categoryName.toLowerCase().includes("service") ||
        selectedCategory.type === "service";

      item.quantity = isService || item.isDynamic ? 1 : 1;
      item.rate = item.isDynamic
        ? item.minvalue || item.unitAmount
        : item.unitAmount;
      item.unitWeight = selectedCategory.weight || 0;
      item.unitPacket = selectedCategory.packet ? 1 : 0;
      item.weight = item.isDynamic
        ? item.rate < item.unitAmount
          ? item.minvalue
          : item.unitWeight
        : item.unitWeight * item.quantity;
      item.packet = item.unitPacket * item.quantity;
    } else if (field === "quantity" && !item.isDynamic) {
      // --- IMPROVEMENT ---
      // Allow 0 as a temporary value to represent an empty input.
      // The onBlur event will handle setting it back to 1 if left empty.
      const quantity = parseInt(value) || 0;
      item.quantity = quantity;
      item.rate = item.unitAmount * quantity;
      item.weight = item.unitWeight * quantity;
      item.packet = item.unitPacket * quantity;
    } else if (field === "rate" && item.isDynamic) {
      const newAmount = parseFloat(value) || 0;
      item.rate = newAmount;
      item.weight =
        newAmount < item.unitAmount
          ? item.minvalue
          : Math.floor(newAmount / item.unitAmount) * item.unitWeight;
    }

    updatedItems[index] = item;
    setFormData((prev) => ({ ...prev, donationItems: updatedItems }));
  };

  const addDonationItem = () => {
    setFormData((prev) => ({
      ...prev,
      donationItems: [
        ...prev.donationItems,
        {
          categoryId: "",
          category: "",
          quantity: 1,
          rate: 0,
          weight: 0,
          packet: 0,
          unitAmount: 0,
          unitWeight: 0,
          unitPacket: 0,
          isPacketBased: false,
          isDynamic: false,
          minvalue: 0,
        },
      ],
    }));
  };

  const removeDonationItem = (index) => {
    if (formData.donationItems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        donationItems: prev.donationItems.filter((_, i) => i !== index),
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setTotals({ totalAmount: 0, courierCharge: 0, netPayable: 0 });
    setDonationMode("self");
    setSelectedChildId("");
    setShowChildForm(false);
    setIsEditingChild(false);
    setChildFormData({ _id: null, fullname: "", gender: "", dob: "" });
    setDobError("");
    setSubmitting(false);
  };

  // --- SUBMISSION & PAYMENT ---
  const handleRazorpayPayment = async (order, donationId, submittedData) => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      setSubmitting(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "SDPJSS Donation",
      description: "Contribution to Shree Durga Sthan",
      order_id: order.id,
      handler: async (response) => {
        try {
          setSubmitting(true);
          const verifyResponse = await fetch(
            `${backendUrl}/api/user/verify-donation-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                utoken: userToken,
              },
              body: JSON.stringify({ ...response, donationId }),
            }
          );
          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            const child = childUsers.find((c) => c._id === selectedChildId);
            const receiptData = {
              donation: verifyResult.donation,
              user: userProfile,
              childUser:
                donationMode === "child"
                  ? child || submittedData.childData
                  : null,
            };

            // Reset form and close donation modal first
            resetForm();
            onClose();

            onTransactionComplete({
              status: "success",
              message: "Your donation has been received. Thank you!",
              receiptData,
            });
          } else {
            throw new Error(
              verifyResult.message || "Payment verification failed."
            );
          }
        } catch (error) {
          onClose(); // Close donation modal on error too
          onTransactionComplete({
            status: "failure",
            message: error.message,
            receiptData: null,
          });
        } finally {
          setSubmitting(false);
        }
      },
      prefill: {
        name: userProfile?.fullname || "",
        email: userProfile?.contact?.email || "",
        contact: userProfile?.contact?.mobileno?.number || "",
      },
      theme: { color: "#EF4444" },
      modal: { ondismiss: () => setSubmitting(false) },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubmit = async () => {
    if (donationMode === "child" && !selectedChildId)
      return alert("Please select or add a child to donate for.");
    if (
      showChildForm &&
      (!childFormData.fullname || !childFormData.gender || !childFormData.dob)
    )
      return alert("Please fill all child details.");
    if (showChildForm && (dobError || childNameError))
      return alert(dobError || childNameError);
    if (showChildForm && dobError) return alert(dobError);
    if (formData.donationItems.some((item) => !item.categoryId))
      return alert("Please select a category for all donation items.");
    if (formData.willCome === "NO" && !formData.courierAddress.trim())
      return alert("Please provide a valid courier address.");
    if (totals.netPayable <= 0)
      return alert("Donation amount must be greater than zero.");

    setSubmitting(true);

    try {
      const donationData = {
        userId: userProfile._id,
        list: formData.donationItems.map((item) => ({
          category: item.category,
          number: item.isDynamic ? 1 : item.quantity,
          amount: item.rate,
          isPacket: item.packet,
          quantity: item.weight,
        })),
        amount: totals.netPayable,
        method: "Online",
        courierCharge: totals.courierCharge,
        remarks: formData.remarks || "",
        postalAddress:
          formData.willCome === "NO"
            ? formData.courierAddress
            : "Will collect from Durga Sthan",
        donatedAs: donationMode,
        donatedFor:
          donationMode === "child" ? selectedChildId : userProfile._id,
        childData: showChildForm
          ? { ...childFormData, parentId: userProfile._id }
          : null,
      };

      const response = await fetch(
        `${backendUrl}/api/user/create-donation-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", utoken: userToken },
          body: JSON.stringify(donationData),
        }
      );

      const result = await response.json();
      if (result.success && result.paymentRequired) {
        await handleRazorpayPayment(
          result.order,
          result.donationId,
          donationData
        );
      } else {
        throw new Error(result.message || "Failed to create donation order.");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      setSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---
  if (!isOpen) return null;

  const selectedChild = childUsers.find((c) => c._id === selectedChildId);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Your Details...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <button
                onClick={onClose}
                disabled={submitting}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3">
                <Heart className="animate-pulse" size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Make a Donation</h2>
                  <p className="text-red-100 mt-1">
                    Your contribution makes a difference
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Donation Mode Toggle */}
              <div className="bg-gray-100 p-1 rounded-full flex">
                <button
                  onClick={() => setDonationMode("self")}
                  className={`w-1/2 py-2 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 ${
                    donationMode === "self"
                      ? "bg-red-500 text-white shadow"
                      : "text-gray-600"
                  }`}
                >
                  <User size={16} /> Donate as Self
                </button>
                <button
                  onClick={() => setDonationMode("child")}
                  className={`w-1/2 py-2 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 ${
                    donationMode === "child"
                      ? "bg-red-500 text-white shadow"
                      : "text-gray-600"
                  }`}
                >
                  <Baby size={16} /> Donate for Child
                </button>
              </div>

              {/* Donor Information */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" /> Donor
                  Information
                </label>
                {donationMode === "self" ? (
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                    {userProfile ? (
                      <div className="text-gray-700 text-sm">
                        <span className="font-medium">
                          {userProfile.fullname}
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          • S/o {userProfile.fatherName}
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          • {userProfile.contact?.mobileno?.number}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        Loading user info...
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedChildId}
                        onChange={(e) => handleChildSelect(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        disabled={submitting}
                      >
                        <option value="">-- Select a Child --</option>
                        {childUsers.map((child) => (
                          <option key={child._id} value={child._id}>
                            {child.fullname}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddNewChildClick}
                        className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 shrink-0"
                        disabled={submitting}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    {selectedChild && !showChildForm && (
                      <div className="w-full p-3 border rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">
                            {selectedChild.fullname}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            • S/o {userProfile.fullname}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditChildClick(selectedChild)}
                            disabled={submitting}
                          >
                            <Edit
                              size={16}
                              className="text-blue-500 hover:text-blue-700"
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteChildClick(selectedChild._id)
                            }
                            disabled={submitting}
                          >
                            <Trash2
                              size={16}
                              className="text-red-500 hover:text-red-700"
                            />
                          </button>
                        </div>
                      </div>
                    )}
                    {showChildForm && (
                      <div className="border p-4 rounded-lg mt-2 space-y-3 bg-gray-50">
                        <h4 className="font-semibold text-gray-700">
                          {isEditingChild
                            ? "Edit Child Details"
                            : "Add New Child"}
                        </h4>
                        <input
                          className={`w-full p-2 border rounded ${
                            childNameError
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          value={childFormData.fullname}
                          onChange={(e) =>
                            handleChildFormChange("fullname", e.target.value)
                          }
                          placeholder="Child's Full Name"
                          disabled={submitting}
                        />
                        {childNameError && (
                          <p className="text-xs text-red-500 mt-1">
                            {childNameError}
                          </p>
                        )}
                        <select
                          className="w-full p-2 border border-gray-300 rounded"
                          value={childFormData.gender}
                          onChange={(e) =>
                            handleChildFormChange("gender", e.target.value)
                          }
                          disabled={submitting}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        <input
                          className="w-full p-2 border border-gray-300 rounded"
                          type="date"
                          value={childFormData.dob}
                          onChange={(e) =>
                            handleChildFormChange("dob", e.target.value)
                          }
                          disabled={submitting}
                        />
                        {dobError && (
                          <p className="text-xs text-red-500 mt-1">
                            {dobError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Will Come & Address Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Will you come to Durga Sthan to get your Mahaprasad?
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="willCome"
                      value="YES"
                      checked={formData.willCome === "YES"}
                      onChange={(e) =>
                        handleInputChange("willCome", e.target.value)
                      }
                      className="text-red-500 focus:ring-red-500"
                      disabled={submitting}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      YES
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="willCome"
                      value="NO"
                      checked={formData.willCome === "NO"}
                      onChange={(e) =>
                        handleInputChange("willCome", e.target.value)
                      }
                      className="text-red-500 focus:ring-red-500"
                      disabled={submitting}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      NO, Send via courier
                    </span>
                  </label>
                </div>
              </div>

              {formData.willCome === "NO" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Courier/Postal Address
                  </label>
                  <textarea
                    value={formData.courierAddress}
                    onChange={(e) =>
                      handleInputChange("courierAddress", e.target.value)
                    }
                    placeholder="Please write your complete courier/postal address..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    rows="3"
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                    Please confirm your address. The courier charge will be
                    calculated based on this address.
                  </p>
                </div>
              )}

              {/* Donation Items */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-red-500" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Donation Details
                  </h3>
                </div>
                <div className="space-y-4">
                  {formData.donationItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg border"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-700">
                          Item {index + 1}
                        </span>
                        {formData.donationItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDonationItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            disabled={submitting}
                          >
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Category
                          </label>
                          <select
                            value={item.categoryId}
                            onChange={(e) =>
                              handleDonationItemChange(
                                index,
                                "categoryId",
                                e.target.value
                              )
                            }
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                            required
                            disabled={submitting}
                          >
                            <option value="">Select Category...</option>
                            {getAvailableCategories(index).map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.categoryName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Quantity
                          </label>
                          <input
                            type="text"
                            value={item.isDynamic ? "" : item.quantity}
                            onChange={(e) => {
                              console.log("Item: ", item);
                              const value = e.target.value;
                              // Allow empty string or valid numbers without leading zeros
                              if (
                                value === "" ||
                                (/^\d+$/.test(value) && !value.startsWith("0"))
                              ) {
                                const numValue =
                                  value === "" ? 0 : parseInt(value);
                                handleDonationItemChange(
                                  index,
                                  "quantity",
                                  numValue
                                );
                              }
                            }}
                            onBlur={(e) => {
                              // Set minimum value of 1 on blur if empty or 0
                              if (
                                e.target.value === "" ||
                                parseInt(e.target.value) === 0
                              ) {
                                handleDonationItemChange(index, "quantity", 1);
                              }
                            }}
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                            placeholder={
                              item.isDynamic ? "Not Applicable" : "Qty"
                            }
                            required
                            disabled={item.isDynamic || submitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Amount (₹)
                          </label>
                          <input
                            type="number"
                            min={item.minvalue || 0}
                            value={item.rate}
                            onChange={(e) =>
                              handleDonationItemChange(
                                index,
                                "rate",
                                e.target.value
                              )
                            }
                            className={`w-full p-2 text-sm border border-gray-300 rounded ${
                              !item.isDynamic &&
                              "bg-gray-100 cursor-not-allowed"
                            }`}
                            placeholder="Amount"
                            readOnly={!item.isDynamic}
                            disabled={submitting || !item.isDynamic}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDonationItem}
                    className="w-full p-3 border-2 border-dashed border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    <Plus size={20} /> Add More Items
                  </button>
                </div>
              </div>

              {/* Summaries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Mahaprasad Details
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Your donation is a great help to our community.</li>
                    <li>
                      As a token of our gratitude, we will send you Mahaprasad.
                      {formData.donationItems.reduce(
                        (sum, item) => sum + (item.weight || 0),
                        0
                      ) > 0 && (
                        <span>
                          {" "}
                          Total Halwa:{" "}
                          <strong>
                            {Math.floor(
                              formData.donationItems.reduce(
                                (sum, item) => sum + (item.weight || 0),
                                0
                              ) / 1000
                            )}{" "}
                            kg{" "}
                            {formData.donationItems.reduce(
                              (sum, item) => sum + (item.weight || 0),
                              0
                            ) % 1000}{" "}
                            g.
                          </strong>
                        </span>
                      )}
                      {formData.donationItems.reduce(
                        (sum, item) => sum + (item.packet || 0),
                        0
                      ) > 0 && (
                        <span>
                          {" "}
                          Total Packets:{" "}
                          <strong>
                            {formData.donationItems.reduce(
                              (sum, item) => sum + (item.packet || 0),
                              0
                            )}
                            .
                          </strong>
                        </span>
                      )}
                    </li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Donation Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Donation:</span>
                      <span className="font-medium">
                        ₹{totals.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Courier Charge:</span>
                      <span className="font-medium">
                        ₹{totals.courierCharge.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-red-200 pt-2 font-semibold">
                      <span className="text-gray-800">Net Payable:</span>
                      <span className="text-red-600 text-lg">
                        ₹{totals.netPayable.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard size={16} className="text-red-500" /> Payment
                  Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                  disabled={submitting}
                >
                  <option value="Online">Online Payment</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:bg-red-300 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>{" "}
                      Processing...
                    </div>
                  ) : (
                    `Submit Donation (₹${totals.netPayable.toFixed(2)})`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DonationModal;
