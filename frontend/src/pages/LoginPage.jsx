import React, { useContext, useState, useEffect, useMemo } from "react";
import Select from "react-select";
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
    loadKhandans,
  } = useContext(AppContext);

  const navigate = useNavigate();

  // --- Common State ---
  const [loading, setLoading] = useState(false);

  // --- Login fields ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- Registration fields ---
  const [fullname, setFullname] = useState("");
  const [selectedKhandanId, setSelectedKhandanId] = useState("");
  const [fatherName, setFatherName] = useState("");
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

  // --- NEW: State for real-time validation errors ---
  const [nameError, setNameError] = useState("");
  const [fatherNameError, setFatherNameError] = useState("");
  const [dobError, setDobError] = useState("");

  // --- Forgot Password fields ---
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // --- Forgot Username fields ---
  const [forgotUsernameFullname, setForgotUsernameFullname] = useState("");
  const [forgotUsernameKhandanId, setForgotUsernameKhandanId] = useState("");
  const [forgotUsernameFatherName, setForgotUsernameFatherName] = useState("");
  const [forgotUsernameDob, setForgotUsernameDob] = useState("");

  // --- Effects ---
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    loadKhandans();
  }, []);

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

  // --- NEW: Validation function for names ---
  const validateName = (name, fieldName) => {
    if (/\s{2,}/.test(name)) {
      return `${fieldName} cannot contain multiple spaces.`;
    }
    return "";
  };

  // --- NEW: Validation function for Date of Birth ---
  const validateDob = (dobString) => {
    if (!dobString) return "";
    const dob = new Date(dobString);
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    if (dob > tenYearsAgo) {
      return "You must be at least 10 years old to register.";
    }
    return "";
  };

  const khandanOptions = useMemo(
    () =>
      khandanList.map((khandan) => ({
        value: khandan._id,
        label: formatKhandanOption(khandan),
      })),
    [khandanList]
  );

  // --- Handlers ---
  const handleFullnameChange = (e) => {
    const value = capitalizeEachWord(e.target.value);
    setFullname(value);
    setNameError(validateName(value, "Full Name"));
  };

  const handleFatherNameChange = (e) => {
    const value = capitalizeEachWord(e.target.value);
    setFatherName(value);
    setFatherNameError(validateName(value, "Father's Name"));
  };

  const handleDobChange = (e) => {
    const value = e.target.value;
    setDob(value);
    setDobError(validateDob(value));
  };

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

  // --- API Call Functions ---
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (state === "Register") {
        if (nameError || fatherNameError || dobError) {
          toast.error("Please fix the errors before submitting.");
          setLoading(false);
          return;
        }
        const hasEmail = email && email.trim() !== "";
        const hasMobile = mobile.number && mobile.number.trim() !== "";
        if (!hasEmail && !hasMobile) {
          toast.error(
            "At least one contact method (email or mobile) is required"
          );
          setLoading(false);
          return;
        }
        const registrationData = {
          fullname,
          khandanid: selectedKhandanId,
          fatherName: fatherName,
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
      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { username: forgotPasswordUsername }
      );
      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(2);
        setOtpTimer(600);
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
      console.log(newPassword);
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
    setForgotPasswordUsername("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordStep(1);
    setOtpTimer(0);
    setState("Login");
  };

  // --- Forgot Username Flow ---
  const handleForgotUsernameRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullname: forgotUsernameFullname,
        khandanid: forgotUsernameKhandanId,
        fatherName: forgotUsernameFatherName,
        dob: forgotUsernameDob,
      };
      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-username`,
        payload
      );
      if (data.success) {
        toast.success(data.message);
        resetForgotUsernameFlow();
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
    setForgotUsernameFatherName("");
    setForgotUsernameDob("");
    setState("Login");
  };

  // --- Render Logic ---
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
                <form
                  onSubmit={handleVerifyOtp}
                  className="flex flex-col gap-4"
                >
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
                <form
                  onSubmit={handleResetPassword}
                  className="flex flex-col gap-4"
                >
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

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khandan <span className="text-red-500">*</span>
                </label>
                <Select
                  options={khandanOptions}
                  onChange={(option) =>
                    setForgotUsernameKhandanId(option ? option.value : "")
                  }
                  value={khandanOptions.find(
                    (opt) => opt.value === forgotUsernameKhandanId
                  )}
                  isClearable
                  placeholder="Search and Select Khandan"
                  required
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="border border-zinc-300 rounded-lg w-full p-3"
                  type="text"
                  onChange={(e) =>
                    setForgotUsernameFatherName(
                      capitalizeEachWord(e.target.value)
                    )
                  }
                  value={forgotUsernameFatherName}
                  required
                  placeholder="Enter your father's full name"
                />
              </div>

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
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="border border-zinc-300 rounded-lg w-full p-3"
                    type="text"
                    onChange={handleFullnameChange}
                    value={fullname}
                    required
                    placeholder="Enter your full name"
                  />
                  {/* NEW: Error message display */}
                  {nameError && (
                    <p className="text-red-500 text-xs mt-1">{nameError}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khandan <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={khandanOptions}
                    onChange={(option) => {
                      const khandanId = option ? option.value : "";
                      setSelectedKhandanId(khandanId);
                    }}
                    value={khandanOptions.find(
                      (opt) => opt.value === selectedKhandanId
                    )}
                    isClearable
                    placeholder="Search and Select Khandan"
                    required
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="border border-zinc-300 rounded-lg w-full p-3"
                    type="text"
                    onChange={handleFatherNameChange}
                    value={fatherName}
                    required
                    placeholder="Enter your father's full name"
                  />
                  {/* NEW: Error message display */}
                  {fatherNameError && (
                    <p className="text-red-500 text-xs mt-1">
                      {fatherNameError}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Please enter his full name.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender<span className="text-red-500">*</span>
                    </label>
                    <select
                      className="border border-zinc-300 rounded-lg w-full p-3"
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
                      className="border border-zinc-300 rounded-lg w-full p-3"
                      type="date"
                      onChange={handleDobChange}
                      value={dob}
                      required
                    />
                    {/* NEW: Error message display */}
                    {dobError && (
                      <p className="text-red-500 text-xs mt-1">{dobError}</p>
                    )}
                  </div>
                </div>

                <div className="w-full">
                  <h3 className="text-lg font-medium text-gray-800 my-2">
                    Contact Information
                  </h3>
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email{" "}
                      <span className="text-sm text-gray-500 ml-2">
                        (Login credentials are sent here.)
                      </span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3"
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="border border-zinc-300 rounded-lg p-3"
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
                      </select>
                      <input
                        className="border border-zinc-300 rounded-lg flex-1 p-3"
                        type="tel"
                        onChange={(e) =>
                          setMobile((prev) => ({
                            ...prev,
                            number: e.target.value,
                          }))
                        }
                        value={mobile.number}
                        placeholder="Enter 10-digit mobile number"
                        pattern="[0-9]{10}"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <h3 className="text-lg font-medium text-gray-800 my-2">
                    Address Information
                  </h3>
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="border border-zinc-300 rounded-lg w-full p-3"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="border border-zinc-300 rounded-lg w-full p-3"
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
                        className="border border-zinc-300 rounded-lg w-full p-3"
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
                        className="border border-zinc-300 rounded-lg w-full p-3"
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
                        className="border border-zinc-300 rounded-lg w-full p-3"
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
                        Post Office <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="border border-zinc-300 rounded-lg w-full p-3"
                        type="text"
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            postoffice: capitalizeEachWord(e.target.value),
                          }))
                        }
                        value={address.postoffice}
                        required
                        placeholder="Post Office"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="border border-zinc-300 rounded-lg w-full p-3"
                        type="text"
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            pin: e.target.value,
                          }))
                        }
                        value={address.pin}
                        required
                        placeholder="PIN Code"
                        pattern="[0-9]{6}"
                      />
                    </div>
                  </div>
                  <div className="w-full mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="border border-zinc-300 rounded-lg w-full p-3"
                      type="text"
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          street: capitalizeEachWord(e.target.value),
                        }))
                      }
                      value={address.street}
                      required
                      placeholder="Street Address"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
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
