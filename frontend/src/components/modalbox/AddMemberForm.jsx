// components/AddMemberForm.jsx
import axios from "axios";
import React, { useState } from "react";
import { useContext } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const AddMemberForm = ({ onClose }) => {
  const { backendUrl, token, loadUserProfileData } = useContext(AppContext);

  const [member, setMember] = useState({
    fullname: "",
    fatherid: "",
    mother: "",
    gender: "",
    dob: "",
    bloodgroup: "",
    mobileno: {
      code: "",
      number: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleMobileChange = (field, value) => {
    setMember((prev) => ({
      ...prev,
      mobileno: {
        ...prev.mobileno,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Member:", member);

    try {
      const formData = new FormData();
      formData.append("fullname", member.fullname);
      formData.append("fatherid", member.fatherid);
      formData.append("mother", member.mother);
      formData.append("gender", member.gender);
      formData.append("dob", member.dob);
      formData.append("bloodgroup", member.bloodgroup);
      formData.append("mobileno", JSON.stringify(member.mobileno));

      const { data } = await axios.post(
        backendUrl + "/api/family/add-member",
        formData,
        { headers: { token } }
      );

      console.log(data);
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
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
      {/* Basic Information */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">
          Add New Family Member
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullname"
              value={member.fullname}
              onChange={handleChange}
              required
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father ID *
            </label>
            <input
              type="text"
              name="fatherid"
              value={member.fatherid}
              onChange={handleChange}
              required
              placeholder="Enter father ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-blue-600 mt-1">
              💡 Note: The eldest member of the family should have the family ID
              as father ID
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Name *
            </label>
            <input
              type="text"
              name="mother"
              value={member.mother}
              onChange={handleChange}
              required
              placeholder="Enter mother name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              name="gender"
              value={member.gender}
              onChange={handleChange}
              required
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
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              value={member.dob}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group *
            </label>
            <select
              name="bloodgroup"
              value={member.bloodgroup}
              onChange={handleChange}
              required
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
        </div>

        {/* Mobile Number */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Code"
              value={member.mobileno.code}
              onChange={(e) => handleMobileChange("code", e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Mobile number"
              value={member.mobileno.number}
              onChange={(e) => handleMobileChange("number", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
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
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Add Member
        </button>
      </div>
    </div>
  );
};

export default AddMemberForm;
