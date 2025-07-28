import React, { useContext, useState, useEffect } from "react";
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

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [fullname, setFullname] = useState("");
  const [selectedKhandan, setSelectedKhandan] = useState("");
  const [selectedKhandanId, setSelectedKhandanId] = useState("");
  const [fatherId, setFatherId] = useState("");
  const [isEldest, setIsEldest] = useState(false);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  // Contact fields - matching backend structure
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState({
    code: "+91",
    number: "",
  });

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

  // Forgot Password fields
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otpTimer, setOtpTimer] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

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

  // Auto-fill address based on current location
  const handleLocationChange = (location) => {
    setAddress((prev) => ({
      ...prev,
      currlocation: location,
    }));

    switch (location) {
      case "in_manpur":
        setAddress((prev) => ({
          ...prev,
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
          country: "India",
          state: "Bihar",
          district: "Gaya",
          city: "Gaya",
          pin: "",
          street: "",
          postoffice: "",
        }));
        break;
      case "in_bihar_outside_gaya":
        setAddress((prev) => ({
          ...prev,
          country: "India",
          state: "Bihar",
          district: "",
          city: "",
          pin: "",
          street: "",
          postoffice: "",
        }));
        break;
      case "in_india_outside_bihar":
        setAddress((prev) => ({
          ...prev,
          country: "India",
          state: "",
          district: "",
          city: "",
          pin: "",
          street: "",
          postoffice: "",
        }));
        break;
      case "outside_india":
        setAddress((prev) => ({
          ...prev,
          country: "",
          state: "",
          district: "",
          city: "",
          pin: "",
          street: "",
          postoffice: "",
        }));
        break;
      default:
        break;
    }
  };

  // Helper function to format khandan option display
  const formatKhandanOption = (khandan) => {
    let displayText = khandan.name;
    console.log("Khandans in Forms: ", khandan);

    // Add landmark if available
    if (khandan.address.landmark) {
      displayText += `, ${khandan.address.landmark}`;
    }

    // Add street if available
    if (khandan.address.street) {
      displayText += `, ${khandan.address.street}`;
    }

    // Add khandanid in parentheses
    displayText += ` (${khandan.khandanid})`;

    return displayText;
  };

  // Handle khandan selection
  const handleKhandanChange = async (khandanId) => {
    setSelectedKhandanId(khandanId);

    if (khandanId) {
      // Get khandan details
      const khandan = await getKhandanById(khandanId);
      setSelectedKhandan(khandan ? khandan.name : "");

      // Load users for father selection
      loadUsersByKhandan(khandanId);
    } else {
      setSelectedKhandan("");
    }

    setFatherId("");
    setIsEldest(false);
  };

  // Handle eldest checkbox
  const handleEldestChange = (checked) => {
    setIsEldest(checked);
    if (checked) {
      setFatherId(selectedKhandanId);
    } else {
      setFatherId("");
    }
  };

  // Forgot Password Functions
  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/forgot-password",
        {
          email: forgotPasswordEmail,
        }
      );

      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(2);
        setOtpTimer(600); // 10 minutes countdown
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/user/verify-otp", {
        email: forgotPasswordEmail,
        otp: otpCode,
      });

      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(3);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to verify OTP. Please try again."
      );
    }
  };

  const capitalizeEachWord = (str) => {
    if (!str) return ""; // Handle empty or null strings
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/reset-password",
        {
          email: forgotPasswordEmail,
          newPassword,
        }
      );

      if (data.success) {
        toast.success(data.message);
        // Reset all forgot password states
        setForgotPasswordEmail("");
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
        setForgotPasswordStep(1);
        setOtpTimer(0);
        setState("Login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    setIsResendingOtp(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/forgot-password",
        {
          email: forgotPasswordEmail,
        }
      );

      if (data.success) {
        toast.success("OTP resent successfully");
        setOtpTimer(600); // Reset timer to 10 minutes
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setForgotPasswordEmail("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordStep(1);
    setOtpTimer(0);
    setState("Login");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === "Register") {
        // Validate that at least one contact method is provided
        const hasEmail = email && email.trim() !== "";
        const hasMobile = mobile.number && mobile.number.trim() !== "";

        if (!hasEmail && !hasMobile) {
          toast.error(
            "At least one contact method (email or mobile) is required"
          );
          return;
        }

        // Prepare registration data matching backend API structure
        const registrationData = {
          fullname,
          khandanid: selectedKhandanId,
          fatherid: isEldest ? selectedKhandanId : fatherId,
          gender,
          dob,
          email: hasEmail ? email : undefined, // Only send if provided
          mobile: hasMobile ? mobile : undefined, // Only send if provided
          address,
        };

        const { data } = await axios.post(
          backendUrl + "/api/user/register",
          registrationData
        );

        if (data.success) {
          setUToken(data.token); // Backend returns 'token', not 'utoken'
          localStorage.setItem("utoken", data.token);

          // Show success message with notifications
          let successMessage = "Registration successful!";
          if (data.notifications && data.notifications.length > 0) {
            successMessage += " " + data.notifications.join(". ");
          }

          toast.success(successMessage);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        // Login
        const { data } = await axios.post(backendUrl + "/api/user/login", {
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
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || error.message || "An error occurred"
      );
    }
  };

  useEffect(() => {
    if (utoken) {
      navigate("/");
    }
  }, [utoken, navigate]);

  // Render Forgot Password Flow
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
                    "Enter your email to receive OTP"}
                  {forgotPasswordStep === 2 &&
                    "Enter the OTP sent to your email"}
                  {forgotPasswordStep === 3 && "Enter your new password"}
                </p>
              </div>

              {/* Step 1: Email Input */}
              {forgotPasswordStep === 1 && (
                <form onSubmit={handleForgotPasswordRequest}>
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="email"
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      value={forgotPasswordEmail}
                      required
                      placeholder="Enter your registered email"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white w-full py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm"
                  >
                    Send OTP
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {forgotPasswordStep === 2 && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center tracking-widest"
                      type="text"
                      onChange={(e) => setOtpCode(e.target.value)}
                      value={otpCode}
                      required
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                  </div>

                  {otpTimer > 0 && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">
                        OTP expires in:{" "}
                        <span className="font-medium text-red-600">
                          {formatTime(otpTimer)}
                        </span>
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white w-full py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm mb-3"
                  >
                    Verify OTP
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpTimer > 0 || isResendingOtp}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      otpTimer > 0 || isResendingOtp
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {isResendingOtp ? "Resending..." : "Resend OTP"}
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {forgotPasswordStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      value={newPassword}
                      required
                      placeholder="Enter new password (min 8 characters)"
                      minLength="8"
                    />
                  </div>

                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      type="password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                      required
                      placeholder="Confirm new password"
                      minLength="8"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white w-full py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm"
                  >
                    Reset Password
                  </button>
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
                Please{" "}
                {state === "Register"
                  ? "register to create your account"
                  : "login"}{" "}
                to get into our services
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
                    className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    type="text"
                    onChange={(e) =>
                      setFullname(capitalizeEachWord(e.target.value))
                    }
                    value={fullname}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Khandan Dropdown */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khandan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onChange={(e) => handleKhandanChange(e.target.value)}
                    value={selectedKhandanId}
                    required
                  >
                    <option value="">Select Khandan</option>
                    {khandanList.map((khandan) => (
                      <option key={khandan._id} value={khandan._id}>
                        {formatKhandanOption(khandan)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Father ID with Eldest option */}
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-gray-700">
                      Father <span className="text-red-500">*</span>
                    </label>
                    {/* Conditional rendering for the Eldest checkbox */}
                    {usersList.length === 0 && selectedKhandanId ? (
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={isEldest}
                          onChange={(e) => handleEldestChange(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>Eldest</span>
                      </label>
                    ) : (
                      // If users are present, ensure 'Eldest' is false and show message
                      // or simply don't render the checkbox if it's not applicable
                      isEldest && setIsEldest(false) // Reset if it was checked before users appeared
                    )}
                  </div>
                  <select
                    className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
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
                        ? "No users found in this khandan. You must be the eldest member - please check the 'Eldest' option above."
                        : "Register your father first if not in the list."}
                    </p>
                  )}
                </div>

                {/* Gender and DOB - Side by side on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
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
                      Date of Birth <span className="text-red-500">*</span>
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
                      State <span className="text-red-500">*</span>
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
                      District <span className="text-red-500">*</span>
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
                      City <span className="text-red-500">*</span>
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
                    className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    className="border border-zinc-300 rounded-lg w-full p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <span
                    onClick={() => setState("ForgotPassword")}
                    className="text-primary hover:text-primary/80 underline cursor-pointer text-sm font-medium"
                  >
                    Forgot Password?
                  </span>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white w-full py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm"
            >
              {state === "Register" ? "Register" : "Login"}
            </button>

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
