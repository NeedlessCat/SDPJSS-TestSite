// components/EditFamilyForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const EditFamilyForm = ({ initialData, onClose, onSuccess }) => {
  const { backendUrl, token, loadUserProfileData } = useContext(AppContext);
  const [form, setForm] = useState({
    familyname: initialData.familyname || "",
    familyaddress: initialData.familyaddress || "",
    email: initialData.email || "",
    gotra: initialData.gotra || "",
    mobile: {
      code: initialData.mobile?.code || "",
      number: initialData.mobile?.number || "",
    },
  });

  console.log("Form", form);

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

  const handleSubmit = async (e) => {
    console.log(form);
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("familyname", form.familyname);
      formData.append("familyaddress", form.familyaddress);
      formData.append("email", form.email);
      formData.append("gotra", form.gotra);
      formData.append("mobile", JSON.stringify(form.mobile));
      console.log(formData);

      const { data } = await axios.post(
        backendUrl + "/api/family/update-profile",
        formData,
        { headers: { token } }
      );
      console.log({ data });
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        onSuccess();
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
      {/* Family Information */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">
          Family Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Name
            </label>
            <input
              type="text"
              placeholder="Enter family name"
              value={form.familyname}
              onChange={(e) =>
                handleInputChange(null, "familyname", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gotra
            </label>
            <input
              type="text"
              placeholder="Enter gotra"
              value={form.gotra}
              onChange={(e) => handleInputChange(null, "gotra", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Address
            </label>
            <textarea
              placeholder="Enter family address"
              value={form.familyaddress}
              onChange={(e) =>
                handleInputChange(null, "familyaddress", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
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
              value={form.email}
              onChange={(e) => handleInputChange(null, "email", e.target.value)}
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
                value={form.mobile.code}
                onChange={(e) =>
                  handleInputChange("mobile", "code", e.target.value)
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Mobile number"
                value={form.mobile.number}
                onChange={(e) =>
                  handleInputChange("mobile", "number", e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
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
          Update Family
        </button>
      </div>
    </div>
  );
};

export default EditFamilyForm;
