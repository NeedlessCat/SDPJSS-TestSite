import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const EditProfileForm = ({ member, onClose, onSuccess }) => {
  const { backendUrl, token } = useContext(AppContext);

  // Helper function to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    fullname: member.fullname || "",
    fatherid: member.fatherid || "",
    mother: member.mother || "",
    gender: member.gender || "",
    dob: formatDateToYYYYMMDD(member.dob) || "",
    bloodgroup: member.bloodgroup || "",
    username: member.username || "",
    marriage: {
      maritalstatus: member.marriage?.maritalstatus || "",
      number: member.marriage?.number || "",
      spouse: member.marriage?.spouse || [],
    },
    contact: {
      email: member.contact?.email || "",
      mobileno: {
        code: member.contact?.mobileno?.code || "",
        number: member.contact?.mobileno?.number || "",
      },
      whatsappno: member.contact?.whatsappno || "",
    },
    address: {
      currlocation: member.address?.currlocation || "",
      country: member.address?.country || "",
      state: member.address?.state || "",
      district: member.address?.district || "",
      city: member.address?.city || "",
      postoffice: member.address?.postoffice || "",
      pin: member.address?.pin || "",
      landmark: member.address?.landmark || "",
      street: member.address?.street || "",
      apartment: member.address?.apartment || "",
      floor: member.address?.floor || "",
      room: member.address?.room || "",
    },
    education: {
      upto: member.education?.upto || "",
      qualification: member.education?.qualification || "",
    },
    profession: {
      category: member.profession?.category || "",
      job: member.profession?.job || "",
      specialization: member.profession?.specialization || "",
    },
    healthissue: member.healthissue || "None",
    islive: member.islive !== undefined ? member.islive : true,
  });

  // Handle address auto-fill based on current location
  useEffect(() => {
    const { currlocation } = form.address;
    let updatedAddress = { ...form.address };

    switch (currlocation) {
      case "In Manpur":
        updatedAddress = {
          ...updatedAddress,
          country: "India",
          state: "Bihar",
          district: "Gaya",
          city: "Manpur",
          postoffice: "Buniyadganj",
          pin: "823003",
        };
        break;
      case "In Gaya but outside Manpur":
        updatedAddress = {
          ...updatedAddress,
          country: "India",
          state: "Bihar",
          district: "Gaya",
          city: "",
          postoffice: "",
          pin: "",
        };
        break;
      case "In Bihar but outside Gaya":
        updatedAddress = {
          ...updatedAddress,
          country: "India",
          state: "Bihar",
          district: "",
          city: "",
          postoffice: "",
          pin: "",
        };
        break;
      case "In India but outside Bihar":
        updatedAddress = {
          ...updatedAddress,
          country: "India",
          state: "",
          district: "",
          city: "",
          postoffice: "",
          pin: "",
        };
        break;
      case "Out of India":
        updatedAddress = {
          ...updatedAddress,
          country: "",
          state: "",
          district: "",
          city: "",
          postoffice: "",
          pin: "",
        };
        break;
      default:
        break;
    }

    setForm((prev) => ({
      ...prev,
      address: updatedAddress,
    }));
  }, [form.address.currlocation]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSpouseChange = (index, value) => {
    const updatedSpouse = [...form.marriage.spouse];
    updatedSpouse[index] = value;
    setForm((prev) => ({
      ...prev,
      marriage: {
        ...prev.marriage,
        spouse: updatedSpouse,
      },
    }));
  };

  const addSpouseField = () => {
    setForm((prev) => ({
      ...prev,
      marriage: {
        ...prev.marriage,
        spouse: [...prev.marriage.spouse, ""],
      },
    }));
  };

  const removeSpouseField = (index) => {
    const updatedSpouse = form.marriage.spouse.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      marriage: {
        ...prev.marriage,
        spouse: updatedSpouse,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("userId", member._id);
      formData.append("fullname", form.fullname);
      formData.append("fatherid", form.fatherid);
      formData.append("mother", form.mother);
      formData.append("gender", form.gender);
      formData.append("dob", form.dob);
      formData.append("bloodgroup", form.bloodgroup);
      formData.append("username", form.username);
      formData.append("marriage", JSON.stringify(form.marriage));
      formData.append("contact", JSON.stringify(form.contact));
      formData.append("address", JSON.stringify(form.address));
      formData.append("education", JSON.stringify(form.education));
      formData.append("profession", JSON.stringify(form.profession));
      formData.append("healthissue", form.healthissue);
      formData.append("islive", form.islive);

      const { data } = await axios.post(
        backendUrl + "/api/family/edit-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white">
      <div className="max-h-[80vh] overflow-y-auto pr-1 sm:pr-2">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
          {/* Username Section - Moved to top */}
          <div className="bg-gray-50  p-3 sm:p-6  rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.fullname}
                  onChange={(e) =>
                    handleInputChange(null, "fullname", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father ID
                </label>
                <input
                  type="text"
                  placeholder="Enter father ID"
                  value={form.fatherid}
                  onChange={(e) =>
                    handleInputChange(null, "fatherid", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother Name
                </label>
                <input
                  type="text"
                  placeholder="Enter mother name"
                  value={form.mother}
                  onChange={(e) =>
                    handleInputChange(null, "mother", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    handleInputChange(null, "gender", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) =>
                    handleInputChange(null, "dob", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={form.contact.email}
                  onChange={(e) =>
                    handleInputChange("contact", "email", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <input
                    type="text"
                    placeholder="Code"
                    value={form.contact.mobileno.code}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          mobileno: {
                            ...prev.contact.mobileno,
                            code: e.target.value,
                          },
                        },
                      }))
                    }
                    className="w-16 sm:w-20 px-1 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    value={form.contact.mobileno.number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          mobileno: {
                            ...prev.contact.mobileno,
                            number: e.target.value,
                          },
                        },
                      }))
                    }
                    className="flex-1 px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter WhatsApp number"
                  value={form.contact.whatsappno}
                  onChange={(e) =>
                    handleInputChange("contact", "whatsappno", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <select
                  value={form.address.currlocation}
                  onChange={(e) =>
                    handleInputChange("address", "currlocation", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Location</option>
                  <option value="In Manpur">In Manpur</option>
                  <option value="In Gaya but outside Manpur">
                    In Gaya but outside Manpur
                  </option>
                  <option value="In Bihar but outside Gaya">
                    In Bihar but outside Gaya
                  </option>
                  <option value="In India but outside Bihar">
                    In India but outside Bihar
                  </option>
                  <option value="Out of India">Out of India</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Enter country"
                  value={form.address.country}
                  onChange={(e) =>
                    handleInputChange("address", "country", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={form.address.state}
                  onChange={(e) =>
                    handleInputChange("address", "state", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  placeholder="Enter district"
                  value={form.address.district}
                  onChange={(e) =>
                    handleInputChange("address", "district", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={form.address.city}
                  onChange={(e) =>
                    handleInputChange("address", "city", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Office
                </label>
                <input
                  type="text"
                  placeholder="Enter post office"
                  value={form.address.postoffice}
                  onChange={(e) =>
                    handleInputChange("address", "postoffice", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code
                </label>
                <input
                  type="text"
                  placeholder="Enter PIN code"
                  value={form.address.pin}
                  onChange={(e) =>
                    handleInputChange("address", "pin", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  placeholder="Enter landmark"
                  value={form.address.landmark}
                  onChange={(e) =>
                    handleInputChange("address", "landmark", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street
                </label>
                <input
                  type="text"
                  placeholder="Enter street"
                  value={form.address.street}
                  onChange={(e) =>
                    handleInputChange("address", "street", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment
                </label>
                <input
                  type="text"
                  placeholder="Enter apartment"
                  value={form.address.apartment}
                  onChange={(e) =>
                    handleInputChange("address", "apartment", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor
                </label>
                <input
                  type="text"
                  placeholder="Enter floor"
                  value={form.address.floor}
                  onChange={(e) =>
                    handleInputChange("address", "floor", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room
                </label>
                <input
                  type="text"
                  placeholder="Enter room"
                  value={form.address.room}
                  onChange={(e) =>
                    handleInputChange("address", "room", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Education Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <select
                  value={form.education.upto}
                  onChange={(e) =>
                    handleInputChange("education", "upto", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Education Level</option>
                  <option value="Not Educated">Not Educated</option>
                  <option value="upto 5th class or equivalent">
                    upto 5th class or equivalent
                  </option>
                  <option value="upto 10th class or equivalent">
                    upto 10th class or equivalent
                  </option>
                  <option value="upto 12th class or equivalent">
                    upto 12th class or equivalent
                  </option>
                  <option value="upto Graduation or equivalent">
                    upto Graduation or equivalent
                  </option>
                  <option value="upto Post Graduation or equivalent">
                    upto Post Graduation or equivalent
                  </option>
                  <option value="Higher than Post Graduation">
                    Higher than Post Graduation
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  placeholder="Enter qualification details"
                  value={form.education.qualification}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      "qualification",
                      e.target.value
                    )
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Profession */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Category
                </label>
                <select
                  value={form.profession.category}
                  onChange={(e) =>
                    handleInputChange("profession", "category", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Job Category</option>
                  <option value="Occupation">Occupation</option>
                  <option value="Private Job">Private Job</option>
                  <option value="Government Job">Government Job</option>
                  <option value="Service Provider">Service Provider</option>
                  <option value="Businessman">Businessman</option>
                  <option value="Worker">Worker</option>
                  <option value="Student/Dependent">Student/Dependent</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="Enter job title"
                  value={form.profession.job}
                  onChange={(e) =>
                    handleInputChange("profession", "job", e.target.value)
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  placeholder="Enter specialization"
                  value={form.profession.specialization}
                  onChange={(e) =>
                    handleInputChange(
                      "profession",
                      "specialization",
                      e.target.value
                    )
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Marriage Information - Completion */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Marriage Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marital Status
                </label>
                <select
                  value={form.marriage.maritalstatus}
                  onChange={(e) =>
                    handleInputChange(
                      "marriage",
                      "maritalstatus",
                      e.target.value
                    )
                  }
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Marriages
                </label>
                <input
                  type="number"
                  placeholder="Enter number"
                  value={form.marriage.number}
                  onChange={(e) => {
                    const newNumber = parseInt(e.target.value) || 0;
                    handleInputChange("marriage", "number", e.target.value);

                    // Adjust spouse array based on marriage count
                    const currentSpouseCount = form.marriage.spouse.length;
                    if (newNumber < currentSpouseCount) {
                      // Remove excess spouse fields
                      const updatedSpouse = form.marriage.spouse.slice(
                        0,
                        newNumber
                      );
                      setForm((prev) => ({
                        ...prev,
                        marriage: {
                          ...prev.marriage,
                          spouse: updatedSpouse,
                        },
                      }));
                    }
                  }}
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                />
              </div>
            </div>

            {/* Spouse Names Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Spouse Names
                </label>
                <button
                  type="button"
                  onClick={addSpouseField}
                  disabled={
                    form.marriage.spouse.length >=
                    (parseInt(form.marriage.number) || 0)
                  }
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                    form.marriage.spouse.length >=
                    (parseInt(form.marriage.number) || 0)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Add Spouse
                </button>
              </div>

              {form.marriage.spouse.map((spouse, index) => (
                <div
                  key={index}
                  className="flex gap-1 sm:gap-2 items-center w-full min-w-0"
                >
                  <input
                    type="text"
                    placeholder={`Spouse ${index + 1} name`}
                    value={spouse}
                    onChange={(e) => handleSpouseChange(index, e.target.value)}
                    className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {form.marriage.spouse.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpouseField(index)}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {form.marriage.spouse.length === 0 && (
                <p className="text-gray-500 text-sm italic">
                  {parseInt(form.marriage.number) > 0
                    ? 'No spouse added. Click "Add Spouse" to add spouse names.'
                    : "Set the number of marriages first to add spouse names."}
                </p>
              )}
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Health Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={form.islive ? "Yes" : "No"}
                onChange={(e) =>
                  handleInputChange(null, "islive", e.target.value === "Yes")
                }
                className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Yes">Alive</option>
                <option value="No">Deceased</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Issues
              </label>
              <textarea
                placeholder="Enter any health issues or conditions (optional)"
                value={form.healthissue}
                onChange={(e) =>
                  handleInputChange(null, "healthissue", e.target.value)
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                value={form.bloodgroup}
                onChange={(e) =>
                  handleInputChange(null, "bloodgroup", e.target.value)
                }
                className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                <option value="Not Known">Not Known</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="w-full sm:flex-1 bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm sm:text-base"
            >
              Update Profile
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 bg-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
