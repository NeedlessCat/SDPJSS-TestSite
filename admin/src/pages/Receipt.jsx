import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
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
  Clock,
  Trash2,
  Download,
  XCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  Scissors,
} from "lucide-react";
import axios from "axios";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";

// Helper function to convert number to Indian currency words
const toWords = (num) => {
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
  const numToWords = (n) => {
    let word = "";
    if (n === 0) return word;
    if (n < 20) {
      word = ones[n];
    } else {
      word =
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    }
    return word;
  };
  const number = Math.round(num);
  if (number === 0) return "Zero Rupees Only";
  if (number > 999999999) return "Number is too large";
  let result = "";
  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const hundred = Math.floor((number % 1000) / 100);
  const rest = number % 100;
  if (crore) result += numToWords(crore) + " Crore ";
  if (lakh) result += numToWords(lakh) + " Lakh ";
  if (thousand) result += numToWords(thousand) + " Thousand ";
  if (hundred) result += numToWords(hundred) + " Hundred ";
  if (rest) result += numToWords(rest);
  return result.trim().replace(/\s+/g, " ") + " Rupees Only";
};

const ReceiptTemplate = ({ donationData, userData, adminName }) => {
  if (!donationData || !userData) return null;

  const finalTotalAmount = donationData.amount;

  const headerCellStyle = {
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    backgroundColor: "#f2f2f2",
    fontWeight: 600,
  };
  const bodyCellStyle = {
    padding: "10px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
  };
  const bodyCellRightAlign = { ...bodyCellStyle, textAlign: "right" };

  return (
    <div
      className="bill-container"
      style={{
        maxWidth: "800px",
        margin: "auto",
        border: "1px solid #ccc",
        padding: "25px",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#333",
        position: "relative",
      }}
    >
      <div
        className="header"
        style={{
          textAlign: "center",
          borderBottom: "2px solid #16a34a",
          paddingBottom: "15px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#16a34a",
            marginBottom: "5px",
          }}
        >
          SDPJSS
        </div>
        <div style={{ fontSize: "16px", color: "#666", marginBottom: "10px" }}>
          Shree Durga Patwaye Jati Sudhar Samiti
        </div>
        <div>Durga Asthan, Manpur, Gaya, Bihar, India - 823003</div>
      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: 600,
          textAlign: "center",
          margin: "20px 0",
        }}
      >
        DONATION RECEIPT
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        <div>
          <strong>Receipt No:</strong> {donationData.receiptId}
        </div>
        <div>
          <strong>Date:</strong>{" "}
          {new Date(donationData.createdAt).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "15px",
          border: "1px dashed #ddd",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: "#16a34a",
            borderBottom: "1px solid #eee",
            paddingBottom: "5px",
          }}
        >
          Donor Details
        </h3>
        <p style={{ fontSize: "14px", margin: "5px 0" }}>
          <strong>Name:</strong> {userData.fullname}
        </p>
        <p style={{ fontSize: "14px", margin: "5px 0" }}>
          <strong>Khandan:</strong> {userData.khandanName}
        </p>
        <p style={{ fontSize: "14px", margin: "5px 0" }}>
          <strong>Mobile:</strong> {userData.contact.mobileno?.code}{" "}
          {userData.contact.mobileno?.number}
        </p>
        <p style={{ fontSize: "14px", margin: "5px 0" }}>
          <strong>Address:</strong>{" "}
          {`${userData.address.street}, ${userData.address.city}, ${userData.address.state} - ${userData.address.pin}`}
        </p>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={headerCellStyle}>Item</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Quantity</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          {donationData.list.map((item, index) => (
            <tr key={index}>
              <td style={bodyCellStyle}>{item.category}</td>
              <td style={bodyCellRightAlign}>
                {item.number.toLocaleString("en-IN")}
              </td>
              <td style={bodyCellRightAlign}>
                ₹{item.amount.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
          {donationData.courierCharge > 0 && (
            <tr>
              <td
                colSpan={2}
                style={{
                  ...bodyCellStyle,
                  borderTop: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                Courier Charges
              </td>
              <td
                style={{
                  ...bodyCellRightAlign,
                  borderTop: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                ₹{donationData.courierCharge.toLocaleString("en-IN")}
              </td>
            </tr>
          )}
          <tr
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              backgroundColor: "#f2f2f2",
            }}
          >
            <td
              colSpan={2}
              style={{
                padding: "12px 10px",
                textAlign: "left",
                borderTop: "2px solid #ddd",
              }}
            >
              TOTAL AMOUNT
            </td>
            <td
              style={{
                ...bodyCellRightAlign,
                padding: "12px 10px",
                borderTop: "2px solid #ddd",
              }}
            >
              ₹{finalTotalAmount.toLocaleString("en-IN")}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          padding: "12px",
          backgroundColor: "#f9f9f9",
          borderLeft: "4px solid #16a34a",
          marginTop: "20px",
          fontWeight: "bold",
        }}
      >
        Amount in Words: {toWords(finalTotalAmount)}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          paddingTop: "15px",
          borderTop: "1px solid #ccc",
          fontSize: "12px",
          color: "#777",
        }}
      >
        <p>
          Thank you for your generous contribution. This is a computer-generated
          receipt.
        </p>
        <p style={{ marginTop: "10px", fontStyle: "italic" }}>
          Generated by: <strong>{adminName || "Admin"}</strong>
        </p>
      </div>
    </div>
  );
};

const ReceiptModal = ({ data, isGroup, onClose, adminName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const receiptRef = useRef(null);

  const currentReceipt = isGroup ? data[currentIndex] : data;
  if (!currentReceipt) return null;

  const handleDownloadClick = (receiptNode, filename) => {
    html2pdf()
      .from(receiptNode)
      .set({
        margin: 0.5,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Receipt Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleDownloadClick(
                  receiptRef.current,
                  `Receipt-${currentReceipt.donationData.receiptId}.pdf`
                )
              }
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              <Download size={18} /> Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto relative">
          {isGroup && (
            <>
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md hover:bg-gray-100 disabled:opacity-30 z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((p) => Math.min(data.length - 1, p + 1))
                }
                disabled={currentIndex === data.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md hover:bg-gray-100 disabled:opacity-30 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div ref={receiptRef}>
            <ReceiptTemplate
              donationData={currentReceipt.donationData}
              userData={currentReceipt.userData}
              adminName={adminName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Receipt = () => {
  const {
    backendUrl,
    aToken,
    userList,
    getUserList,
    getFamilyList,
    getDonationList,
    donationList,
    adminName,
  } = useContext(AdminContext);

  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [donationType, setDonationType] = useState("individual");
  const [groupDonations, setGroupDonations] = useState([]);
  const [totalGroupAmount, setTotalGroupAmount] = useState(0);
  const [isPayingGroup, setIsPayingGroup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [willCome, setWillCome] = useState("YES");
  const [courierAddress, setCourierAddress] = useState("");
  const [donations, setDonations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [dynamicAmount, setDynamicAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [khandans, setKhandans] = useState([]);
  const [courierCharges, setCourierCharges] = useState([]);
  const [userPreviousDonations, setUserPreviousDonations] = useState([]);
  const [isEldest, setIsEldest] = useState(false);
  const [usersInSelectedKhandan, setUsersInSelectedKhandan] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [newUser, setNewUser] = useState({
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

  const handleCloseModal = () => {
    setShowReceiptModal(false);
    setReceiptData(null);
    resetForm();
  };

  const userSearchRef = useRef(null);
  const paymentMethods = ["Cash", "Online"];
  const genderOptions = ["male", "female", "other"];

  useEffect(() => {
    if (donationType === "group") {
      setPaymentMethod("Cash");
    } else {
      setPaymentMethod("");
    }
  }, [donationType]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^\d{10}$/.test(mobile);
  const ValidationMessage = ({ show, message }) =>
    !show ? null : <p className="text-red-500 text-sm mt-1">{message}</p>;
  const emailError =
    newUser.contact.email && !validateEmail(newUser.contact.email);
  const mobileError =
    newUser.contact.mobileno.number &&
    !validateMobile(newUser.contact.mobileno.number);

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

  const capitalizeEachWord = (str) =>
    !str
      ? ""
      : str
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

  const handleKhandanChangeForNewUser = (khandanId) => {
    setNewUser((prev) => ({ ...prev, khandanid: khandanId, fatherid: "" }));
    setIsEldest(false);
    if (khandanId) {
      const allUsersInKhandan = userList.filter(
        (user) => user.khandanid._id === khandanId && user.gender === "male"
      );
      setUsersInSelectedKhandan(allUsersInKhandan);
    } else {
      setUsersInSelectedKhandan([]);
    }
  };

  const handleEldestChangeForNewUser = (checked) => {
    setIsEldest(checked);
    setNewUser((prev) => ({
      ...prev,
      fatherid: checked && newUser.khandanid ? newUser.khandanid : "",
    }));
  };

  const fetchCourierCharges = async () => {
    try {
      const response = await axios.get(
        backendUrl + "/api/admin/courier-charges",
        { headers: { aToken } }
      );
      if (response.data.success) {
        setCourierCharges(response.data.courierCharges || []);
      }
    } catch (error) {
      console.error("Error fetching courier charges:", error);
    }
  };

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

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/categories", {
        headers: { aToken },
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
    const locationToCourierRegionMap = {
      in_gaya_outside_manpur: "in_gaya_outside_manpur",
      in_bihar_outside_gaya: "in_bihar_outside_gaya",
      in_india_outside_bihar: "in_india_outside_bihar",
      outside_india: "outside_india",
    };
    const courierRegion = locationToCourierRegionMap[user.address.currlocation];
    if (!courierRegion) return 0;
    const courierCharge = courierCharges.find(
      (charge) => charge.region === courierRegion
    );
    return courierCharge ? courierCharge.amount : 0;
  };

  const loadDonations = async () => {
    try {
      await getDonationList();
    } catch (error) {
      console.error("Error loading donations:", error);
    }
  };

  const getKhandanName = (khandanId) => {
    const khandan = khandans.find((k) => k._id === khandanId._id);
    return khandan ? khandan.name : "Unknown Khandan";
  };

  const formatKhandanOption = (khandan) =>
    `${khandan.name}${
      khandan.address.landmark ? `, ${khandan.address.landmark}` : ""
    }${khandan.address.street ? `, ${khandan.address.street}` : ""} (${
      khandan.khandanid
    })`;

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

  useEffect(() => {
    if (selectedUser && donationList) {
      const previous = donationList
        .filter((donation) => donation.userId?._id === selectedUser._id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2);
      setUserPreviousDonations(previous);
    } else {
      setUserPreviousDonations([]);
    }
  }, [selectedUser, donationList]);

  const getAvailableCategories = () => {
    const selectedCategoryIds = donations.map((d) => d.categoryId);
    return categories.filter(
      (cat) => !selectedCategoryIds.includes(cat._id) && cat.isActive
    );
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserSearch("");
    setShowUserDropdown(false);
    if (userSearchRef.current) {
      userSearchRef.current.blur();
    }
  };

  const handleAddDonation = () => {
    if (!selectedCategory) {
      toast.warn("Please select a category.");
      return;
    }
    const category = categories.find((cat) => cat._id === selectedCategory);
    if (!category) return;

    const isDynamic = category.dynamic?.isDynamic;
    let newDonation;

    if (isDynamic) {
      const amount = Number(dynamicAmount) || 0;
      if (amount <= 0) {
        toast.warn("Please enter a valid amount for the dynamic donation.");
        return;
      }
      let weight = 0;
      if (amount < category.rate) {
        weight = category.dynamic.minvalue;
      } else {
        weight = Math.floor(amount / category.rate) * category.weight;
      }
      newDonation = {
        id: Date.now(),
        categoryId: category._id,
        category: category.categoryName,
        number: 1,
        amount: amount,
        isPacket: false,
        quantity: weight,
      };
    } else {
      if (!quantity || parseInt(quantity, 10) < 1) {
        toast.warn("Please enter a valid quantity.");
        return;
      }
      const amount = category.rate * parseInt(quantity, 10);
      const weight = category.weight * parseInt(quantity, 10);
      newDonation = {
        id: Date.now(),
        categoryId: category._id,
        category: category.categoryName,
        number: parseInt(quantity, 10),
        amount: amount,
        isPacket: category.packet,
        quantity: weight,
      };
    }

    setDonations([...donations, newDonation]);
    setSelectedCategory("");
    setQuantity(1);
    setDynamicAmount("");
    setSelectedCategoryDetails(null);
  };

  const removeDonation = (id) => {
    setDonations(donations.filter((donation) => donation.id !== id));
  };

  const isLocalUser =
    selectedUser &&
    ["in_manpur", "in_gaya_outside_manpur"].includes(
      selectedUser.address.currlocation
    );

  useEffect(() => {
    if (isLocalUser) {
      setWillCome("YES");
    }
  }, [isLocalUser]);

  useEffect(() => {
    if (selectedCategory) {
      const details = categories.find((c) => c._id === selectedCategory);
      setSelectedCategoryDetails(details);
      if (details?.dynamic?.isDynamic) {
        setDynamicAmount(details.rate.toString());
        setQuantity(1);
      } else {
        setDynamicAmount("");
        setQuantity(details?.packet ? 1 : "");
      }
    } else {
      setSelectedCategoryDetails(null);
      setQuantity(1);
      setDynamicAmount("");
    }
  }, [selectedCategory, categories]);

  const totalAmount = donations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );
  const totalWeight = donations.reduce(
    (sum, donation) => sum + donation.quantity,
    0
  );
  const totalPackets = donations.reduce(
    (count, donation) => count + (donation.isPacket ? donation.number : 0),
    0
  );
  const courierCharge =
    willCome === "NO" && selectedUser
      ? getCourierChargeForUser(selectedUser)
      : 0;
  const netPayableAmount = totalAmount + courierCharge;

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

  const handleLocationChange = (locationValue) => {
    updateNestedField("address.currlocation", locationValue);
    const selectedLocation = locationOptions.find(
      (option) => option.value === locationValue
    );
    if (selectedLocation) {
      Object.keys(selectedLocation.address).forEach((key) =>
        updateNestedField(`address.${key}`, selectedLocation.address[key])
      );
    }
  };

  const handleRegisterUser = async () => {
    try {
      setLoading(true);
      if (
        !newUser.fullname ||
        !newUser.gender ||
        !newUser.dob ||
        !newUser.khandanid ||
        !newUser.address.currlocation ||
        (!isEldest && !newUser.fatherid)
      ) {
        alert("Please fill in all required fields...");
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
          username,
          ...newUser,
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
      alert(
        `Error registering user: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

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
        { headers: { aToken, "Content-Type": "application/json" } }
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
                donationId,
              },
              { headers: { aToken, "Content-Type": "application/json" } }
            );
            if (verifyResponse.data.success) {
              toast.success("Payment successful! Donation recorded.");
              setReceiptData(verifyResponse.data.data);
              setShowReceiptModal(true);
              await getDonationList();
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

  const resetForm = () => {
    setSelectedUser(null);
    setUserSearch("");
    setDonations([]);
    setWillCome("YES");
    setCourierAddress("");
    if (donationType === "individual") setPaymentMethod("");
    setRemarks("");
    setSelectedCategory("");
    setQuantity(1);
    setDynamicAmount("");
    setUserPreviousDonations([]);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return alert("Please select a user");
    if (donations.length === 0)
      return alert("Please add at least one donation");
    if (!paymentMethod) return alert("Please select a payment method");
    if (willCome === "NO" && !courierAddress.trim())
      return alert("Please provide courier address");

    try {
      setLoading(true);
      const orderData = {
        userId: selectedUser._id,
        list: donations.map((d) => ({
          categoryId: d.categoryId,
          category: d.category,
          number: d.number,
          amount: d.amount,
          isPacket: d.packet ? 1 : 0,
          quantity: d.quantity,
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
          { headers: { aToken, "Content-Type": "application/json" } }
        );
        if (response.data.success) {
          toast.success("Cash donation recorded successfully!");
          setReceiptData(response.data.data);
          setShowReceiptModal(true);
          await getDonationList();
        } else {
          alert(`Error: ${response.data.message}`);
        }
      } else if (paymentMethod === "Online") {
        await handleRazorpayPayment(orderData);
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("Error submitting donation");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroup = () => {
    if (!selectedUser || netPayableAmount <= 0) {
      alert("Please select a user and add donation items first.");
      return;
    }

    const newGroupEntry = {
      localId: Date.now(),
      user: selectedUser,
      donations: donations,
      netPayableAmount: netPayableAmount,
      orderPayload: {
        userId: selectedUser._id,
        list: donations.map((d) => ({
          categoryId: d.categoryId,
          category: d.category,
          number: d.number,
          amount: d.amount,
          isPacket: d.packet ? 1 : 0,
          quantity: d.quantity,
        })),
        amount: netPayableAmount,
        method: "Cash",
        courierCharge,
        remarks,
        postalAddress:
          willCome === "NO"
            ? courierAddress
            : `${selectedUser.address.street}, ${selectedUser.address.city}, ${selectedUser.address.state} - ${selectedUser.address.pin}`,
      },
    };

    setGroupDonations((prev) => [...prev, newGroupEntry]);
    setTotalGroupAmount((prev) => prev + netPayableAmount);
    toast.success(
      `${
        selectedUser.fullname
      }'s donation of ₹${netPayableAmount.toLocaleString(
        "en-IN"
      )} has been added to the group list.`
    );
    resetForm();
  };

  const handleDeleteFromGroup = (localId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this receipt from the group?"
      )
    ) {
      const receiptToRemove = groupDonations.find((g) => g.localId === localId);
      if (receiptToRemove) {
        setTotalGroupAmount((prev) => prev - receiptToRemove.netPayableAmount);
        setGroupDonations((prev) => prev.filter((g) => g.localId !== localId));
      }
    }
  };

  const handlePayGroup = async () => {
    if (
      groupDonations.length === 0 ||
      !window.confirm(`Process ${groupDonations.length} cash donations?`)
    ) {
      return;
    }
    setIsPayingGroup(true);
    const successfulReceipts = [];
    const failedReceipts = [];
    for (const receipt of groupDonations) {
      try {
        const response = await axios.post(
          backendUrl + "/api/admin/create-donation-order",
          receipt.orderPayload,
          { headers: { aToken, "Content-Type": "application/json" } }
        );
        if (response.data.success) {
          successfulReceipts.push(response.data.data);
        } else {
          failedReceipts.push({
            name: receipt.user.fullname,
            reason: response.data.message,
          });
        }
      } catch (error) {
        failedReceipts.push({
          name: receipt.user.fullname,
          reason: error.response?.data?.message || "Network Error",
        });
      }
    }
    toast.success(
      `Batch complete! Success: ${successfulReceipts.length}, Failed: ${failedReceipts.length}`
    );
    if (failedReceipts.length > 0) {
      const errorDetails = failedReceipts
        .map((f) => `- ${f.name}: ${f.reason}`)
        .join("\n");
      toast.error(
        <div>
          <p>Failures:</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{errorDetails}</pre>
        </div>,
        { autoClose: 10000 }
      );
    }
    if (successfulReceipts.length > 0) {
      setReceiptData(successfulReceipts);
      setShowReceiptModal(true);
    }
    await getDonationList();
    setGroupDonations([]);
    setTotalGroupAmount(0);
    setIsPayingGroup(false);
  };

  const handleEndGroup = () => {
    if (
      groupDonations.length > 0 &&
      !window.confirm(
        "Are you sure you want to end and reset? The current group list will be cleared without payment."
      )
    ) {
      return;
    }
    setGroupDonations([]);
    setTotalGroupAmount(0);
    resetForm();
  };

  return (
    <>
      {showReceiptModal && receiptData && (
        <ReceiptModal
          data={receiptData}
          isGroup={Array.isArray(receiptData)}
          onClose={handleCloseModal}
          adminName={adminName}
        />
      )}
      <div className="p-6 md:p-8 bg-gray-100 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Donation Receipt</h1>
          <div className="flex items-center bg-gray-200 rounded-full p-1 self-start md:self-center">
            <button
              onClick={() => setDonationType("individual")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                donationType === "individual"
                  ? "bg-white text-green-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              Individual Donation
            </button>
            <button
              onClick={() => setDonationType("group")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                donationType === "group"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              Group Donation
            </button>
          </div>
        </div>

        {donationType === "group" && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold text-blue-800">
                Group Donation Summary
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePayGroup}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm disabled:bg-green-400"
                  disabled={isPayingGroup || groupDonations.length === 0}
                >
                  {isPayingGroup ? "Processing..." : "Pay All as Cash"}
                </button>
                <button
                  onClick={handleEndGroup}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                  disabled={isPayingGroup}
                >
                  End & Reset
                </button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="text-lg font-semibold text-gray-700">
                  Total Group Donation:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{totalGroupAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="mt-4 max-h-60 overflow-y-auto pr-2">
                <h3 className="font-semibold text-gray-600 mb-2">
                  Receipts Added ({groupDonations.length}):
                </h3>
                {groupDonations.length > 0 ? (
                  <ul className="space-y-2">
                    {groupDonations.map((donation, index) => (
                      <li
                        key={donation.localId}
                        className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-800">
                            {index + 1}. {donation.user.fullname}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{donation.netPayableAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteFromGroup(donation.localId)
                          }
                          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove receipt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No receipts added to the group yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-8">
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

          {showAddUserForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                          <option key={user._id} value={user.id}>
                            {user.fullname} ({user.id})
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
                    <div className="pt-1">
                      <h3 className="border-b pb-2 text-lg font-semibold text-gray-800 mb-3">
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.contact.email}
                            onChange={(e) =>
                              updateNestedField("contact.email", e.target.value)
                            }
                            placeholder="Enter email address"
                          />
                          <ValidationMessage
                            show={emailError}
                            message="Please enter a valid email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number
                          </label>
                          <div className="flex">
                            <select
                              className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                              value={newUser.contact.mobileno.code}
                              onChange={(e) =>
                                updateNestedField(
                                  "contact.mobileno.code",
                                  e.target.value
                                )
                              }
                            >
                              <option value="+91">+91</option>
                              <option value="+1">+1</option>
                              <option value="+44">+44</option>
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
                              placeholder="Enter 10-digit mobile number"
                              maxLength="10"
                            />
                          </div>
                          <ValidationMessage
                            show={mobileError}
                            message="Please enter a valid 10-digit mobile number"
                          />
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
                            placeholder="Enter WhatsApp number (optional)"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-1">
                      <h3 className="border-b pb-2 text-lg font-semibold text-gray-800 mb-3">
                        Address Information
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Location{" "}
                          <span className="text-red-500">*</span>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                            placeholder="Enter country"
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
                            placeholder="Enter state"
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
                            placeholder="Enter district"
                          />
                        </div>
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
                            placeholder="Enter city"
                          />
                        </div>
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
                            placeholder="Enter post office"
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
                            placeholder="Enter PIN code"
                            maxLength="6"
                          />
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
                            placeholder="Enter landmark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={newUser.address.street}
                            onChange={(e) =>
                              updateNestedField(
                                "address.street",
                                e.target.value
                              )
                            }
                            placeholder="Enter street"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apartment/Building
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
                            placeholder="Enter apartment/building"
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
                            placeholder="Enter floor"
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
                            placeholder="Enter room"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Professional Information (Optional)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            placeholder="e.g., React Developer, Cardiologist"
                          />
                        </div>
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

          <div className="grid md:grid-cols-2 gap-8">
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
                  Courier option is not available for your location. Please
                  select "YES".
                </p>
              )}
            </div>
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
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Donation Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {getAvailableCategories().map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryDetails?.dynamic?.isDynamic ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={dynamicAmount}
                    onChange={(e) => setDynamicAmount(e.target.value)}
                    disabled={!selectedCategoryDetails}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={
                        !selectedCategoryDetails ||
                        selectedCategoryDetails.packet
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      placeholder="Amount"
                      className="w-full px-3 py-2 border rounded-lg bg-gray-200"
                      value={
                        selectedCategoryDetails
                          ? (
                              selectedCategoryDetails.rate *
                              (Number(quantity) || 0)
                            ).toLocaleString("en-IN")
                          : "0"
                      }
                      disabled
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleAddDonation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center gap-2 h-10"
              >
                <Plus size={18} /> Add
              </button>
            </div>

            {selectedCategoryDetails && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg">
                <div className="flex flex-wrap justify-around items-center gap-x-6 gap-y-2">
                  <p>
                    <strong>Rate:</strong> ₹{selectedCategoryDetails.rate}
                  </p>
                  <p>
                    <strong>Weight:</strong> {selectedCategoryDetails.weight}g
                  </p>
                  <p>
                    <strong>Packet:</strong>{" "}
                    {selectedCategoryDetails.packet ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            )}
            {donations.length > 0 && (
              <div className="overflow-x-auto mt-6">
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
                        Weight (g)
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
                          {donation.number}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ₹{donation.amount}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {donation.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {donation.isPacket ? "Yes" : "No"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Mahaprasad Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-medium">
                    {totalWeight.toFixed(1)} g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Packet:</span>
                  <span className="font-medium">{totalPackets}</span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Donation Summary
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
                    <strong>In Words:</strong> {toWords(netPayableAmount)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
              donationType === "group" ? "hidden" : ""
            }`}
          >
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
              ></textarea>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            {donationType === "individual" ? (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400"
                disabled={loading || paymentLoading}
              >
                <CreditCard className="h-5 w-5" />
                {loading || paymentLoading ? "Processing..." : "Submit Receipt"}
              </button>
            ) : (
              <button
                onClick={handleAddToGroup}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                disabled={!selectedUser || netPayableAmount <= 0}
              >
                <Plus className="h-5 w-5" />
                Add Receipt to Group
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;
