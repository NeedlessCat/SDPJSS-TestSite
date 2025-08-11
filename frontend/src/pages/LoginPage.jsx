import React, { useContext, useState, useEffect, useMemo } from "react";
import Select from "react-select"; // Import react-select
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const {
    state,
    setState,
    backendUrl,
    utoken,
    setUToken,
    khandanList,
    usersList,
    loadKhandans,
    loadUsersByKhandan,
    getKhandanById,
  } = useContext(AppContext);

  const navigate = useNavigate();

  // --- Common State ---
  const [loading, setLoading] = useState(false);

  // --- Login fields ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- Registration fields ---
  const [fullname, setFullname] = useState("");
  const [selectedKhandan, setSelectedKhandan] = useState("");
  const [selectedKhandanId, setSelectedKhandanId] = useState("");
  const [fatherId, setFatherId] = useState("");
  const [isEldest, setIsEldest] = useState(false);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState({ code: "+91", number: "" });
  const [address, setAddress] = useState({
    currlocation: "",
    country: "",
    state: "",
    district: "",
    city: "",
    postoffice: "",
    pin: "",
    street: "",
  });

  // --- Forgot Password fields ---
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState(""); // RENAMED from forgotPasswordEmail
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // Step 1 is now for Username
  const [otpTimer, setOtpTimer] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // --- NEW: Forgot Username fields ---
  const [forgotUsernameFullname, setForgotUsernameFullname] = useState("");
  const [forgotUsernameKhandanId, setForgotUsernameKhandanId] = useState("");
  const [forgotUsernameFatherId, setForgotUsernameFatherId] = useState("");
  const [forgotUsernameDob, setForgotUsernameDob] = useState("");

  // --- Effects ---

  // Timer effect for OTP resend
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Load khandans on component mount
  useEffect(() => {
    loadKhandans();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (utoken) {
      navigate("/");
    }
  }, [utoken, navigate]);

  // --- Helper Functions ---

  const capitalizeEachWord = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to format khandan option display for react-select
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

  // Memoize khandan options for react-select to prevent re-renders
  const khandanOptions = useMemo(
    () =>
      khandanList.map((khandan) => ({
        value: khandan._id,
        label: formatKhandanOption(khandan),
      })),
    [khandanList]
  );

  // --- Handlers ---

  const handleLocationChange = (location) => {
    setAddress((prev) => ({ ...prev, currlocation: location }));
    const resetAddress = {
      country: "",
      state: "",
      district: "",
      city: "",
      pin: "",
      street: "",
      postoffice: "",
    };
    switch (location) {
      case "in_manpur":
        setAddress((prev) => ({
          ...prev,
          ...resetAddress,
          country: "India",
          state: "Bihar",
          district: "Gaya",
          city: "Gaya",
          pin: "823003",
          street: "Manpur",
          postoffice: "Buniyadganj",
        }));
        break;
      case "in_gaya_outside_manpur":
        setAddress((prev) => ({
          ...prev,
          ...resetAddress,
          country: "India",
          state: "Bihar",
          district: "Gaya",
          city: "Gaya",
        }));
        break;
      case "in_bihar_outside_gaya":
        setAddress((prev) => ({
          ...prev,
          ...resetAddress,
          country: "India",
          state: "Bihar",
        }));
        break;
      case "in_india_outside_bihar":
        setAddress((prev) => ({ ...prev, ...resetAddress, country: "India" }));
        break;
      case "outside_india":
        setAddress((prev) => ({ ...prev, ...resetAddress }));
        break;
      default:
        break;
    }
  };

  // Updated handler for react-select
  const handleKhandanChange = async (
    selectedOption,
    setKhandanId,
    setFatherIdState,
    setIsEldestState,
    forForm
  ) => {
    const khandanId = selectedOption ? selectedOption.value : "";
    setKhandanId(khandanId);

    if (khandanId) {
      loadUsersByKhandan(khandanId);
    }
    // Reset father selection for the respective form
    if (forForm === "register") {
      setFatherId("");
      setIsEldest(false);
    } else if (forForm === "forgotUsername") {
      setForgotUsernameFatherId("");
    }
  };

  const handleEldestChange = (checked) => {
    setIsEldest(checked);
    setFatherId(checked ? selectedKhandanId : "");
  };

  // --- API Call Functions ---

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (state === "Register") {
        const hasEmail = email && email.trim() !== "";
        const hasMobile = mobile.number && mobile.number.trim() !== "";
        if (!hasEmail && !hasMobile) {
          toast.error(
            "At least one contact method (email or mobile) is required"
          );
          return;
        }
        const registrationData = {
          fullname,
          khandanid: selectedKhandanId,
          fatherid: isEldest ? selectedKhandanId : fatherId,
          gender,
          dob,
          email: hasEmail ? email : undefined,
          mobile: hasMobile ? mobile : undefined,
          address,
        };
        const { data } = await axios.post(
          `${backendUrl}/api/user/register`,
          registrationData
        );
        if (data.success) {
          setUToken(data.token);
          localStorage.setItem("utoken", data.token);
          toast.success(
            `Registration successful! ${data.notifications?.join(". ")}`
          );
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        // Login
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          username,
          password,
        });
        if (data.success) {
          localStorage.setItem("utoken", data.utoken);
          setUToken(data.utoken);
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot Password Flow ---
  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send username instead of email
      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { username: forgotPasswordUsername }
      );
      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(2);
        setOtpTimer(600); // 10 minutes
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use username to verify OTP
      const { data } = await axios.post(`${backendUrl}/api/user/verify-otp`, {
        username: forgotPasswordUsername,
        otp: otpCode,
      });
      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(3);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    try {
      // Use username to reset password
      const { data } = await axios.post(
        `${backendUrl}/api/user/reset-password`,
        { username: forgotPasswordUsername, newPassword }
      );
      if (data.success) {
        toast.success(data.message);
        resetForgotPasswordFlow();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setIsResendingOtp(true);
    try {
      // Use username to resend OTP
      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { username: forgotPasswordUsername }
      );
      if (data.success) {
        toast.success("OTP resent successfully");
        setOtpTimer(600);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to resend OTP.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setForgotPasswordUsername(""); // UPDATED
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordStep(1);
    setOtpTimer(0);
    setState("Login");
  };

  // --- NEW: Forgot Username Flow ---
  const handleForgotUsernameRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullname: forgotUsernameFullname,
        khandanid: forgotUsernameKhandanId,
        fatherid: forgotUsernameFatherId,
        dob: forgotUsernameDob,
      };
      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-username`,
        payload
      );
      if (data.success) {
        toast.success(data.message);
        resetForgotUsernameFlow(); // Navigate back to login
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to recover username."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForgotUsernameFlow = () => {
    setForgotUsernameFullname("");
    setForgotUsernameKhandanId("");
    setForgotUsernameFatherId("");
    setForgotUsernameDob("");
    setState("Login");
  };

  // --- RENDER LOGIC ---

  const renderButton = (text) => (
    <button
      type="submit"
      disabled={loading}
      className="bg-primary hover:bg-primary/90 text-white w-full py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm disabled:bg-primary/50 disabled:cursor-not-allowed"
    >
      {loading ? "Processing..." : text}
    </button>
  );

  // --- Conditional Rendering of Forms ---

  if (state === "ForgotPassword") {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 py-4 sm:px-4 sm:py-8">
        <div className="w-full max-w-md">
          <div className="w-full border border-zinc-500 rounded-md">
            <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-xl text-zinc-600 text-sm">
              <div className="text-center mb-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
                  Reset Password
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {forgotPasswordStep === 1 &&
                    "Enter your username to receive an OTP on your registered email"}
                  {forgotPasswordStep === 2 &&
                    "Enter the OTP sent to your email"}
                  {forgotPasswordStep === 3 && "Enter your new password"}
                </p>
              </div>
              {forgotPasswordStep === 1 && (
                <form
                  onSubmit={handleForgotPasswordRequest}
                  className="flex flex-col gap-4"
                >
                  {/* Username Input */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3"
                      type="text"
                      onChange={(e) =>
                        setForgotPasswordUsername(e.target.value)
                      }
                      value={forgotPasswordUsername}
                      required
                      placeholder="Enter your username"
                    />
                  </div>
                  {renderButton("Send OTP")}
                </form>
              )}

              {forgotPasswordStep === 2 && (
                <form onSubmit={handleVerifyOtp}>
                  {/* OTP Input & Resend */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3"
                      type="text"
                      onChange={(e) => setOtpCode(e.target.value)}
                      value={otpCode}
                      required
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">
                        {otpTimer > 0
                          ? `Resend OTP in ${formatTime(otpTimer)}`
                          : "OTP expired"}
                      </span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpTimer > 0 || isResendingOtp}
                        className="text-primary hover:text-primary/80 underline text-sm font-medium disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {isResendingOtp ? "Sending..." : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                  {renderButton("Verify OTP")}
                </form>
              )}
              {forgotPasswordStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  {/* New Password & Confirm Password Inputs */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3"
                      type="password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      value={newPassword}
                      required
                      placeholder="Enter new password (min 8 characters)"
                      minLength="8"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3"
                      type="password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                      required
                      placeholder="Confirm your new password"
                      minLength="8"
                    />
                    {newPassword &&
                      confirmPassword &&
                      newPassword !== confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                  {renderButton("Reset Password")}
                </form>
              )}
              <div className="text-center text-sm mt-4">
                <span
                  onClick={resetForgotPasswordFlow}
                  className="text-primary hover:text-primary/80 underline cursor-pointer font-medium"
                >
                  Back to Login
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NEW: Forgot Username Form JSX
  if (state === "ForgotUsername") {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 py-4 sm:px-4 sm:py-8">
        <div className="w-full max-w-lg">
          <form
            onSubmit={handleForgotUsernameRequest}
            className="w-full border border-zinc-500 rounded-md"
          >
            <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-xl text-zinc-600 text-sm">
              <div className="text-center mb-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
                  Recover Username
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Enter your details to find your account.
                </p>
              </div>

              {/* Full Name */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="border border-zinc-300 rounded-lg w-full p-3"
                  type="text"
                  onChange={(e) =>
                    setForgotUsernameFullname(
                      capitalizeEachWord(e.target.value)
                    )
                  }
                  value={forgotUsernameFullname}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              {/* Khandan Searchable Dropdown */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khandan <span className="text-red-500">*</span>
                </label>
                <Select
                  options={khandanOptions}
                  onChange={(option) =>
                    handleKhandanChange(
                      option,
                      setForgotUsernameKhandanId,
                      setForgotUsernameFatherId,
                      null,
                      "forgotUsername"
                    )
                  }
                  value={khandanOptions.find(
                    (opt) => opt.value === forgotUsernameKhandanId
                  )}
                  isClearable
                  placeholder="Search and Select Khandan"
                  required
                />
              </div>

              {/* Father Dropdown */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father <span className="text-red-500">*</span>
                </label>
                <select
                  className="border border-zinc-300 rounded-lg w-full p-3 disabled:bg-gray-100"
                  onChange={(e) => setForgotUsernameFatherId(e.target.value)}
                  value={forgotUsernameFatherId}
                  disabled={!forgotUsernameKhandanId}
                  required
                >
                  <option value="">Select Father</option>
                  {usersList.map((user) => (
                    <option key={user._id} value={user.id}>
                      {user.fullname} ({user.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date of Birth */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  className="border border-zinc-300 rounded-lg w-full p-3"
                  type="date"
                  onChange={(e) => setForgotUsernameDob(e.target.value)}
                  value={forgotUsernameDob}
                  required
                />
              </div>

              {renderButton("Recover Username")}

              <div className="text-center text-sm mt-2">
                <span
                  onClick={resetForgotUsernameFlow}
                  className="text-primary hover:text-primary/80 underline cursor-pointer font-medium"
                >
                  Back to Login
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main Login/Register Form
  return (
    <div className="min-h-screen flex items-center justify-center px-2 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-lg">
        <form
          onSubmit={onSubmitHandler}
          className="w-full border border-zinc-500 rounded-md"
        >
          <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-xl text-zinc-600 text-sm">
            <div className="text-center mb-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
                {state === "Register" ? "User Registration" : "User Login"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Please {state === "Register" ? "register" : "login"} to
                continue.
              </p>
            </div>

            {state === "Register" ? (
              <>
                {/* Full Name */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="border border-zinc-300 rounded-lg w-full p-3"
                    type="text"
                    onChange={(e) =>
                      setFullname(capitalizeEachWord(e.target.value))
                    }
                    value={fullname}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                {/* Khandan Searchable Dropdown */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khandan <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={khandanOptions}
                    onChange={(option) =>
                      handleKhandanChange(
                        option,
                        setSelectedKhandanId,
                        setFatherId,
                        setIsEldest,
                        "register"
                      )
                    }
                    value={khandanOptions.find(
                      (opt) => opt.value === selectedKhandanId
                    )}
                    isClearable
                    placeholder="Search and Select Khandan"
                    required
                  />
                </div>
                {/* Father ID with Eldest option */}
                <div className="w-full">
                  <div className="flex items-center gap-4 mb-1">
                    <label className="text-sm font-medium text-gray-700">
                      Father <span className="text-red-500">*</span>
                    </label>
                    {usersList.length === 0 && selectedKhandanId && (
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={isEldest}
                          onChange={(e) => handleEldestChange(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span>Eldest</span>
                      </label>
                    )}
                  </div>
                  <select
                    className="border border-zinc-300 rounded-lg w-full p-3 disabled:bg-gray-100"
                    onChange={(e) => setFatherId(e.target.value)}
                    value={fatherId}
                    disabled={isEldest || !selectedKhandanId}
                    required
                  >
                    <option value="">Select Father</option>
                    {usersList.map((user) => (
                      <option key={user._id} value={user.id}>
                        {user.fullname} ({user.id})
                      </option>
                    ))}
                  </select>
                  {!isEldest && selectedKhandanId && (
                    <p className="mt-2 text-xs text-red-600">
                      {usersList.length === 0
                        ? "No users in this khandan. Check 'Eldest' if you are the first member."
                        : "Register your father first if not in the list."}
                    </p>
                  )}
                </div>
                {/* Gender and DOB - Side by side on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender<span className="text-red-500">*</span>
                    </label>
                    <select
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      onChange={(e) => setGender(e.target.value)}
                      value={gender}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="date"
                      onChange={(e) => setDob(e.target.value)}
                      value={dob}
                      required
                    />
                  </div>
                </div>
                {/* Contact Information */}
                <div className="w-full">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Contact Information
                  </h3>
                  {/* Email */}
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                      <span className="text-sm text-gray-500 ml-2">
                        (LoginId are sent on it.)
                      </span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {/* Mobile Number */}
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="border border-zinc-300 rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        onChange={(e) =>
                          setMobile((prev) => ({
                            ...prev,

                            code: e.target.value,
                          }))
                        }
                        value={mobile.code}
                        style={{ minWidth: "80px" }}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                      </select>
                      <input
                        className="border border-zinc-300 rounded-lg flex-1 p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type="tel"
                        onChange={(e) =>
                          setMobile((prev) => ({
                            ...prev,

                            number: e.target.value,
                          }))
                        }
                        value={mobile.number}
                        placeholder="Enter mobile number"
                        pattern="[0-9]{10}"
                      />
                    </div>
                  </div>
                </div>
                {/* Current Location */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onChange={(e) => handleLocationChange(e.target.value)}
                    value={address.currlocation}
                    required
                  >
                    <option value="">Select Current Location</option>
                    <option value="in_manpur">In Manpur</option>
                    <option value="in_gaya_outside_manpur">
                      In Gaya outside Manpur
                    </option>
                    <option value="in_bihar_outside_gaya">
                      In Bihar outside Gaya
                    </option>
                    <option value="in_india_outside_bihar">
                      In India outside Bihar
                    </option>
                    <option value="outside_india">Outside India</option>
                  </select>
                </div>
                {/* Address Fields - Grid layout for better organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="text"
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,

                          country: capitalizeEachWord(e.target.value),
                        }))
                      }
                      value={address.country}
                      required
                      placeholder="Country"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="text"
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,

                          state: capitalizeEachWord(e.target.value),
                        }))
                      }
                      value={address.state}
                      required
                      placeholder="State"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="text"
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,

                          district: capitalizeEachWord(e.target.value),
                        }))
                      }
                      value={address.district}
                      required
                      placeholder="District"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="text"
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,

                          city: capitalizeEachWord(e.target.value),
                        }))
                      }
                      value={address.city}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Post Office
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="text"
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,

                          postoffice: capitalizeEachWord(e.target.value),
                        }))
                      }
                      value={address.postoffice}
                      placeholder="Post Office"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="text"
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,

                          pin: e.target.value,
                        }))
                      }
                      value={address.pin}
                      placeholder="PIN Code"
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>
                {/* Street Address - Full width */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    type="text"
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,

                        street: capitalizeEachWord(e.target.value),
                      }))
                    }
                    value={address.street}
                    placeholder="Street Address"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Login Form */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="border border-zinc-300 rounded-lg w-full p-3"
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    required
                    placeholder="Enter your username"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="border border-zinc-300 rounded-lg w-full p-3"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                {/* Forgot Links */}
                <div className="flex justify-between text-right">
                  <span
                    onClick={() => setState("ForgotUsername")}
                    className="text-primary hover:text-primary/80 underline cursor-pointer text-sm font-medium"
                  >
                    Forgot Username?
                  </span>
                  <span
                    onClick={() => setState("ForgotPassword")}
                    className="text-primary hover:text-primary/80 underline cursor-pointer text-sm font-medium"
                  >
                    Forgot Password?
                  </span>
                </div>
              </>
            )}

            {renderButton(state === "Register" ? "Register" : "Login")}

            {/* Toggle between Login and Register */}
            <div className="text-center text-sm">
              {state === "Register" ? (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setState("Login")}
                    className="text-primary hover:text-primary/80 underline cursor-pointer font-medium"
                  >
                    Login here
                  </span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span
                    onClick={() => setState("Register")}
                    className="text-primary hover:text-primary/80 underline cursor-pointer font-medium"
                  >
                    Register here
                  </span>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
