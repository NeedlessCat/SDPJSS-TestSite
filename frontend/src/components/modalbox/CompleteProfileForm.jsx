import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const CompleteProfileForm = ({ member, onClose, onSuccess }) => {
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
    password: member.password || "",
    familyid: member.familyid || "",
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

  // Handle location change and auto-fill address fields
  const handleLocationChange = (location) => {
    let updatedAddress = { ...form.address, currlocation: location };

    switch (location) {
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

    setForm((prev) => ({ ...prev, address: updatedAddress }));
  };

  // Handle spouse input changes
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

  // Generate spouse input fields based on marriage number
  const generateSpouseFields = () => {
    const spouseCount = parseInt(form.marriage.number) || 0;
    const fields = [];

    for (let i = 0; i < spouseCount; i++) {
      fields.push(
        <input
          key={i}
          type="text"
          placeholder={`Spouse ${i + 1} Name`}
          value={form.marriage.spouse[i] || ""}
          onChange={(e) => handleSpouseChange(i, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return fields;
  };

  const handleSubmit = async (e) => {
    console.log(form);
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
      formData.append("password", form.password);
      formData.append("marriage", JSON.stringify(form.marriage));
      formData.append("contact", JSON.stringify(form.contact));
      formData.append("address", JSON.stringify(form.address));
      formData.append("education", JSON.stringify(form.education));
      formData.append("profession", JSON.stringify(form.profession));
      formData.append("healthissue", form.healthissue);
      formData.append("islive", form.islive);
      formData.append("isComplete", true);
      console.log(formData);

      const { data } = await axios.post(
        backendUrl + "/api/family/complete-profile",
        formData,
        { headers: { token } }
      );
      console.log({ data });
      if (data.success) {
        toast.success(data.message);
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
      {/* Authentication Section - Moved to top */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">
          Authentication
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) =>
                handleInputChange(null, "username", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password (optional)"
              value={form.password}
              onChange={(e) =>
                handleInputChange(null, "password", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={form.fullname}
              onChange={(e) =>
                handleInputChange(null, "fullname", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father ID
            </label>
            <input
              type="text"
              placeholder="Enter father ID"
              value={form.fatherid}
              onChange={(e) =>
                handleInputChange(null, "fatherid", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Name
            </label>
            <input
              type="text"
              placeholder="Enter mother name"
              value={form.mother}
              onChange={(e) =>
                handleInputChange(null, "mother", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) =>
                handleInputChange(null, "gender", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => handleInputChange(null, "dob", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={form.contact.email}
              onChange={(e) =>
                handleInputChange("contact", "email", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <div className="flex gap-2">
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
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              placeholder="Enter WhatsApp number"
              value={form.contact.whatsappno}
              onChange={(e) =>
                handleInputChange("contact", "whatsappno", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Location
            </label>
            <select
              value={form.address.currlocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              placeholder="Enter country"
              value={form.address.country}
              onChange={(e) =>
                handleInputChange("address", "country", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              placeholder="Enter state"
              value={form.address.state}
              onChange={(e) =>
                handleInputChange("address", "state", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <input
              type="text"
              placeholder="Enter district"
              value={form.address.district}
              onChange={(e) =>
                handleInputChange("address", "district", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="Enter city"
              value={form.address.city}
              onChange={(e) =>
                handleInputChange("address", "city", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Office
            </label>
            <input
              type="text"
              placeholder="Enter post office"
              value={form.address.postoffice}
              onChange={(e) =>
                handleInputChange("address", "postoffice", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Code
            </label>
            <input
              type="text"
              placeholder="Enter PIN code"
              value={form.address.pin}
              onChange={(e) =>
                handleInputChange("address", "pin", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark
            </label>
            <input
              type="text"
              placeholder="Enter landmark"
              value={form.address.landmark}
              onChange={(e) =>
                handleInputChange("address", "landmark", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street
            </label>
            <input
              type="text"
              placeholder="Enter street"
              value={form.address.street}
              onChange={(e) =>
                handleInputChange("address", "street", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apartment
            </label>
            <input
              type="text"
              placeholder="Enter apartment"
              value={form.address.apartment}
              onChange={(e) =>
                handleInputChange("address", "apartment", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <input
              type="text"
              placeholder="Enter floor"
              value={form.address.floor}
              onChange={(e) =>
                handleInputChange("address", "floor", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <input
              type="text"
              placeholder="Enter room"
              value={form.address.room}
              onChange={(e) =>
                handleInputChange("address", "room", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education Level
            </label>
            <select
              value={form.education.upto}
              onChange={(e) =>
                handleInputChange("education", "upto", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification
            </label>
            <input
              type="text"
              placeholder="Enter qualification details"
              value={form.education.qualification}
              onChange={(e) =>
                handleInputChange("education", "qualification", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Profession */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">Profession</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Category
            </label>
            <select
              value={form.profession.category}
              onChange={(e) =>
                handleInputChange("profession", "category", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              placeholder="Enter job title"
              value={form.profession.job}
              onChange={(e) =>
                handleInputChange("profession", "job", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Marriage */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">
          Marriage Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status
            </label>
            <select
              value={form.marriage.maritalstatus}
              onChange={(e) =>
                handleInputChange("marriage", "maritalstatus", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Marriages
            </label>
            <input
              type="number"
              placeholder="Enter number of marriages"
              value={form.marriage.number}
              onChange={(e) =>
                handleInputChange("marriage", "number", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          {form.marriage.number && parseInt(form.marriage.number) > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse Names
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generateSpouseFields()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Issue */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">
          Health Information
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blood Group
          </label>
          <select
            value={form.bloodgroup}
            onChange={(e) =>
              handleInputChange(null, "bloodgroup", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Health Issue
          </label>
          <textarea
            placeholder="Enter health issues or 'None' if no issues"
            value={form.healthissue}
            onChange={(e) =>
              handleInputChange(null, "healthissue", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Is Alive
          </label>
          <select
            value={form.islive}
            onChange={(e) =>
              handleInputChange(null, "islive", e.target.value === "true")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
};

export default CompleteProfileForm;
