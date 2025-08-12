import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  UserCircle,
  Save,
  X,
  Key,
  Camera,
  Upload,
  Heart,
  GraduationCap,
  Activity,
  Users,
  Droplets,
  Shield,
} from "lucide-react";

const ProfileSection = () => {
  const {
    userData,
    loading,
    utoken,
    backendUrl,
    loadUserData,
    usersList,
    loadUsersByKhandan,
  } = useContext(AppContext);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingSections, setEditingSections] = useState({});
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mobileNumberError, setMobileNumberError] = useState("");

  useEffect(() => {
    if (userData?.khandanid) {
      loadUsersByKhandan(userData.khandanid);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Profile Data
          </h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const getFatherName = (fatherId) => {
    console.log;
    const father = usersList.find((user) => user.id === fatherId);
    return father ? father.fullname : "N/A - Eldest";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "Not provided";
    const parts = [
      address.apartment,
      address.floor,
      address.room,
      address.street,
      address.city,
      address.postoffice,
      address.district,
      address.state,
      address.country,
      address.pin,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const capitalizeEachWord = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfileImage = async () => {
    if (!profileImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("userId", userData._id);

      const response = await axios.post(
        `${backendUrl}/api/user/update-profile-image`,
        formData,
        {
          headers: {
            utoken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        await loadUserData();
        setProfileImage(null);
        setImagePreview(null);
        toast.success("Profile image updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile image");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile image. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSection = (sectionName) => {
    setEditingSections((prev) => ({ ...prev, [sectionName]: true }));

    // Initialize edited data with current values
    if (sectionName === "personal") {
      setEditedData((prev) => ({
        ...prev,
        fullname: userData.fullname || "",
        fatherid: userData.fatherid || "",
        mother: userData.mother || "",
        dob: userData.dob || "",
      }));
    } else if (sectionName === "contact") {
      setEditedData((prev) => ({
        ...prev,
        email: userData.contact?.email || "",
        mobileCode: userData.contact?.mobileno?.code || "+91",
        mobileNumber: userData.contact?.mobileno?.number || "",
        whatsappno: userData.contact?.whatsappno || "",
      }));
      setMobileNumberError(""); // Clear error when entering edit mode
    } else if (sectionName === "address") {
      setEditedData((prev) => ({
        ...prev,
        currlocation: userData.address?.currlocation || "",
        apartment: userData.address?.apartment || "",
        floor: userData.address?.floor || "",
        room: userData.address?.room || "",
        street: userData.address?.street || "",
        city: userData.address?.city || "",
        postoffice: userData.address?.postoffice || "",
        district: userData.address?.district || "",
        state: userData.address?.state || "",
        country: userData.address?.country || "",
        pin: userData.address?.pin || "",
        landmark: userData.address?.landmark || "",
      }));
    } else if (sectionName === "professional") {
      setEditedData((prev) => ({
        ...prev,
        category: userData.profession?.category || "",
        job: userData.profession?.job || "",
        specialization: userData.profession?.specialization || "",
      }));
    } else if (sectionName === "education") {
      setEditedData((prev) => ({
        ...prev,
        upto: userData.education?.upto || "",
        qualification: userData.education?.qualification || "",
      }));
    } else if (sectionName === "marriage") {
      setEditedData((prev) => ({
        ...prev,
        maritalstatus: userData.marriage?.maritalstatus || "",
        number: userData.marriage?.number || "",
        spouse: userData.marriage?.spouse || [],
      }));
    } else if (sectionName === "health") {
      setEditedData((prev) => ({
        ...prev,
        bloodgroup: userData.bloodgroup || "",
        healthissue: userData.healthissue || "None",
      }));
    }
  };

  const handleCancelEdit = (sectionName) => {
    setEditingSections((prev) => ({ ...prev, [sectionName]: false }));
    setEditedData({});
    if (sectionName === "contact") {
      setMobileNumberError("");
    }
  };

  const handleSaveSection = async (sectionName) => {
    setIsLoading(true);

    try {
      let updatePayload = { userId: userData._id };

      if (sectionName === "personal") {
        updatePayload = {
          ...updatePayload,
          mother: editedData.mother,
          dob: editedData.dob,
        };
      } else if (sectionName === "contact") {
        if (editedData.mobileNumber && editedData.mobileNumber.length !== 10) {
          setMobileNumberError("Mobile number must be 10 digits long.");
          setIsLoading(false);
          return;
        } else {
          setMobileNumberError("");
        }
        updatePayload = {
          ...updatePayload,
          contact: {
            email: editedData.email,
            mobileno: {
              code: editedData.mobileCode,
              number: editedData.mobileNumber,
            },
            whatsappno: editedData.whatsappno,
          },
        };
      } else if (sectionName === "address") {
        updatePayload = {
          ...updatePayload,
          address: {
            currlocation: editedData.currlocation,
            apartment: editedData.apartment,
            floor: editedData.floor,
            room: editedData.room,
            street: editedData.street,
            city: editedData.city,
            postoffice: editedData.postoffice,
            district: editedData.district,
            state: editedData.state,
            country: editedData.country,
            pin: editedData.pin,
            landmark: editedData.landmark,
          },
        };
      } else if (sectionName === "professional") {
        updatePayload = {
          ...updatePayload,
          profession: {
            category: editedData.category,
            job: editedData.job,
            specialization: editedData.specialization,
          },
        };
      } else if (sectionName === "education") {
        updatePayload = {
          ...updatePayload,
          education: {
            upto: editedData.upto,
            qualification: editedData.qualification,
          },
        };
      } else if (sectionName === "marriage") {
        updatePayload = {
          ...updatePayload,
          marriage: {
            maritalstatus: editedData.maritalstatus,
            number: editedData.number,
            spouse: editedData.spouse,
          },
        };
      } else if (sectionName === "health") {
        updatePayload = {
          ...updatePayload,
          bloodgroup: editedData.bloodgroup,
          healthissue: editedData.healthissue,
        };
      }

      // Make API call
      const response = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        updatePayload,
        {
          headers: {
            utoken,
          },
        }
      );

      if (response.data.success) {
        // Update was successful
        setEditingSections((prev) => ({ ...prev, [sectionName]: false }));
        setEditedData({});
        toast.success(`${sectionName} section updated successfully!`);
        // Refresh user data from context
        await loadUserData();
      } else {
        // Handle API error
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || error.message || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    // Clear mobile number error on input change
    if (field === "mobileNumber") {
      setMobileNumberError("");
    }
  };

  const handleLocationChange = (location) => {
    setEditedData((prev) => ({
      ...prev,
      currlocation: location,
    }));

    // Autofill address fields based on location
    switch (location) {
      case "in_manpur":
        setEditedData((prev) => ({
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
        setEditedData((prev) => ({
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
        setEditedData((prev) => ({
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
        setEditedData((prev) => ({
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
        setEditedData((prev) => ({
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

  const renderEditControls = (sectionName) => (
    <div className="flex items-center space-x-2">
      {editingSections[sectionName] ? (
        <>
          <button
            onClick={() => handleSaveSection(sectionName)}
            disabled={isLoading}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Save"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleCancelEdit(sectionName)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => handleEditSection(sectionName)}
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {imagePreview || userData.image ? (
                      <img
                        src={imagePreview || userData.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <label className="cursor-pointer">
                      <div className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
                        <Camera className="w-4 h-4" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userData.fullname || "Name not provided"}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600">
                    @{userData.username || "username"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start mt-2 space-x-2 gap-y-2">
                    {userData.id && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        ID: {userData.id}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userData.gender === "male"
                          ? "bg-blue-100 text-blue-800"
                          : userData.gender === "female"
                          ? "bg-pink-100 text-pink-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {userData.gender
                        ? userData.gender.charAt(0).toUpperCase() +
                          userData.gender.slice(1)
                        : "Not specified"}
                    </span>
                    {userData.khandanname && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Khandan: {userData.khandanname}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {profileImage && (
                  <button
                    onClick={handleSaveProfileImage}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Save Image</span>
                  </button>
                )}
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h2>
              {renderEditControls("personal")}
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.fullname || ""}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={userData.fatherName}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Mother Name
                </label>
                {editingSections.personal ? (
                  <input
                    type="text"
                    value={editedData.mother || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "mother",
                        capitalizeEachWord(e.target.value)
                      )
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.mother || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date of Birth
                </label>
                {editingSections.personal ? (
                  <input
                    type="date"
                    value={editedData.dob ? editedData.dob.split("T")[0] : ""}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{formatDate(userData.dob)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Health Information
              </h2>
              {renderEditControls("health")}
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Blood Group
                </label>
                {editingSections.health ? (
                  <select
                    value={editedData.bloodgroup || ""}
                    onChange={(e) =>
                      handleInputChange("bloodgroup", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <div className="flex items-center mt-1">
                    <Droplets className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {userData.bloodgroup || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Health Issues
                </label>
                {editingSections.health ? (
                  <textarea
                    value={editedData.healthissue || ""}
                    onChange={(e) =>
                      handleInputChange("healthissue", e.target.value)
                    }
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-start mt-1">
                    <Activity className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-900">
                      {userData.healthissue || "None"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                Contact Information
              </h2>
              {renderEditControls("contact")}
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                {editingSections.contact ? (
                  <input
                    type="email"
                    value={editedData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900 break-all">
                      {userData.contact?.email || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Mobile Number
                </label>
                {editingSections.contact ? (
                  <>
                    <div className="flex mt-1 space-x-2">
                      <select
                        value={editedData.mobileCode || "+91"}
                        onChange={(e) =>
                          handleInputChange("mobileCode", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                      </select>
                      <input
                        type="tel"
                        value={editedData.mobileNumber || ""}
                        onChange={(e) =>
                          handleInputChange("mobileNumber", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          mobileNumberError
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                    </div>
                    {mobileNumberError && (
                      <p className="mt-1 text-sm text-red-600">
                        {mobileNumberError}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {userData.contact?.mobileno?.code || "+91"}{" "}
                      {userData.contact?.mobileno?.number || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  WhatsApp Number
                </label>
                {editingSections.contact ? (
                  <input
                    type="tel"
                    value={editedData.whatsappno || ""}
                    onChange={(e) =>
                      handleInputChange("whatsappno", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {userData.contact?.whatsappno || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Marriage Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-pink-600" />
                Marriage Information
              </h2>
              {renderEditControls("marriage")}
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Marital Status
                </label>
                {editingSections.marriage ? (
                  <select
                    value={editedData.maritalstatus || ""}
                    onChange={(e) =>
                      handleInputChange("maritalstatus", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                ) : (
                  <p className="text-gray-900 mt-1 capitalize">
                    {userData.marriage?.maritalstatus || "Not specified"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Number of Marriages
                </label>
                {editingSections.marriage ? (
                  <input
                    type="number"
                    value={editedData.number || ""}
                    onChange={(e) =>
                      handleInputChange("number", e.target.value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.marriage?.number || "Not specified"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Spouse Information
                </label>
                {editingSections.marriage ? (
                  <textarea
                    value={
                      editedData.spouse ? editedData.spouse.join(", ") : ""
                    }
                    onChange={(e) =>
                      handleInputChange("spouse", e.target.value.split(", "))
                    }
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter spouse names separated by commas"
                  />
                ) : (
                  <div className="flex items-start mt-1">
                    <Users className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-900">
                      {userData.marriage?.spouse?.length > 0
                        ? userData.marriage.spouse.join(", ")
                        : "Not specified"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                Address Information
              </h2>
              {renderEditControls("address")}
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {editingSections.address ? (
                // Show all address fields when editing
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Current Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => handleLocationChange(e.target.value)}
                      value={editedData.currlocation || ""}
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
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Apartment
                      </label>
                      <input
                        type="text"
                        value={editedData.apartment || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "apartment",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Floor
                      </label>
                      <input
                        type="text"
                        value={editedData.floor || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "floor",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Room
                      </label>
                      <input
                        type="text"
                        value={editedData.room || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "room",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Street <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.street || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "street",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.city || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "city",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Post Office
                      </label>
                      <input
                        type="text"
                        value={editedData.postoffice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "postoffice",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.district || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "district",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.state || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "state",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedData.country || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "country",
                            capitalizeEachWord(e.target.value)
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={editedData.pin || ""}
                        onChange={(e) =>
                          handleInputChange("pin", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        pattern="[0-9]{6}"
                        maxLength="6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={editedData.landmark || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "landmark",
                          capitalizeEachWord(e.target.value)
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                // Show simplified view when not editing
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Current Location
                    </label>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {userData.address?.currlocation
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase()) ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Address
                    </label>
                    <div className="flex items-start mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                      <p className="text-gray-900">
                        {formatAddress(userData.address)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                Professional Information
              </h2>
              {renderEditControls("professional")}
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Category
                </label>
                {editingSections.professional ? (
                  <input
                    type="text"
                    value={editedData.category || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "category",
                        capitalizeEachWord(e.target.value)
                      )
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.profession?.category || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Job</label>
                {editingSections.professional ? (
                  <input
                    type="text"
                    value={editedData.job || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "job",
                        capitalizeEachWord(e.target.value)
                      )
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.profession?.job || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Specialization
                </label>
                {editingSections.professional ? (
                  <input
                    type="text"
                    value={editedData.specialization || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "specialization",
                        capitalizeEachWord(e.target.value)
                      )
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.profession?.specialization || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Education Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                Education Information
              </h2>
              {renderEditControls("education")}
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Education Level
                </label>
                {editingSections.education ? (
                  <select
                    value={editedData.upto || ""}
                    onChange={(e) => handleInputChange("upto", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Education Level</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="higher_secondary">Higher Secondary</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="doctorate">Doctorate</option>
                  </select>
                ) : (
                  <p className="text-gray-900 mt-1 capitalize">
                    {userData.education?.upto || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Qualification
                </label>
                {editingSections.education ? (
                  <input
                    type="text"
                    value={editedData.qualification || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "qualification",
                        capitalizeEachWord(e.target.value)
                      )
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 mt-1">
                    {userData.education?.qualification || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
};

// Password Change Modal Component (continuation)
const PasswordChangeModal = ({ isOpen, onClose }) => {
  const { backendUrl, utoken } = useContext(AppContext);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwords.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwords.oldPassword === passwords.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Make API call to change password
      const response = await axios.post(
        `${backendUrl}/api/user/change-password`,
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: {
            utoken: utoken,
          },
        }
      );

      if (response.data.success) {
        toast.success("Password changed successfully!");
        handleClose();
      } else {
        setErrors({
          submit: response.data.message || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle different types of errors
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: "Failed to change password. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2 text-red-600" />
            Change Password
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwords.oldPassword}
                onChange={(e) =>
                  handleInputChange("oldPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.oldPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your current password"
                disabled={isLoading}
              />
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.oldPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.newPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your new password"
                disabled={isLoading}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProfileSection;
