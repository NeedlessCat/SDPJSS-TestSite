import React, { useState, useEffect, useContext } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { AdminContext } from "../context/AdminContext"; // Adjust path as needed
import { toast } from "react-toastify";
import axios from "axios";

const DonationCategory = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    rate: "",
    weight: "",
    packet: false,
    description: "",
  });

  useEffect(() => {
    if (aToken) {
      fetchCategories();
    }
  }, [aToken]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/admin/categories", {
        headers: { aToken },
      });

      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(error.response?.data?.message || "Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.categoryName || !formData.rate || !formData.weight) {
      toast.error("Category name, rate, and weight are required");
      return;
    }

    try {
      setSubmitting(true);
      const requestData = {
        categoryName: formData.categoryName.trim(),
        rate: Number(formData.rate),
        weight: Number(formData.weight),
        packet: formData.packet,
        description: formData.description.trim(),
      };

      let response;
      if (editingId) {
        // Update existing category
        response = await axios.put(
          backendUrl + `/api/admin/categories/${editingId}`,
          requestData,
          { headers: { aToken } }
        );
      } else {
        // Add new category
        response = await axios.post(
          backendUrl + "/api/admin/categories",
          requestData,
          { headers: { aToken } }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        await fetchCategories(); // Refresh the categories list
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        error.response?.data?.message ||
          "Error saving category. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = () => {
    setEditingId(null);
    setFormData({
      categoryName: "",
      rate: "",
      weight: "",
      packet: false,
      description: "",
    });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setFormData({
      categoryName: category.categoryName,
      rate: category.rate.toString(),
      weight: category.weight.toString(),
      packet: category.packet,
      description: category.description || "",
    });
    setEditingId(category._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const { data } = await axios.delete(
          backendUrl + `/api/admin/categories/${id}`,
          { headers: { aToken } }
        );

        if (data.success) {
          toast.success(data.message);
          await fetchCategories(); // Refresh the categories list
        } else {
          toast.error(data.message || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error(
          error.response?.data?.message ||
            "Error deleting category. Please try again."
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      categoryName: "",
      rate: "",
      weight: "",
      packet: false,
      description: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Donation Categories
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and configure donation categories with rates and weights
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            All Categories ({categories.length})
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          {categories.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Plus className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                No categories available. Add your first category!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Category Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Weight
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Packet
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {category.categoryName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ${category.rate}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {category.weight} kg
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.packet
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.packet ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {category.description || "No description"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            disabled={loading}
                            className="p-2 bg-blue-100 hover:bg-blue-200 disabled:bg-blue-50 text-blue-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            disabled={loading}
                            className="p-2 bg-red-100 hover:bg-red-200 disabled:bg-red-50 text-red-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingId ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base disabled:bg-gray-50"
                  placeholder="Enter category name"
                />
              </div>

              {/* Rate and Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate ($) *
                  </label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base disabled:bg-gray-50"
                    placeholder="Enter rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base disabled:bg-gray-50"
                    placeholder="Enter weight"
                  />
                </div>
              </div>

              {/* Packet Required */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="packet"
                  checked={formData.packet}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Packet Required
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base resize-vertical disabled:bg-gray-50"
                  placeholder="Enter description (optional)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {submitting
                    ? "Processing..."
                    : editingId
                    ? "Update Category"
                    : "Add Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationCategory;
