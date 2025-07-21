import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  MapPin,
  Package,
  CreditCard,
  Plus,
  Minus,
  QrCode,
} from "lucide-react";
// import QRCode from "qrcode.react";

const DonationModal = ({ isOpen, onClose, backendUrl, userToken }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [khandanDetails, setKhandanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
      },
    ],
    paymentMethod: "",
    remarks: "",
  });

  const [totals, setTotals] = useState({
    totalAmount: 0,
    courierCharge: 0,
    netPayable: 0,
  });

  // const paymentMethods = ["Cash", "Online", "QR Code"];
  const paymentMethods = ["Online"];

  // const YOUR_UPI_ID = import.meta.env. ; // e.g., "example@upi"
  // const YOUR_MERCHANT_NAME = "Durga Sthan Donations"; // e.g., "Durga Sthan"

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

  // Fetch user profile and categories on component mount
  useEffect(() => {
    if (isOpen && userToken) {
      fetchUserProfile();
      fetchCategories();
    }
  }, [isOpen, userToken]);

  // Fetch khandan details when userProfile is loaded
  useEffect(() => {
    if (userProfile && userProfile.khandanid) {
      fetchKhandanDetails(userProfile.khandanid);
    }
  }, [userProfile]);

  // Recalculate totals when donation items or willCome changes
  useEffect(() => {
    calculateTotals();
  }, [formData.donationItems, formData.willCome]);

  const capitalizeEachWord = (str) => {
    if (!str) return ""; // Handle empty or null strings
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/get-profile`, {
        headers: {
          utoken: userToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUserProfile(data.userData);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Error fetching user profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKhandanDetails = async (khandanId) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/khandan/get-khandan/${khandanId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setKhandanDetails(data.khandan);
      } else {
        console.error("Failed to fetch khandan details");
      }
    } catch (error) {
      console.error("Error fetching khandan details:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/categories`, {
        headers: {
          userToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Error fetching categories. Please try again.");
    }
  };

  // Get available categories for a specific donation item
  const getAvailableCategories = (currentIndex) => {
    const selectedCategoryIds = formData.donationItems
      .map((item, index) => (index !== currentIndex ? item.categoryId : null))
      .filter(Boolean);

    return categories.filter(
      (category) => !selectedCategoryIds.includes(category._id)
    );
  };

  const calculateTotals = () => {
    const totalAmount = formData.donationItems.reduce((sum, item) => {
      return sum + (parseFloat(item.rate) || 0);
    }, 0);

    const courierCharge = formData.willCome === "NO" ? 600 : 0;
    const netPayable = totalAmount + courierCharge;

    setTotals({
      totalAmount,
      courierCharge,
      netPayable,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDonationItemChange = (index, field, value) => {
    const updatedItems = [...formData.donationItems];
    const item = { ...updatedItems[index] };

    if (field === "categoryId") {
      const selectedCategory = categories.find((cat) => cat._id === value);
      console.log("Selected Category: ", selectedCategory);

      if (selectedCategory) {
        item.categoryId = value;
        item.category = selectedCategory.categoryName;
        item.unitAmount = selectedCategory.rate || 0;
        item.isPacketBased = selectedCategory.packet || false;

        // Set unit values based on category type
        if (item.isPacketBased) {
          // For packet-based items: weight is 0, packet count is always 1 per item
          item.unitWeight = 0;
          item.unitPacket = 1;
        } else {
          // For weight-based items: packet is 0, weight from category
          item.unitWeight = selectedCategory.weight || 0;
          item.unitPacket = 0;
        }

        // Calculate totals based on quantity
        const quantity = parseInt(item.quantity) || 1;

        if (item.isPacketBased) {
          // For packet-based: rate is per packet (quantity = number of packets)
          item.rate = item.unitAmount * quantity;
          item.weight = 0; // Always 0 for packet-based
          item.packet = quantity; // Each quantity unit is 1 packet
        } else {
          // For weight-based: rate and weight scale with quantity
          item.rate = item.unitAmount * quantity;
          item.weight = item.unitWeight * quantity;
          item.packet = 0; // Always 0 for weight-based
        }
      }
      console.log("Updated item: ", item);
    } else if (field === "quantity") {
      const quantity = parseInt(value) || 1;
      item.quantity = quantity;

      if (item.isPacketBased) {
        // For packet-based items
        item.rate = item.unitAmount * quantity;
        item.weight = 0; // Always 0 for packet-based
        item.packet = quantity; // Each quantity unit is 1 packet
      } else {
        // For weight-based items
        item.rate = item.unitAmount * quantity;
        item.weight = item.unitWeight * quantity;
        item.packet = 0; // Always 0 for weight-based
      }
    } else {
      item[field] = value;
    }

    updatedItems[index] = item;
    setFormData((prev) => ({
      ...prev,
      donationItems: updatedItems,
    }));
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
        },
      ],
    }));
  };

  const removeDonationItem = (index) => {
    if (formData.donationItems.length > 1) {
      const updatedItems = formData.donationItems.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        donationItems: updatedItems,
      }));
    }
  };

  const handleRazorpayPayment = async (order, donationId) => {
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      alert(
        "Razorpay SDK failed to load. Please check your internet connection."
      );
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Donation Payment",
      description: "Donation for Durga Sthan",
      order_id: order.id,
      handler: async (response) => {
        try {
          setSubmitting(true);

          // Verify payment
          const verifyResponse = await fetch(
            `${backendUrl}/api/user/verify-donation-payment`,
            {
              method: "POST",
              headers: {
                utoken: userToken,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: donationId,
              }),
            }
          );

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            alert("Payment successful! Your donation has been recorded.");
            onClose();
            resetForm();
          } else {
            alert(`Payment verification failed: ${verifyResult.message}`);
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          alert("Error verifying payment. Please contact support.");
        } finally {
          setSubmitting(false);
        }
      },
      prefill: {
        name: userProfile?.fullname || "",
        email: userProfile?.contact?.email || "",
        contact: userProfile?.contact?.mobileno?.number || "",
      },
      theme: {
        color: "#EF4444",
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const resetForm = () => {
    setFormData({
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
        },
      ],
      paymentMethod: "",
      remarks: "",
    });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (formData.donationItems.some((item) => !item.categoryId)) {
      alert("Please select category for all donation items");
      return;
    }

    if (formData.willCome === "NO" && !formData.courierAddress.trim()) {
      alert("Please provide courier address");
      return;
    }

    if (totals.netPayable <= 0) {
      alert("Please add at least one donation item");
      return;
    }

    try {
      setSubmitting(true);
      console.log("userProfile: ", userProfile);
      console.log("formData: ", formData);
      console.log("totals: ", totals);

      // Prepare donation data according to backend schema
      const donationData = {
        userId: userProfile._id,
        list: formData.donationItems.map((item) => ({
          category: item.category,
          number: item.quantity,
          amount: item.rate,
          isPacket: item.isPacketBased ? item.packet : 0,
          quantity: item.weight,
        })),
        amount: totals.netPayable,
        method: formData.paymentMethod,
        courierCharge: totals.courierCharge,
        remarks: formData.remarks || "",
        postalAddress:
          formData.willCome === "NO"
            ? formData.courierAddress
            : "Will collect from Durga Sthan",
      };

      console.log("Sending donation data:", donationData);

      const response = await fetch(
        `${backendUrl}/api/user/create-donation-order`,
        {
          method: "POST",
          headers: {
            utoken: userToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(donationData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Donation order created:", result);

        if (result.success) {
          if (result.paymentRequired && result.order) {
            // Handle online payment with Razorpay
            await handleRazorpayPayment(result.order, result.donationId);
          } else {
            // Handle cash payment
            alert("Cash donation recorded successfully!");
            onClose();
            resetForm();
          }
        } else {
          throw new Error(result.message || "Failed to create donation order");
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create donation order");
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(`Error submitting donation: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            disabled={submitting}
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Heart className="animate-pulse" size={32} />
            <div>
              <h2 className="text-2xl font-bold">Make a Donation</h2>
              <p className="text-red-100 mt-1">Help those who need it most</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Information */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin size={16} className="text-red-500" />
              Donor Information
            </label>
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              {userProfile ? (
                <div className="text-gray-700">
                  <span className="font-medium">{userProfile.fullname}</span>
                  {khandanDetails && (
                    <span className="text-gray-500">
                      {" "}
                      • W/o {khandanDetails.name}
                    </span>
                  )}
                  <span className="text-gray-500">
                    {" "}
                    • {userProfile.contact.mobileno.number}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">
                  Loading user information...
                </span>
              )}
            </div>
          </div>

          {/* Will Come Question */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Will you come to Durga Sthan, Manpur, Patwatoli to get your
              Mahaprasad?
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
                <span className="text-sm font-medium text-gray-700">YES</span>
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
                <span className="text-sm font-medium text-gray-700">NO</span>
              </label>
            </div>
          </div>

          {/* Courier Address */}
          {formData.willCome === "NO" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Courier/Postal Address for Mahaprasad
              </label>
              <textarea
                value={formData.courierAddress}
                onChange={(e) =>
                  handleInputChange("courierAddress", e.target.value)
                }
                placeholder="Please write your complete courier/postal address..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                rows="3"
                required={formData.willCome === "NO"}
                disabled={submitting}
              />
            </div>
          )}

          {/* Donation Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-red-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Donation Details
              </h3>
            </div>

            {/* Donation Items */}
            <div className="space-y-4">
              {formData.donationItems.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">
                      Item {index + 1}
                      {item.isPacketBased && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Packet-based
                        </span>
                      )}
                      {!item.isPacketBased && item.categoryId && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Weight-based
                        </span>
                      )}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        Quantity {item.isPacketBased ? "(Jobs)" : "(Units)"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleDonationItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Qty"
                        required
                        disabled={item.isPacketBased || submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        className="w-full p-2 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                        placeholder="Amount"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Weight (Kg)
                      </label>
                      <input
                        type="number"
                        value={item.weight}
                        className="w-full p-2 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                        placeholder={item.isPacketBased ? "N/A" : "Weight"}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Packets
                      </label>
                      <input
                        type="number"
                        value={item.packet}
                        className="w-full p-2 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                        placeholder={item.isPacketBased ? "Packets" : "N/A"}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addDonationItem}
                className="w-full p-3 border-2 border-dashed border-red-300 text-red-600 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                <Plus size={20} />
                Add More Items
              </button>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Remarks (Optional)
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Any additional comments or special instructions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
              rows="2"
              disabled={submitting}
            />
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mahaprasad Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Mahaprasad Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Weight:</span>
                  <span className="font-medium">
                    {formData.donationItems
                      .reduce(
                        (sum, item) => sum + (parseFloat(item.weight) || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    Kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Packets:</span>
                  <span className="font-medium">
                    {formData.donationItems.reduce(
                      (sum, item) => sum + (parseFloat(item.packet) || 0),
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Donation Summary */}
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
              <CreditCard size={16} className="text-red-500" />
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                handleInputChange("paymentMethod", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              required
              disabled={submitting}
            >
              <option value="">Select Payment Method...</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method === "Cash"
                    ? "Cash (Pay at Collection)"
                    : "Online Payment"}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                "Submit Donation"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
