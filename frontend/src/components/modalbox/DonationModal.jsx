import React, { useState, useEffect, useContext } from "react";
import {
  X,
  Heart,
  MapPin,
  Package,
  CreditCard,
  Plus,
  Minus,
  Clock,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";

const DonationModal = ({ isOpen, onClose, backendUrl, userToken }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  // const [khandanDetails, setKhandanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courierCharges, setCourierCharges] = useState([]);
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
        isDynamic: false,
        minvalue: 0,
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

  const paymentMethods = ["Online"];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const { donations } = useContext(AppContext);
  const previousDonations = donations ? donations.slice(0, 2) : [];

  const convertAmountToWords = (amount) => {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    const convertHundreds = (num) => {
      let result = "";
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + " hundred ";
        num %= 100;
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + " ";
        return result;
      }
      if (num > 0) {
        result += ones[num] + " ";
      }
      return result;
    };

    if (amount === 0) return "zero rupees only";
    let amountStr = Math.floor(amount).toString();
    let words = "";
    if (amountStr.length > 7) {
      const crores = parseInt(amountStr.slice(0, -7));
      words += convertHundreds(crores) + "crore ";
      amountStr = amountStr.slice(-7);
    }
    if (amountStr.length > 5) {
      const lakhs = parseInt(amountStr.slice(0, -5));
      words += convertHundreds(lakhs) + "lakh ";
      amountStr = amountStr.slice(-5);
    }
    if (amountStr.length > 3) {
      const thousands = parseInt(amountStr.slice(0, -3));
      words += convertHundreds(thousands) + "thousand ";
      amountStr = amountStr.slice(-3);
    }
    if (parseInt(amountStr) > 0) {
      words += convertHundreds(parseInt(amountStr));
    }
    return words.trim() + " rupees only";
  };

  const fetchCourierCharges = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/courier-charges`, {
        headers: { utoken: userToken },
      });
      if (response.ok) {
        const data = await response.json();
        setCourierCharges(data.courierCharges);
      } else {
        console.error("Failed to fetch courier charges");
      }
    } catch (error) {
      console.error("Error fetching courier charges:", error);
    }
  };

  useEffect(() => {
    if (isOpen && userToken) {
      fetchUserProfile();
      fetchCategories();
      fetchCourierCharges();
    }
  }, [isOpen, userToken]);

  useEffect(() => {
    if (userProfile && userProfile.khandanid) {
      // fetchKhandanDetails(userProfile.khandanid);
      const prefillAddress = getPrefillAddress();
      if (prefillAddress) {
        setFormData((prev) => ({ ...prev, courierAddress: prefillAddress }));
      }
    }
  }, [userProfile]);

  useEffect(() => {
    calculateTotals();
  }, [
    formData.donationItems,
    formData.willCome,
    courierCharges,
    userProfile,
    formData.courierAddress,
  ]);

  const isUserInManpurArea = () => {
    if (!userProfile?.address?.currlocation) return false;
    const location = userProfile.address.currlocation.toLowerCase();
    return (
      location.includes("manpur") ||
      (location.includes("gaya") && location.includes("manpur"))
    );
  };

  const getPrefillAddress = () => {
    if (!userProfile?.address) return "";
    const address = userProfile.address;
    const addressParts = [];
    if (address.room) addressParts.push("Room: " + address.room);
    if (address.floor) addressParts.push("Floor: " + address.floor);
    if (address.apartment) addressParts.push(address.apartment);
    if (address.street) addressParts.push(address.street);
    if (address.landmark) addressParts.push(address.landmark);
    if (address.postoffice) addressParts.push("PO: " + address.postoffice);
    if (address.city) addressParts.push(address.city);
    if (address.district && address.district !== address.city)
      addressParts.push(address.district);
    if (address.state) addressParts.push(address.state);
    if (address.country) addressParts.push(address.country);
    if (address.pin) addressParts.push(address.pin);
    return addressParts.join(", ");
  };

  const getCourierChargeForUser = () => {
    if (!formData.courierAddress || courierCharges.length === 0) return 600;
    const location = formData.courierAddress.toLowerCase();
    if (location.includes("manpur")) return 0;
    if (location.includes("gaya")) {
      const charge = courierCharges.find(
        (c) => c.region === "in_gaya_outside_manpur"
      );
      return charge ? charge.amount : 600;
    }
    if (location.includes("bihar")) {
      const charge = courierCharges.find(
        (c) => c.region === "in_bihar_outside_gaya"
      );
      return charge ? charge.amount : 600;
    }
    if (location.includes("india")) {
      const charge = courierCharges.find(
        (c) => c.region === "in_india_outside_bihar"
      );
      return charge ? charge.amount : 600;
    }
    const charge = courierCharges.find((c) => c.region === "outside_india");
    return charge ? charge.amount : 600;
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/get-profile`, {
        headers: { utoken: userToken },
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.userData);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchKhandanDetails = async (khandanId) => {
  //   try {
  //     const response = await fetch(
  //       `${backendUrl}/api/khandan/get-khandan/${khandanId}`
  //     );
  //     if (response.ok) {
  //       const data = await response.json();
  //       setKhandanDetails(data.khandan);
  //     } else {
  //       console.error("Failed to fetch khandan details");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching khandan details:", error);
  //   }
  // };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user/categories`, {
        headers: { utoken: userToken },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getAvailableCategories = (currentIndex) => {
    const selectedCategoryIds = formData.donationItems
      .map((item, index) => (index !== currentIndex ? item.categoryId : null))
      .filter(Boolean);
    return categories.filter(
      (category) => !selectedCategoryIds.includes(category._id)
    );
  };

  const calculateTotals = () => {
    const totalAmount = formData.donationItems.reduce(
      (sum, item) => sum + (parseFloat(item.rate) || 0),
      0
    );
    const courierCharge =
      formData.willCome === "NO" ? getCourierChargeForUser() : 0;
    const netPayable = totalAmount + courierCharge;
    setTotals({ totalAmount, courierCharge, netPayable });
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
      item.quantity = 1;

      if (item.isPacketBased) {
        item.unitWeight = 0;
        item.unitPacket = 1;
      } else {
        item.unitWeight = selectedCategory.weight || 0;
        item.unitPacket = 0;
      }

      item.rate = item.unitAmount;
      if (item.isDynamic) {
        item.weight =
          item.rate < item.unitAmount ? item.minvalue : item.unitWeight;
        item.packet = 0;
      } else {
        item.weight = item.unitWeight * item.quantity;
        item.packet = item.unitPacket * item.quantity;
      }
    } else if (field === "quantity" && !item.isDynamic) {
      const quantity = parseInt(value) >= 1 ? parseInt(value) : 1;
      item.quantity = quantity;
      item.rate = item.unitAmount * quantity;
      item.weight = item.unitWeight * quantity;
      item.packet = item.unitPacket * quantity;
    } else if (field === "rate" && item.isDynamic) {
      const newAmount = parseFloat(value) || 0;
      item.rate = newAmount;
      if (newAmount < item.unitAmount) {
        item.weight = item.minvalue;
      } else {
        item.weight = Math.floor(newAmount / item.unitAmount) * item.unitWeight;
      }
      item.packet = 0;
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
      const updatedItems = formData.donationItems.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, donationItems: updatedItems }));
    }
  };

  const handleRazorpayPayment = async (order, donationId) => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load.");
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
            alert("Payment successful!");
            onClose();
            resetForm();
          } else {
            alert(`Payment verification failed: ${verifyResult.message}`);
          }
        } catch (error) {
          alert("Error verifying payment.");
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

  const resetForm = () => {
    setFormData({
      willCome: "YES",
      courierAddress: "",
      paymentMethod: "",
      remarks: "",
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
    });
  };

  const handleSubmit = async () => {
    if (!formData.paymentMethod) return alert("Please select a payment method");
    if (formData.donationItems.some((item) => !item.categoryId))
      return alert("Please select a category for all items");
    if (formData.willCome === "NO" && !formData.courierAddress.trim())
      return alert("Please provide a courier address");
    if (totals.netPayable <= 0)
      return alert("Donation amount must be greater than zero");

    try {
      setSubmitting(true);
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

      const response = await fetch(
        `${backendUrl}/api/user/create-donation-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", utoken: userToken },
          body: JSON.stringify(donationData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (result.paymentRequired && result.order) {
            await handleRazorpayPayment(result.order, result.donationId);
          } else {
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
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin size={16} className="text-red-500" /> Donor Information
            </label>
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              {userProfile ? (
                <div className="text-gray-700">
                  <span className="font-medium">{userProfile.fullname}</span>

                  <span className="text-gray-500">
                    {" "}
                    • S/o {userProfile.fatherName}
                  </span>

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
                <span className="text-sm font-medium text-gray-700">YES</span>
              </label>
              <label
                className={`flex items-center gap-2 ${
                  isUserInManpurArea()
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  name="willCome"
                  value="NO"
                  checked={formData.willCome === "NO"}
                  onChange={(e) =>
                    handleInputChange("willCome", e.target.value)
                  }
                  className="text-red-500 focus:ring-red-500"
                  disabled={submitting || isUserInManpurArea()}
                />
                <span className="text-sm font-medium text-gray-700">
                  NO{" "}
                  {isUserInManpurArea() && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Not available)
                    </span>
                  )}
                </span>
              </label>
            </div>
            {isUserInManpurArea() && (
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                You can collect your Mahaprasad directly from Durga Sthan.
              </p>
            )}
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
                required={formData.willCome === "NO"}
                disabled={submitting}
              />
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                Please confirm your address. The courier charge will be
                calculated based on this address.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-red-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Donation Details
              </h3>
            </div>
            <div className="space-y-4">
              {formData.donationItems.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-1">
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

                    {!item.isDynamic && (
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity
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
                          className={`w-full p-2 text-sm border border-gray-300 rounded ${
                            item.isPacketBased &&
                            "bg-gray-100 cursor-not-allowed"
                          }`}
                          placeholder="Qty"
                          required
                          disabled={item.isPacketBased || submitting}
                        />
                      </div>
                    )}

                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleDonationItemChange(
                            index,
                            "rate",
                            e.target.value
                          )
                        }
                        className={`w-full p-2 text-sm border border-gray-300 rounded ${
                          !item.isDynamic && "bg-gray-100 cursor-not-allowed"
                        }`}
                        placeholder="Amount"
                        readOnly={!item.isDynamic}
                        disabled={submitting}
                      />
                    </div>

                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Weight (g)
                      </label>
                      <input
                        type="number"
                        value={item.weight.toFixed(2)}
                        className="w-full p-2 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                        placeholder="Weight"
                        readOnly
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    g
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CreditCard size={16} className="text-red-500" /> Payment Method
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
              className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>{" "}
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
