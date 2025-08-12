import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import khandanModel from "../models/KhandanModel.js";
import userModel from "../models/UserModel.js";
import jobOpeningModel from "../models/JobOpeningModel.js";
import staffRequirementModel from "../models/StaffRequirementModel.js";
import advertisementModel from "../models/AdvertisementModel.js";
import noticeModel from "../models/NoticeModel.js";
import donationModel from "../models/DonationModel.js";
import donationCategoryModel from "../models/DonationCategoryModel.js";
import courierChargeModel from "../models/CourierChargesModel.js";

import adminModel from "../models/AdminModel.js";
import featureModel from "../models/FeatureModel.js"; // Make sure to import your feature model
import guestDonationModel from "../models/GuestDonationModel.js";

// Login Admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check for Super Admin (from environment variables)
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const tokenPayload = {
        id: "superadmin",
        role: "superadmin",
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    }

    // 2. Check for regular admin in the database
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // Create token for regular admin
    console.log(admin);
    const tokenPayload = {
      id: admin._id,
      name: admin.name,
      role: admin.role,
      allowedFeatures: admin.allowedFeatures, // Include permissions in the token
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server Error" });
  }
};

// Add Admin (Super Admin only)
const addAdmin = async (req, res) => {
  const { name, email, password, allowedFeatures } = req.body;
  console.log(req.body);
  try {
    const exists = await adminModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new adminModel({
      name,
      email,
      password: hashedPassword,
      allowedFeatures,
    });

    const admin = await newAdmin.save();
    res.json({
      success: true,
      message: "Admin added successfully",
      data: admin,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding admin" });
  }
};

// List all Admins (Super Admin only)
const listAdmins = async (req, res) => {
  try {
    // Fetch admins and populate the names of the allowed features
    const admins = await adminModel
      .find({})
      .select("-password")
      .populate("allowedFeatures", "featureName");
    res.json({ success: true, data: admins });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching admins" });
  }
};
// Edit Admin (Super Admin only)
const editAdmin = async (req, res) => {
  const { id, name, email, password, allowedFeatures } = req.body;

  try {
    // Find the admin to edit
    const admin = await adminModel.findById(id);
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    // Check if email is being changed and if it's already taken by another admin
    if (email !== admin.email) {
      const emailExists = await adminModel.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.json({
          success: false,
          message: "Email already exists for another admin",
        });
      }
    }

    // Prepare update object
    const updateData = {
      name,
      email,
      allowedFeatures,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    // Update the admin
    const updatedAdmin = await adminModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("allowedFeatures", "featureName");

    res.json({
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating admin" });
  }
};

// Remove Admin (Super Admin only)
const removeAdmin = async (req, res) => {
  try {
    await adminModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Admin removed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing admin" });
  }
};

// API to get family list with count (using khandanModel)
const getFamilyList = async (req, res) => {
  try {
    const families = await khandanModel.find({});

    const count = families.length;

    res.json({
      success: true,
      families,
      count,
      message: `Retrieved ${count} families successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user list with count
const getUserList = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password")
      .populate("khandanid", "name khandanid")
      .sort({ createdAt: -1 });

    const count = users.length;

    res.json({
      success: true,
      users,
      count,
      message: `Retrieved ${count} users successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get staff requirement list with count
const getStaffRequirementList = async (req, res) => {
  try {
    const staffRequirements = await staffRequirementModel
      .find({})
      .populate("userId", "fullname username")
      .sort({ postedDate: -1 });

    const count = staffRequirements.length;

    res.json({
      success: true,
      staffRequirements,
      count,
      message: `Retrieved ${count} staff requirements successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get job opening list with count
const getJobOpeningList = async (req, res) => {
  try {
    const jobOpenings = await jobOpeningModel
      .find({})
      .populate("userId", "fullname username")
      .sort({ postedDate: -1 });

    const count = jobOpenings.length;

    res.json({
      success: true,
      jobOpenings,
      count,
      message: `Retrieved ${count} job openings successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get advertisement list with count
const getAdvertisementList = async (req, res) => {
  try {
    const advertisements = await advertisementModel
      .find({})
      .populate("userId", "fullname username")
      .sort({ postedDate: -1 });

    const count = advertisements.length;

    res.json({
      success: true,
      advertisements,
      count,
      message: `Retrieved ${count} advertisements successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get donation list
const getDonationList = async (req, res) => {
  try {
    const donations = await donationModel
      .find({ paymentStatus: "completed" })
      .populate("userId", "fullname email contact address")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.log("Error in getDonationList:", error);
    res.json({ success: false, message: error.message });
  }
};

const getGuestDonationList = async (req, res) => {
  try {
    const guestDonations = await guestDonationModel
      .find({ paymentStatus: "completed" }) // Filter for completed donations
      .populate("guestId", "fullname contact address") // Populate guest user fields
      .sort({ createdAt: -1 });

    // Format data for frontend consistency by renaming guestId to userId
    const formattedDonations = guestDonations.map((d) => {
      const doc = d.toObject();
      doc.userId = doc.guestId; // Create a 'userId' property
      delete doc.guestId; // Remove the original 'guestId'
      return doc;
    });

    res.json({
      success: true,
      donations: formattedDonations, // Send with the same key 'donations'
    });
  } catch (error) {
    console.log("Error in getGuestDonationList:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get family count only (using khandanModel)
const getFamilyCount = async (req, res) => {
  try {
    const { year } = req.query; // Get year from query params
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;

    // Create start and end dates for the year
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1); // January 1st of next year

    // Get monthly family registrations for the specified year
    const monthlyFamilies = await khandanModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Create array with all 12 months, filling missing months with 0
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthNames.map((month, index) => {
      const monthData = monthlyFamilies.find(
        (item) => item._id.month === index + 1
      );
      return {
        month,
        families: monthData ? monthData.count : 0,
      };
    });

    // Get total count for the year
    const totalCount = monthlyData.reduce(
      (sum, month) => sum + month.families,
      0
    );

    res.json({
      success: true,
      year: targetYear,
      totalCount,
      monthlyData,
      message: `Family registrations for ${targetYear}: ${totalCount}`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user count only
const getUserCount = async (req, res) => {
  try {
    const { year } = req.query; // Get year from query params
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;

    // Create start and end dates for the year
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1); // January 1st of next year

    // Get monthly user registrations for the specified year
    const monthlyUsers = await userModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          complete: { $sum: { $cond: ["$isComplete", 1, 0] } },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Create array with all 12 months, filling missing months with 0
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthNames.map((month, index) => {
      const monthData = monthlyUsers.find(
        (item) => item._id.month === index + 1
      );
      return {
        month,
        users: monthData ? monthData.count : 0,
        completeUsers: monthData ? monthData.complete : 0,
        incompleteUsers: monthData ? monthData.count - monthData.complete : 0,
      };
    });

    // Get totals for the year
    const totalUsers = monthlyData.reduce((sum, month) => sum + month.users, 0);
    const totalComplete = monthlyData.reduce(
      (sum, month) => sum + month.completeUsers,
      0
    );
    const totalIncomplete = totalUsers - totalComplete;

    res.json({
      success: true,
      year: targetYear,
      totalUsers,
      completeProfiles: totalComplete,
      incompleteProfiles: totalIncomplete,
      monthlyData,
      message: `User registrations for ${targetYear}: ${totalUsers} (Complete: ${totalComplete}, Incomplete: ${totalIncomplete})`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId, isApproved } = req.body;

    // Validate status
    if (!["approved", "disabled"].includes(isApproved)) {
      return res.json({ success: false, message: "Invalid status value" });
    }

    const user = await userModel
      .findByIdAndUpdate(userId, { isApproved }, { new: true })
      .select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
      message: `User ${isApproved} successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all notices
const getNoticeList = async (req, res) => {
  try {
    const notices = await noticeModel.find({}).sort({ createdAt: -1 }); // Most recent first

    const count = notices.length;

    res.json({
      success: true,
      notices,
      count,
      message: `Retrieved ${count} notices successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new notice
const addNotice = async (req, res) => {
  try {
    const { title, message, icon, color, type, author, category } = req.body;

    // Validate required fields
    if (
      !title ||
      !message ||
      !icon ||
      !color ||
      !type ||
      !author ||
      !category
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate type enum
    const validTypes = [
      "alert",
      "announcement",
      "event",
      "achievement",
      "info",
    ];
    if (!validTypes.includes(type)) {
      return res.json({
        success: false,
        message: "Invalid notice type",
      });
    }

    const newNotice = new noticeModel({
      title,
      message,
      icon,
      color,
      type,
      author,
      category,
      time: new Date(), // Set current time
    });

    await newNotice.save();

    res.json({
      success: true,
      notice: newNotice,
      message: "Notice added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update a notice
const updateNotice = async (req, res) => {
  try {
    console.log("Notice", req.params);
    const { id } = req.params;
    const { title, message, icon, color, type, author, category } = req.body;

    // Validate required fields
    if (
      !title ||
      !message ||
      !icon ||
      !color ||
      !type ||
      !author ||
      !category
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate type enum
    const validTypes = [
      "alert",
      "announcement",
      "event",
      "achievement",
      "info",
    ];
    if (!validTypes.includes(type)) {
      return res.json({
        success: false,
        message: "Invalid notice type",
      });
    }

    const updatedNotice = await noticeModel.findByIdAndUpdate(
      id,
      {
        title,
        message,
        icon,
        color,
        type,
        author,
        category,
      },
      { new: true }
    );

    if (!updatedNotice) {
      return res.json({ success: false, message: "Notice not found" });
    }

    res.json({
      success: true,
      notice: updatedNotice,
      message: "Notice updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a notice
const deleteNotice = async (req, res) => {
  try {
    console.log("Notice", req.params);
    const { id } = req.params;

    const deletedNotice = await noticeModel.findByIdAndDelete(id);

    if (!deletedNotice) {
      return res.json({ success: false, message: "Notice not found" });
    }

    res.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await donationCategoryModel.find({ isActive: true });
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { categoryName, rate, weight, packet, description, dynamic } =
      req.body;
    console.log(req.body);

    // Validate required fields
    if (!categoryName || !rate || !(weight || packet)) {
      return res.json({
        success: false,
        message: "Category name, rate, and weight are required",
      });
    }
    if (
      dynamic &&
      dynamic.isDynamic &&
      (!dynamic.minvalue || dynamic.minvalue < 0)
    ) {
      return res.json({
        success: false,
        message:
          "For a dynamic category, a minimum value of 0 or more is required.",
      });
    }
    // Check if category already exists
    const existingCategory = await donationCategoryModel.findOne({
      categoryName: categoryName.trim(),
    });

    if (existingCategory) {
      return res.json({
        success: false,
        message: "Category already exists",
      });
    }

    // Create new category
    const newCategory = new donationCategoryModel({
      categoryName: categoryName.trim(),
      rate: Number(rate),
      weight: Number(weight),
      packet: Boolean(packet),
      description: description?.trim() || "",
      dynamic: {
        isDynamic: dynamic?.isDynamic || false,
        minvalue: dynamic?.isDynamic ? Number(dynamic.minvalue) : 0,
      },
    });

    const savedCategory = await newCategory.save();

    res.json({
      success: true,
      message: "Category added successfully",
      category: savedCategory,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Edit category
const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, rate, weight, packet, description, dynamic } =
      req.body;

    // Validate required fields
    if (!categoryName || !rate || !(weight || packet)) {
      return res.json({
        success: false,
        message: "Category name, rate, and weight/packet are required",
      });
    }

    if (
      dynamic &&
      dynamic.isDynamic &&
      (!dynamic.minvalue || dynamic.minvalue < 0)
    ) {
      return res.json({
        success: false,
        message:
          "For a dynamic category, a minimum value of 0 or more is required.",
      });
    }

    // Check if category exists
    const category = await donationCategoryModel.findById(id);
    if (!category) {
      return res.json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if another category with same name exists
    const existingCategory = await donationCategoryModel.findOne({
      categoryName: categoryName.trim(),
      _id: { $ne: id },
    });

    if (existingCategory) {
      return res.json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Update category
    const updatedCategory = await donationCategoryModel.findByIdAndUpdate(
      id,
      {
        categoryName: categoryName.trim(),
        rate: Number(rate),
        weight: Number(weight),
        packet: Boolean(packet),
        description: description?.trim() || "",
        dynamic: {
          isDynamic: dynamic?.isDynamic || false,
          minvalue: dynamic?.isDynamic ? Number(dynamic.minvalue) : 0,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete category (soft delete)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await donationCategoryModel.findById(id);
    if (!category) {
      return res.json({
        success: false,
        message: "Category not found",
      });
    }

    // Soft delete by setting isActive to false
    await donationCategoryModel.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get single category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await donationCategoryModel.findById(id);
    if (!category) {
      return res.json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get available years for data filtering
const getAvailableYears = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    // Aggregate to find unique years from user creation dates
    const years = await userModel.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
      {
        $sort: { _id: -1 }, // Sort in descending order
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
        },
      },
    ]);

    // Extract just the year numbers
    const availableYears = years.map((item) => item.year);

    // Ensure current year is always an option if no data exists for it yet
    if (!availableYears.includes(currentYear)) {
      availableYears.unshift(currentYear);
    }
    // Remove duplicates and sort again just to be safe, although aggregation should handle unique
    const uniqueSortedYears = [...new Set(availableYears)].sort(
      (a, b) => b - a
    );

    res.json({
      success: true,
      years: uniqueSortedYears,
      message: "Available years fetched successfully",
    });
  } catch (error) {
    console.error("Error in getAvailableYears:", error);
    res.json({ success: false, message: error.message });
  }
};

// ========== COURIER CHARGE CONTROLLERS ==========

// Get all courier charges
const getCourierCharges = async (req, res) => {
  try {
    const courierCharges = await courierChargeModel
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Courier charges fetched successfully",
      courierCharges,
    });
  } catch (error) {
    console.error("Error fetching courier charges:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courier charges",
      error: error.message,
    });
  }
};

// Create new courier charge
const createCourierCharge = async (req, res) => {
  try {
    const { region, amount } = req.body;

    // Validation
    if (!region || !amount) {
      return res.status(400).json({
        success: false,
        message: "Region and amount are required",
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    // Valid regions
    const validRegions = [
      "in_gaya_outside_manpur",
      "in_bihar_outside_gaya",
      "in_india_outside_bihar",
      "outside_india",
    ];

    if (!validRegions.includes(region)) {
      return res.status(400).json({
        success: false,
        message: "Invalid region selected",
      });
    }

    // Check if courier charge for this region already exists
    const existingCharge = await courierChargeModel.findOne({ region });
    if (existingCharge) {
      return res.status(400).json({
        success: false,
        message: "Courier charge for this region already exists",
      });
    }

    // Create new courier charge
    const newCourierCharge = new courierChargeModel({
      region,
      amount: Number(amount),
    });

    await newCourierCharge.save();

    res.status(201).json({
      success: true,
      message: "Courier charge created successfully",
      courierCharge: newCourierCharge,
    });
  } catch (error) {
    console.error("Error creating courier charge:", error);
    res.status(500).json({
      success: false,
      message: "Error creating courier charge",
      error: error.message,
    });
  }
};

// Update courier charge
const updateCourierCharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { region, amount } = req.body;

    // Validation
    if (!region || !amount) {
      return res.status(400).json({
        success: false,
        message: "Region and amount are required",
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    // Valid regions
    const validRegions = [
      "in_gaya_outside_manpur",
      "in_bihar_outside_gaya",
      "in_india_outside_bihar",
      "outside_india",
    ];

    if (!validRegions.includes(region)) {
      return res.status(400).json({
        success: false,
        message: "Invalid region selected",
      });
    }

    // Check if courier charge exists
    const courierCharge = await courierChargeModel.findById(id);
    if (!courierCharge) {
      return res.status(404).json({
        success: false,
        message: "Courier charge not found",
      });
    }

    // Check if courier charge for this region already exists (excluding current one)
    const existingCharge = await courierChargeModel.findOne({
      region,
      _id: { $ne: id },
    });

    if (existingCharge) {
      return res.status(400).json({
        success: false,
        message: "Courier charge for this region already exists",
      });
    }

    // Update courier charge
    const updatedCourierCharge = await courierChargeModel.findByIdAndUpdate(
      id,
      {
        region,
        amount: Number(amount),
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Courier charge updated successfully",
      courierCharge: updatedCourierCharge,
    });
  } catch (error) {
    console.error("Error updating courier charge:", error);
    res.status(500).json({
      success: false,
      message: "Error updating courier charge",
      error: error.message,
    });
  }
};

// Delete courier charge
const deleteCourierCharge = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if courier charge exists
    const courierCharge = await courierChargeModel.findById(id);
    if (!courierCharge) {
      return res.status(404).json({
        success: false,
        message: "Courier charge not found",
      });
    }

    // Delete courier charge
    await courierChargeModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Courier charge deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting courier charge:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting courier charge",
      error: error.message,
    });
  }
};

// Add a new feature
const addFeature = async (req, res) => {
  const { featureName, link, iconName, access } = req.body;
  if (!featureName || !link || !iconName || !access) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const feature = new featureModel({
    featureName,
    link,
    iconName,
    access,
  });

  try {
    await feature.save();
    res.json({ success: true, message: "Feature Added Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding feature" });
  }
};

// Get all features
const listFeatures = async (req, res) => {
  try {
    const filter = {};
    if (req.query.access) {
      filter.access = req.query.access;
    }
    const features = await featureModel.find(filter);
    res.json({ success: true, data: features });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching features" });
  }
};

// Update an existing feature (including toggling active status)
const updateFeature = async (req, res) => {
  try {
    await featureModel.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: "Feature Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating feature" });
  }
};

// Remove a feature
const removeFeature = async (req, res) => {
  try {
    await featureModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Feature Removed Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing feature" });
  }
};
const getDonationCount = async (req, res) => {
  try {
    const { year } = req.query; // Get year from query params
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear; // Create start and end dates for the year

    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1); // January 1st of next year // 1. Get monthly donation amounts for registered users

    const monthlyDonations = await donationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]); // 2. Get monthly donation amounts for guest users

    const monthlyGuestDonations = await guestDonationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]); // 3. Combine the results from both sources

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthNames.map((month, index) => {
      const monthIndex = index + 1; // Find data for the current month, defaulting to 0 if not found

      const userDonationData = monthlyDonations.find(
        (item) => item._id.month === monthIndex
      );
      const guestDonationData = monthlyGuestDonations.find(
        (item) => item._id.month === monthIndex
      );

      const userAmount = userDonationData ? userDonationData.totalAmount : 0;
      const guestAmount = guestDonationData ? guestDonationData.totalAmount : 0;

      return {
        month,
        donations: userAmount + guestAmount, // Sum of both donation types
      };
    }); // 4. Calculate the total amount for the entire year

    const totalAmount = monthlyData.reduce(
      (sum, month) => sum + month.donations,
      0
    ); // 5. Send the final combined data

    res.json({
      success: true,
      year: targetYear,
      totalAmount,
      monthlyData,
      message: `Total completed donations for ${targetYear}: ${totalAmount}`,
    });
  } catch (error) {
    console.log("Error in getDonationCount:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get courier addresses as JSON data
const getOnlineCourierAddresses = async (req, res) => {
  try {
    const { year, location = "all" } = req.query;

    // 1. Determine the year and create date range
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear + 1, 0, 1);

    // 2. Build the base query for donations
    const baseQuery = {
      method: "Online",
      courierCharge: { $gt: 0 },
      paymentStatus: "completed",
      createdAt: { $gte: startDate, $lt: endDate },
    };

    // 3. Fetch donations and populate user details
    const donations = await donationModel
      .find(baseQuery)
      .populate({ path: "userId", select: "fullname address contact" })
      .lean();

    // 4. Filter by location (In India / Outside India)
    const filteredDonations = donations.filter((donation) => {
      if (!donation.userId || !donation.userId.address) {
        return false;
      }
      const country = (donation.userId.address.country || "").toLowerCase();

      if (location === "in_india") {
        return country === "india";
      }
      if (location === "outside_india") {
        return country !== "india";
      }
      return true; // for location === 'all'
    });

    // 5. Sort the filtered data
    const sortedDonations = filteredDonations.sort((a, b) => {
      const addrA = a.userId.address;
      const addrB = b.userId.address;

      const countryCompare = (addrA.country || "").localeCompare(
        addrB.country || ""
      );
      if (countryCompare !== 0) return countryCompare;

      const stateCompare = (addrA.state || "").localeCompare(addrB.state || "");
      if (stateCompare !== 0) return stateCompare;

      const cityCompare = (addrA.city || "").localeCompare(addrB.city || "");
      return cityCompare;
    });

    // 6. Format the addresses for the response
    const senderAddress =
      "Shree Durga Sthan, Patwatoli, Manpur, P.O. Buniyadganj, Gaya ji, Bihar, India - 823003";
    const formattedAddresses = sortedDonations.map((d) => ({
      id: d._id,
      fromAddress: senderAddress,
      toName: d.userId.fullname,
      toAddress: d.postalAddress,
      toPhone: d.userId.contact?.mobileno
        ? `${d.userId.contact.mobileno.code} ${d.userId.contact.mobileno.number}`
        : "N/A",
      donationDate: d.createdAt,
    }));

    // 7. Send the response
    res.json({
      success: true,
      addresses: formattedAddresses,
      count: formattedAddresses.length,
    });
  } catch (error) {
    console.error("Error fetching courier addresses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching addresses.",
    });
  }
};

export {
  loginAdmin,
  addAdmin,
  listAdmins,
  removeAdmin,
  getFamilyList,
  getUserList,
  getStaffRequirementList,
  getJobOpeningList,
  getAdvertisementList,
  getDonationList,
  getGuestDonationList,
  getFamilyCount,
  getUserCount,
  updateUserStatus,
  getNoticeList,
  addNotice,
  updateNotice,
  deleteNotice,
  getAllCategories,
  addCategory,
  editCategory,
  deleteCategory,
  getCategory,
  getAvailableYears,
  // Courier charge controllers
  getCourierCharges,
  createCourierCharge,
  updateCourierCharge,
  deleteCourierCharge,
  //Features controllers
  addFeature,
  listFeatures,
  updateFeature,
  removeFeature,
  editAdmin,
  getDonationCount,
  getOnlineCourierAddresses,
};
