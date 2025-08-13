import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import razorpay from "razorpay";
import html_to_pdf from "html-pdf-node";

import userModel from "../models/UserModel.js";
import jobOpeningModel from "../models/JobOpeningModel.js";
import staffRequirementModel from "../models/StaffRequirementModel.js";
import advertisementModel from "../models/AdvertisementModel.js";
import donationModel from "../models/DonationModel.js";
import featureModel from "../models/FeatureModel.js";

// Initialize Razorpay
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to generate random password
const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Function to generate username from fullname and dob
const generateUsername = (fullname, dob) => {
  const firstName = fullname.split(" ")[0].toLowerCase();
  const date = new Date(dob);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${firstName}${day}${month}${year}`;
};

// Function to generate unique user ID in format UABC0001
const generateUserId = async () => {
  try {
    // Find the latest user with the highest ID
    const lastUser = await userModel
      .findOne({}, { id: 1 })
      .sort({ id: -1 })
      .limit(1);

    if (!lastUser || !lastUser.id) {
      return "UAAA0001";
    }

    const lastId = lastUser.id;

    // Extract parts: U + ABC + 0001
    const prefix = lastId.substring(0, 1); // 'U'
    const letters = lastId.substring(1, 4); // 'ABC'
    const number = parseInt(lastId.substring(4)); // 0001

    // If number can be incremented (less than 9999)
    if (number < 9999) {
      const newNumber = (number + 1).toString().padStart(4, "0");
      return `${prefix}${letters}${newNumber}`;
    }

    // Number has reached maximum, increment letters
    let newLetters = incrementLetters(letters);
    return `${prefix}${newLetters}0001`;
  } catch (error) {
    console.error("Error generating user ID:", error);
    return "UAAA0001";
  }
};

// Function to increment letters (ABC -> ABD -> ABE ... -> ABZ -> ACA -> ACB ...)
const incrementLetters = (letters) => {
  let letterArray = letters.split("");

  // Start from the rightmost letter
  for (let i = letterArray.length - 1; i >= 0; i--) {
    if (letterArray[i] !== "Z") {
      // Increment current letter
      letterArray[i] = String.fromCharCode(letterArray[i].charCodeAt(0) + 1);
      break;
    } else {
      // Current letter is Z, set to A and continue to next position
      letterArray[i] = "A";

      // If we're at the first position and it was Z, we need to expand
      if (i === 0) {
        // This shouldn't happen in normal usage, but handle edge case
        letterArray = ["A", "A", "A"];
      }
    }
  }

  return letterArray.join("");
};

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const convertHundreds = (n) => {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + " ";
      return result;
    }
    if (n > 0) {
      result += ones[n] + " ";
    }
    return result;
  };

  if (num === 0) return "Zero";

  let result = "";
  let crore = Math.floor(num / 10000000);
  let lakh = Math.floor((num % 10000000) / 100000);
  let thousand = Math.floor((num % 100000) / 1000);
  let remainder = num % 1000;

  if (crore > 0) {
    result += convertHundreds(crore) + "Crore ";
  }
  if (lakh > 0) {
    result += convertHundreds(lakh) + "Lakh ";
  }
  if (thousand > 0) {
    result += convertHundreds(thousand) + "Thousand ";
  }
  if (remainder > 0) {
    result += convertHundreds(remainder);
  }

  return result.trim();
};

// Function to send SMS (you'll need to integrate with SMS service like Twilio)
const sendSMS = async (mobile, username, password) => {
  try {
    // Implement SMS sending logic here
    console.log(
      `SMS sent to ${mobile.code}${mobile.number}: Username: ${username}, Password: ${password}`
    );
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
};

// Function to send email
const sendEmail = async (email, username, password, fullname) => {
  try {
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome! Your Account Credentials",
      html: `
        <h2>Welcome ${fullname}!</h2>
        <p>Your account has been successfully created. Here are your login credentials:</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><em>Important: You can change your username and password anytime after logging in.</em></p>
        <p>Best regards,<br>Your Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

//-----------------------------------------------------------------------------

// API for user registration
const registerUser = async (req, res) => {
  try {
    console.log(req.body);
    const {
      fullname: rawFullname,
      fatherid,
      fatherName: rawFatherName,
      mother: rawMother,
      gender,
      dob,
      bloodgroup,
      khandanid,
      email: rawEmail,
      mobile,
      address: rawAddress,
      education,
      profession,
      healthissue: rawHealthissue,
      marriage,
    } = req.body;

    const fullname = rawFullname?.trim();
    const fatherName = rawFatherName?.trim();
    const mother = rawMother?.trim();
    const email = rawEmail?.trim();
    const healthissue = rawHealthissue?.trim();

    // Validate required fields
    if (
      !fullname ||
      !(fatherid || fatherName) ||
      !gender ||
      !dob ||
      !khandanid ||
      !rawAddress
    ) {
      return res.json({
        success: false,
        message:
          "Missing required details: fullname, fatherid/fatheName, gender, dob, khandanid, and address are required",
      });
    }
    // --- TRIMMED --- Create a new address object with trimmed values
    const address = {
      currlocation: rawAddress.currlocation?.trim(),
      country: rawAddress.country?.trim(),
      state: rawAddress.state?.trim(),
      district: rawAddress.district?.trim(),
      city: rawAddress.city?.trim(),
      postoffice: rawAddress.postoffice?.trim(),
      pin: rawAddress.pin?.trim(),
      street: rawAddress.street?.trim(),
      landmark: rawAddress.landmark?.trim(),
      apartment: rawAddress.apartment?.trim(),
      floor: rawAddress.floor?.trim(),
      room: rawAddress.room?.trim(),
    };
    // Validate required address fields
    const requiredAddressFields = [
      "currlocation",
      "country",
      "state",
      "city",
      "postoffice",
      "pin",
      "street",
    ];
    const missingAddressFields = requiredAddressFields.filter(
      (field) => !address[field] || address[field].trim() === ""
    );

    if (missingAddressFields.length > 0) {
      return res.json({
        success: false,
        message: `Missing required address fields: ${missingAddressFields.join(
          ", "
        )}`,
      });
    }

    // Validate that at least one contact method is provided
    const hasEmail = email && email !== "";
    const hasMobile = mobile && mobile.code && mobile.number;

    if (!hasEmail && !hasMobile) {
      return res.json({
        success: false,
        message: "At least one contact method (email or mobile) is required",
      });
    }

    // Validate email format if provided
    if (hasEmail && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validate mobile number if provided
    if (
      hasMobile &&
      (typeof mobile !== "object" ||
        !mobile.code ||
        !mobile.number ||
        !/^\d{10}$/.test(mobile.number))
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender.toLowerCase())) {
      return res.json({
        success: false,
        message: "Gender must be 'male', 'female', or 'other'",
      });
    }

    // Validate date of birth
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.json({
        success: false,
        message: "Enter a valid date of birth",
      });
    }

    // Check for an existing user with the same name, father's name, and DOB.
    const existingUser = await userModel.findOne({
      fullname: fullname,
      fatherName: fatherName,
      dob: dobDate,
    });

    if (existingUser) {
      return res.json({
        success: false,
        message:
          "A user with the same name, father's name, and date of birth already exists.",
      });
    }

    const today = new Date();
    const minAllowedDate = new Date();
    minAllowedDate.setFullYear(today.getFullYear() - 10);

    // Check if DOB is at least 10 years earlier
    if (dobDate > minAllowedDate) {
      return res.json({
        success: false,
        message: "You must be at least 10 years old",
      });
    }

    // Generate unique user ID
    const userId = await generateUserId();

    // Generate username and password
    const generatedUsername = generateUsername(fullname, dobDate);
    const generatedPassword = generateRandomPassword();

    // Check if username already exists, if so, add a number suffix
    let finalUsername = generatedUsername;
    let counter = 1;
    while (await userModel.findOne({ username: finalUsername })) {
      finalUsername = `${generatedUsername}${counter}`;
      counter++;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    // Prepare contact object
    const contactData = {
      email: hasEmail ? email : "",
      mobileno: hasMobile ? mobile : { code: "+91", number: "0000000000" },
      whatsappno: "",
    };

    // Prepare address object with required fields
    const addressData = {
      currlocation: address.currlocation,
      country: address.country,
      state: address.state,
      city: address.city,
      postoffice: address.postoffice,
      pin: address.pin,
      street: address.street,
      // Optional fields
      district: address.district || "",
      landmark: address.landmark || "",
      apartment: address.apartment || "",
      floor: address.floor || "",
      room: address.room || "",
    };

    // Create user data
    const userData = {
      fullname,
      id: userId,
      fatherid,
      fatherName,
      mother: mother || "",
      gender: gender.toLowerCase(),
      dob: dobDate,
      bloodgroup: bloodgroup || "",
      username: finalUsername,
      password: hashedPassword,
      khandanid,
      contact: contactData,
      address: addressData,
      education: education || {
        upto: "",
        qualification: "",
      },
      profession: profession || {
        category: "",
        job: "",
        specialization: "",
      },
      healthissue: healthissue || "None",
      marriage: marriage || {
        maritalstatus: "",
        number: "",
        spouse: [],
      },
      islive: true,
      isComplete: false,
      isApproved: "approved",
    };

    const newUser = new userModel(userData);
    const savedUser = await newUser.save();

    // Send credentials via available contact methods
    const notifications = [];

    if (hasEmail) {
      const emailSent = await sendEmail(
        email,
        finalUsername,
        generatedPassword,
        fullname
      );
      notifications.push(
        emailSent ? "Email sent successfully" : "Email sending failed"
      );
    }

    // if (hasMobile) {
    //    const smsSent = await sendSMS(mobile, finalUsername, generatedPassword);
    //    notifications.push(
    //      smsSent ? "SMS sent successfully" : "SMS sending failed"
    //    );
    // }

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      token,
      userId: savedUser._id,
      userIdGenerated: userId,
      username: finalUsername,
      notifications,
      message:
        "User registered successfully. Login credentials sent to provided contact methods.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for user login
const loginUser = async (req, res) => {
  try {
    // console.log("Request Body User: ", req.body);
    const { username: rawUsername, password } = req.body;
    const username = rawUsername?.trim();

    if (!username || !password) {
      return res.json({
        success: false,
        message: "Username and password are required",
      });
    }
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const utoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, utoken });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getUserProfile = async (req, res) => {
  try {
    // User will send userId or get it from token
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    // Basic validation for incoming data
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided." });
    }

    // Optional: Add more specific validation if needed
    if (
      updateData.contact &&
      updateData.contact.email &&
      !validator.isEmail(updateData.contact.email)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email." });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: updateData, // Use $set to update only the fields provided in updateData
          updatedAt: new Date(),
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Ensure schema validation is run on update
        }
      )
      .select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      message: "Profile updated successfully!",
      userData: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    // Handle potential validation errors from Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update profile. Please try again.",
    });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const imageFile = req.file;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }
    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "No image file uploaded." });
    }

    // Upload to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "profile_images", // Optional: organize uploads in a folder
    });

    const imageURL = imageUpload.secure_url;

    // Update the user's image field in the database
    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { image: imageURL }, { new: true })
      .select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      message: "Profile image updated successfully.",
      image: imageURL,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile image." });
  }
};

// Change Password Route
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, userId } = req.body;
    console.log(req);

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // Check password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUsersByKhandan = async (req, res) => {
  try {
    const { khandanId } = req.params;

    if (!khandanId) {
      return res.json({
        success: false,
        message: "Khandan ID is required",
      });
    }

    // Find users by khandanid
    const users = await userModel
      .find({ khandanid: khandanId })
      .select("id fullname gender dob")
      .sort({ fullname: 1 });

    if (!users || users.length === 0) {
      return res.json({
        success: false,
        message: "No users found for this khandan",
        users: [],
      });
    }

    res.json({
      success: true,
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users by khandan:", error);
    res.json({
      success: false,
      message: "Failed to fetch users: " + error.message,
      users: [],
    });
  }
};

// API to create a job opening
const createJobOpening = async (req, res) => {
  try {
    console.log("Requested data: ", req.body);
    const {
      userId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log({
      userId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    });

    // Check for required fields
    if (!userId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required job fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    //Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const jobOpening = await jobOpeningModel.create({
      userId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements: parsedRequirements,
      contact: parsedContact,
    });

    res.json({
      success: true,
      message: "Job opening created successfully",
      jobOpening,
    });
  } catch (error) {
    console.log("Error in createJobOpening:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get the job Openings generated by a User
const getJobOpeningsByUser = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming user is authenticated and ID is in `req.user`

    const jobOpenings = await jobOpeningModel.find({ userId });

    res.status(200).json({ success: true, jobOpenings });
  } catch (error) {
    console.error("Error fetching user's job openings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get all the job openings open to people
const getAllJobOpeningsWithUserNames = async (req, res) => {
  try {
    const jobOpenings = await jobOpeningModel.find().populate({
      path: "userId",
      select: "fullname", // Only fetch the fullname of the user
    });

    const formatted = jobOpenings.map((job) => ({
      _id: job._id,
      title: job.title,
      category: job.category,
      description: job.description,
      location: job.location,
      salary: job.salary,
      jobType: job.jobType,
      availabilityDate: job.availabilityDate,
      requirements: job.requirements,
      isOpen: job.isOpen,
      contact: job.contact,
      postedDate: job.postedDate,
      userFullname: job.userId?.fullname || "Unknown",
    }));

    res.status(200).json({ success: true, jobOpenings: formatted });
  } catch (error) {
    console.error("Error fetching all job openings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to edit/update a job opening
const editJobOpening = async (req, res) => {
  try {
    const {
      jobId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log("Edit Req: ", req.body);
    console.log("Edit Data: ", {
      jobId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    });
    // Check for required fields
    if (!jobId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required job fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const updatedJob = await jobOpeningModel.findByIdAndUpdate(
      jobId,
      {
        title,
        category,
        description,
        location,
        salary,
        jobType,
        availabilityDate,
        requirements: parsedRequirements,
        contact: parsedContact,
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.json({
        success: false,
        message: "Job opening not found",
      });
    }

    res.json({
      success: true,
      message: "Job opening updated successfully",
      jobOpening: updatedJob,
    });
  } catch (error) {
    console.log("Error in editJobOpening:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a job opening
const deleteJobOpening = async (req, res) => {
  try {
    // const { jobId } = req.params;
    console.log("Delete req: ", req.body);
    const { jobId } = req.body;

    if (!jobId) {
      return res.json({
        success: false,
        message: "Job ID is required",
      });
    }

    const deletedJob = await jobOpeningModel.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return res.json({
        success: false,
        message: "Job opening not found",
      });
    }

    res.json({
      success: true,
      message: "Job opening deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteJobOpening:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to update job opening status (open/close)
const updateJobStatus = async (req, res) => {
  try {
    // const { jobId } = req.params;
    const { jobId, isOpen } = req.body;
    console.log(req.body);
    console.log({ jobId, isOpen });

    if (!jobId) {
      return res.json({
        success: false,
        message: "Job ID is missing",
      });
    }

    var isOpened = isOpen;
    if (typeof isOpen !== "boolean") {
      if (isOpen === "true") isOpened = true;
      else if (isOpen === "false") isOpened = false;
      else {
        return res.json({
          success: false,
          message: "isOpen must be boolean or true/false.",
        });
      }
    }

    const updatedJob = await jobOpeningModel.findByIdAndUpdate(
      jobId,
      { isOpen: isOpened },
      { new: true }
    );

    if (!updatedJob) {
      return res.json({
        success: false,
        message: "Job opening not found",
      });
    }

    res.json({
      success: true,
      message: `Job opening ${isOpened ? "opened" : "closed"} successfully`,
      jobOpening: updatedJob,
    });
  } catch (error) {
    console.log("Error in updateJobStatus:", error);
    res.json({ success: false, message: error.message });
  }
};

// -------STAFF REQUIREMENTS-------------
// API to create a staff requirement
const createStaffRequirement = async (req, res) => {
  try {
    console.log("Requested data: ", req.body);
    const {
      userId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log({
      userId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    });

    // Check for required fields
    if (!userId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required staff fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    //Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const staffRequirement = await staffRequirementModel.create({
      userId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements: parsedRequirements,
      contact: parsedContact,
    });

    res.json({
      success: true,
      message: "Staff requirement created successfully",
      staffRequirement,
    });
  } catch (error) {
    console.log("Error in createStaffRequirement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get the staff Requirements generated by a User
const getStaffRequirementsByUser = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming user is authenticated and ID is in `req.user`

    const staffRequirements = await staffRequirementModel.find({ userId });

    res.status(200).json({ success: true, staffRequirements });
  } catch (error) {
    console.error("Error fetching user's staff requirements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get all the staff Requirements open to people
const getAllStaffRequirementsWithUserNames = async (req, res) => {
  try {
    const staffRequirements = await staffRequirementModel.find().populate({
      path: "userId",
      select: "fullname", // Only fetch the fullname of the user
    });

    const formatted = staffRequirements.map((staff) => ({
      _id: staff._id,
      title: staff.title,
      category: staff.category,
      description: staff.description,
      location: staff.location,
      salary: staff.salary,
      staffType: staff.staffType,
      availabilityDate: staff.availabilityDate,
      requirements: staff.requirements,
      isOpen: staff.isOpen,
      contact: staff.contact,
      postedDate: staff.postedDate,
      userFullname: staff.userId?.fullname || "Unknown",
    }));

    res.status(200).json({ success: true, staffRequirements: formatted });
  } catch (error) {
    console.error("Error fetching all staff requirements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to edit/update a staff requirement
const editStaffRequirement = async (req, res) => {
  try {
    const {
      staffId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log("Edit Req: ", req.body);
    console.log("Edit Data: ", {
      staffId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    });
    // Check for required fields
    if (!staffId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required staff fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const updatedStaff = await staffRequirementModel.findByIdAndUpdate(
      staffId,
      {
        title,
        category,
        description,
        location,
        salary,
        staffType,
        availabilityDate,
        requirements: parsedRequirements,
        contact: parsedContact,
      },
      { new: true }
    );

    if (!updatedStaff) {
      return res.json({
        success: false,
        message: "Staff requirement not found",
      });
    }

    res.json({
      success: true,
      message: "Staff requirement updated successfully",
      staffRequirement: updatedStaff,
    });
  } catch (error) {
    console.log("Error in editStaffRequirement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a staff requirement
const deleteStaffRequirement = async (req, res) => {
  try {
    // const { staffId } = req.params;
    console.log("Delete req: ", req.body);
    const { staffId } = req.body;

    if (!staffId) {
      return res.json({
        success: false,
        message: "Staff ID is required",
      });
    }

    const deletedStaff = await staffRequirementModel.findByIdAndDelete(staffId);

    if (!deletedStaff) {
      return res.json({
        success: false,
        message: "Staff requirement not found",
      });
    }

    res.json({
      success: true,
      message: "Staff requirement deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteStaffRequirement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to update staff requirement status (open/close)
const updateStaffStatus = async (req, res) => {
  try {
    // const { staffId } = req.params;
    const { staffId, isOpen } = req.body;
    console.log(req.body);
    console.log({ staffId, isOpen });

    if (!staffId) {
      return res.json({
        success: false,
        message: "Staff ID is missing",
      });
    }

    var isOpened = isOpen;
    if (typeof isOpen !== "boolean") {
      if (isOpen === "true") isOpened = true;
      else if (isOpen === "false") isOpened = false;
      else {
        return res.json({
          success: false,
          message: "isOpen must be boolean or true/false.",
        });
      }
    }

    const updatedStaff = await staffRequirementModel.findByIdAndUpdate(
      staffId,
      { isOpen: isOpened },
      { new: true }
    );

    if (!updatedStaff) {
      return res.json({
        success: false,
        message: "Staff requirement not found",
      });
    }

    res.json({
      success: true,
      message: `Staff requirement ${
        isOpened ? "opened" : "closed"
      } successfully`,
      staffRequirement: updatedStaff,
    });
  } catch (error) {
    console.log("Error in updateStaffStatus:", error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------------------------

// -----------ADVERTISEMENT SECTION------
// API to create a new advertisement
const addAdvertisement = async (req, res) => {
  try {
    console.log("Requested data: ", req.body);
    const {
      userId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    } = req.body;

    console.log({
      userId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    });

    // Check for required fields
    if (
      !userId ||
      !title ||
      !description ||
      !validFrom ||
      !validUntil ||
      !contact
    ) {
      return res.json({
        success: false,
        message: "Missing required advertisement fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate >= untilDate) {
      return res.json({
        success: false,
        message: "Valid Until date must be after Valid From date",
      });
    }

    if (fromDate < today) {
      return res.json({
        success: false,
        message: "Valid From date cannot be in the past",
      });
    }

    const advertisement = await advertisementModel.create({
      userId,
      title,
      category,
      description,
      validFrom: fromDate,
      validUntil: untilDate,
      location,
      contact: parsedContact,
    });

    res.json({
      success: true,
      message: "Advertisement created successfully",
      advertisement,
    });
  } catch (error) {
    console.log("Error in addAdvertisement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get advertisements created by a specific user
const getMyAdvertisements = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming user is authenticated and ID is in `req.user`

    const advertisements = await advertisementModel
      .find({ userId })
      .sort({ postedDate: -1 });

    res.status(200).json({ success: true, advertisements });
  } catch (error) {
    console.error("Error fetching user's advertisements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get all active advertisements with user names
const getAllAdvertisementsWithUserNames = async (req, res) => {
  try {
    const currentDate = new Date();

    const advertisements = await advertisementModel
      .find({
        isActive: true,
        validFrom: { $lte: currentDate },
        validUntil: { $gte: currentDate },
      })
      .populate({
        path: "userId",
        select: "fullname", // Only fetch the fullname of the user
      })
      .sort({ postedDate: -1 });

    const formatted = advertisements.map((ad) => ({
      _id: ad._id,
      title: ad.title,
      category: ad.category,
      description: ad.description,
      validFrom: ad.validFrom,
      validUntil: ad.validUntil,
      location: ad.location,
      contact: ad.contact,
      postedDate: ad.postedDate,
      isActive: ad.isActive,
      userFullname: ad.userId?.fullname || "Unknown",
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching all advertisements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to send username via email
const sendUsernameEmail = async (email, username, fullname) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Username Recovery for SDPJSS",
      html: `
        <p>Dear ${fullname},</p>
        <p>As requested, we have retrieved your username for your SDPJSS account.</p>
        <p>Your username is: <strong>${username}</strong></p>
        <p>You can now use this username to log in or reset your password.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Username sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Username email sending failed:", error);
    return false;
  }
};
// NEW: API for Forgot Username
const forgotUsername = async (req, res) => {
  try {
    const {
      fullname: rawFullname,
      khandanid,
      fatherid,
      fatherName: rawFatherName,
      dob,
    } = req.body;

    // --- TRIMMED --- Trim the incoming lookup fields
    const fullname = rawFullname?.trim();
    const fatherName = rawFatherName?.trim();

    if (!fullname || !khandanid || !(fatherid || fatherName) || !dob) {
      return res.json({
        success: false,
        message: "All fields (Full Name, Khandan, Father, DOB) are required.",
      });
    } // Find the user based on the provided details

    const user = await userModel.findOne({
      fullname,
      khandanid,
      // fatherid,
      fatherName,
      dob: new Date(dob),
    });

    if (!user) {
      return res.json({
        success: false,
        message:
          "No user found with the provided details. Please check the information and try again.",
      });
    } // Check if user has an email

    const email = user.contact.email;
    if (!email) {
      return res.json({
        success: false,
        message:
          "User found, but no email is registered. Cannot send username automatically. Please contact support.",
      });
    } // Send the username to the user's email

    const emailSent = await sendUsernameEmail(
      email,
      user.username,
      user.fullname
    );

    if (emailSent) {
      res.json({
        success: true,
        message: `Your username has been sent to your registered email: ${email}`,
      });
    } else {
      res.json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error in forgotUsername:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// NEW: Send OTP for Login
const sendLoginOtp = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.json({ success: false, message: "Username is required." });
    }

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    const email = user.contact.email;
    if (!email) {
      return res.json({
        success: false,
        message: "No email registered for this account. Cannot login with OTP.",
      });
    } // Generate and save OTP

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min validity
    await user.save(); // Send OTP (reusing the forgot password OTP email function)

    await sendOtpEmail(email, otp, user.fullname);

    res.json({ success: true, message: "OTP sent to your registered email." });
  } catch (error) {
    console.error("Error sending login OTP:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// NEW: Login with OTP
const loginWithOtp = async (req, res) => {
  try {
    const { username: rawUsername, otp } = req.body;
    const username = rawUsername?.trim(); // --- TRIMMED ---

    if (!username || !otp) {
      return res.json({
        success: false,
        message: "Username and OTP are required.",
      });
    }

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    } // Verify OTP

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP." });
    } // OTP is valid, clear it

    user.otp = null;
    user.otpExpires = null;
    await user.save(); // Generate token and log in

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, utoken: token });
  } catch (error) {
    console.error("Error logging in with OTP:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// API to edit/update an advertisement
const editAdvertisement = async (req, res) => {
  try {
    const {
      adId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    } = req.body;

    console.log("Edit Req: ", req.body);
    console.log("Edit Data: ", {
      adId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    });

    // Check for required fields
    if (
      !adId ||
      !title ||
      !description ||
      !validFrom ||
      !validUntil ||
      !contact
    ) {
      return res.json({
        success: false,
        message: "Missing required advertisement fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (fromDate >= untilDate) {
      return res.json({
        success: false,
        message: "Valid Until date must be after Valid From date",
      });
    }

    const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(
      adId,
      {
        title,
        category,
        description,
        validFrom: fromDate,
        validUntil: untilDate,
        location,
        contact: parsedContact,
      },
      { new: true }
    );

    if (!updatedAdvertisement) {
      return res.json({
        success: false,
        message: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: "Advertisement updated successfully",
      advertisement: updatedAdvertisement,
    });
  } catch (error) {
    console.log("Error in editAdvertisement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete an advertisement
const deleteAdvertisement = async (req, res) => {
  try {
    console.log("Delete req: ", req.body);
    const { adId } = req.body;

    if (!adId) {
      return res.json({
        success: false,
        message: "Advertisement ID is required",
      });
    }

    const deletedAdvertisement = await advertisementModel.findByIdAndDelete(
      adId
    );

    if (!deletedAdvertisement) {
      return res.json({
        success: false,
        message: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteAdvertisement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to update advertisement status (active/inactive)
const updateAdvertisementStatus = async (req, res) => {
  try {
    const { adId, isActive } = req.body;
    console.log(req.body);
    console.log({ adId, isActive });

    if (!adId) {
      return res.json({
        success: false,
        message: "Advertisement ID is missing",
      });
    }

    var isActivated = isActive;
    if (typeof isActive !== "boolean") {
      if (isActive === "true") isActivated = true;
      else if (isActive === "false") isActivated = false;
      else {
        return res.json({
          success: false,
          message: "isActive must be boolean or true/false.",
        });
      }
    }

    const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(
      adId,
      { isActive: isActivated },
      { new: true }
    );

    if (!updatedAdvertisement) {
      return res.json({
        success: false,
        message: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: `Advertisement ${
        isActivated ? "activated" : "deactivated"
      } successfully`,
      advertisement: updatedAdvertisement,
    });
  } catch (error) {
    console.log("Error in updateAdvertisementStatus:", error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------------------------

// 1. Updated generateBillHTML function with fixed watermark and right-aligned values
const generateBillHTML = (donationData, userData) => {
  const {
    list,
    amount,
    method,
    courierCharge,
    transactionId,
    createdAt,
    _id,
    receiptId,
    postalAddress,
  } = donationData;

  const totalAmount = amount + courierCharge;
  const paymentStatus = method === "Online" ? "PAID ONLINE" : "PAID IN OFFICE";
  const paymentStatusColor = method === "Online" ? "#28a745" : "#4a6a04ff";

  var actualAddress = "";
  userData.address.room
    ? (actualAddress += "Room: " + userData.address.room + ", ")
    : (actualAddress += "");
  userData.address.floor
    ? (actualAddress += "Floor: " + userData.address.floor + ", ")
    : (actualAddress += "");
  userData.address.apartment
    ? (actualAddress += userData.address.apartment + ", ")
    : (actualAddress += "");
  userData.address.landmark
    ? (actualAddress += userData.address.landmark + ", ")
    : (actualAddress += "");
  userData.address.street
    ? (actualAddress += userData.address.street + ", ")
    : (actualAddress += "");
  userData.address.city
    ? (actualAddress += userData.address.city + ", ")
    : (actualAddress += "");
  userData.address.district
    ? (actualAddress += userData.address.district + ", ")
    : (actualAddress += "");
  userData.address.state
    ? (actualAddress += userData.address.state + ", ")
    : (actualAddress += "");
  userData.address.country
    ? (actualAddress += userData.address.country)
    : (actualAddress += "");
  userData.address.pin
    ? (actualAddress += " - " + userData.address.pin)
    : (actualAddress += "");

  // Convert total amount to words
  const amountInWords = numberToWords(totalAmount);

  // Helper function to format numbers in Indian style
  const formatIndianNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Donation Receipt</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
          position: relative;
          background-color: white;
        }
        
        /* Fixed watermark background */
        body::before {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          width: 60%;
          height: 60%;
          background-image: url('https://res.cloudinary.com/needlesscat/image/upload/v1754307740/logo_unr2rc.jpg');
          background-repeat: no-repeat;
          background-position: center center;
          background-size: contain;
          transform: translate(-50%, -50%);
          opacity: 0.1;
          z-index: 100;
          pointer-events: none;
        }
          
        
        .bill-container { 
          max-width: 800px; 
          margin: 0 auto; 
          border: 2px solid #ddd; 
          padding: 30px;
          background-color: rgba(255, 255, 255, 0.98);
          position: relative;
          z-index: 1;
        }
        .above-header { font-size: 12px; color: #666; margin-bottom: 10px; display: flex; justify-content: space-between }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .org-name { font-size: 24px; font-weight: bold; color: #d32f2f; margin-bottom: 5px; }
        .org-address { font-size: 10px; color: #666; }
        
        .org-contact-info { 
          font-size: 12px; 
          color: #666; 
          margin-top: 10px;
          line-height: 1.4;
        }
        
        .receipt-title { font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; color: #333; }
        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .receipt-number { font-weight: bold; }
        .date { font-weight: bold; }
        .donor-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .donor-info h3 { margin-top: 0; color: #333; }
        .table-container { margin: 20px 0; }
        .donation-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .donation-table th, .donation-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .donation-table th { background-color: #f8f9fa; font-weight: bold; }
        
        /* Right align specific columns */
        .donation-table th:nth-child(2),
        .donation-table th:nth-child(3),
        .donation-table th:nth-child(4),
        .donation-table th:nth-child(5),
        .donation-table td:nth-child(2),
        .donation-table td:nth-child(3),
        .donation-table td:nth-child(4),
        .donation-table td:nth-child(5) {
          text-align: right;
        }
        
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        
        .amount-in-words {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #d32f2f;
        }
        
        .payment-info { display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-top: 20px; }
        .payment-method { font-weight: bold; }
        .payment-status { padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }
        .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; }
        .transaction-id { font-size: 12px; color: #666; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <div class="above-header">
          <div><b>Estd. 1939</b></div>
          <div><b>Reg. No. 2020/272</b></div>
        </div>
        <div class="header">
          <div class="org-name">SHREE DURGAJI PATWAY JATI SUDHAR SAMITI</div>
          <div class="org-address">Shree Durga Sthan, Patwatoli, Manpur, P.O. Buniyadganj, Gaya Ji - 823003</div>
          <div class="org-contact-info">
            <div><strong>PAN:</strong> ABBTS1301C</div>
            <div><strong>Contact:</strong> 0631 2952160, +91 9472030916 | <strong>Email:</strong> sdpjssmanpur@gmail.com</div>
          </div>
        </div>

        <div class="receipt-title">DONATION RECEIPT</div>

        <div class="receipt-info">
          <div class="receipt-number">Receipt No: ${
            receiptId || _id.toString().slice(-8).toUpperCase()
          }</div>
          <div class="date">Date: ${new Date(createdAt).toLocaleDateString(
            "en-IN"
          )}</div>
        </div>

        <div class="donor-info">
          <h3>Donor Information</h3>
          <p><strong>Name:</strong> ${userData.fullname}</p>
          <p><strong>Father:</strong> ${userData.fatherName}</p>
          <p><strong>Contact:</strong> ${userData.contact.email || ""} ${
    userData.contact.email && userData.contact.mobileno.number !== "0000000000"
      ? "|"
      : ""
  } ${
    userData.contact.mobileno.number !== "0000000000"
      ? `${userData.contact.mobileno.code} ${userData.contact.mobileno.number}`
      : ""
  }</p>
          <p><strong>Address:</strong> ${
            postalAddress === "Will collect from Durga Sthan"
              ? actualAddress
              : postalAddress
          }</p>
        </div>

        <div class="table-container">
          <table class="donation-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Amount (₹)</th>
                <th>Weight (g)</th>
                <th>Packet</th>
              </tr>
            </thead>
            <tbody>
              ${list
                .map(
                  (item) => `
                <tr>
                  <td>${item.category}</td>
                  <td>${formatIndianNumber(item.number)}</td>
                  <td>₹${formatIndianNumber(item.amount)}</td>
                  <td>${formatIndianNumber(item.quantity)}</td>
                  <td>${item.isPacket ? 1 : 0}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <td><strong>Courier Charges</strong></td>
                <td>-</td>
                <td><strong>₹${formatIndianNumber(courierCharge)}</strong></td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr class="total-row">
                <td><strong>TOTAL AMOUNT</strong></td>
                <td>-</td>
                <td><strong>₹${formatIndianNumber(totalAmount)}</strong></td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="amount-in-words">
          <strong>Amount in Words:</strong> ${amountInWords} Rupees Only
        </div>

        <div class="payment-info">
          <div class="payment-method">Payment Method: ${method}</div>
          <div class="payment-status" style="background-color: ${paymentStatusColor};">${paymentStatus}</div>
        </div>

        <div class="transaction-id">Transaction ID: ${
          transactionId || "N/A"
        }</div>

        <div class="footer">
          <p>Thank you for your generous donation!</p>
          <p>For any queries, please contact us at: Durga Asthan, Manpur, Gaya, Bihar, India - 823003</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendDonationReceiptEmail = async (email, donationData, userData) => {
  try {
    // Generate HTML bill
    const billHTML = generateBillHTML(donationData, userData);

    // Generate PDF using Puppeteer
    const options = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    }; // Define the file object with the HTML content
    const file = { content: billHTML }; // Generate PDF buffer using html-pdf-node

    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const receiptNumber =
      donationData.receiptId ||
      donationData._id.toString().slice(-8).toUpperCase();
    const paymentStatus =
      donationData.method === "Online" ? "PAID" : "TO BE PAID IN OFFICE";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Donation Receipt - SDPJSS - ${receiptNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Thank you for your donation!</h2>
          <p>Dear ${userData.fullname},</p>
          <p>We have received your donation. Please find your receipt below attached as PDF.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Quick Summary:</h3>
            <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
            <p><strong>Total Amount:</strong> ₹${
              donationData.amount + donationData.courierCharge
            }</p>
            <p><strong>Payment Method:</strong> ${donationData.method}</p>
            <p><strong>Status:</strong> <span style="color: ${
              donationData.method === "Online" ? "#28a745" : "#ffc107"
            }; font-weight: bold;">${paymentStatus}</span></p>
          </div>
          
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
            <p>Best regards,<br>
            <strong>SDPJSS Team</strong><br>
            Shree Durga Ji Patway Jati Sudhar Samiti<br>
            Durga Asthan, Manpur, Gaya, Bihar, India - 823003</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `SDPJSS_Receipt_${receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Donation receipt email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Receipt email sending failed:", error);
    return false;
  }
};

/**
 * Generates a unique receipt ID based on the donation method and year.
 * Format: SD[Method_Code][YY][IncrementingNumber]
 * Method Codes: C for Cash, O for Online
 * Example: SDC250000001
 */
const generateReceiptId = async (method) => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // '25' for 2025
  let methodCode = "";
  if (method === "Cash") {
    methodCode = "C";
  } else if (method === "Online") {
    methodCode = "O";
  } else {
    // You might want to handle other methods like 'QR' if they are introduced
    methodCode = "X"; // Default or error code
  }

  const prefix = `SD${methodCode}${currentYear}`;

  try {
    const lastDonation = await donationModel
      .findOne({ receiptId: { $regex: `^${prefix}` } }, { receiptId: 1 })
      .sort({ receiptId: -1 })
      .limit(1);

    let nextNumber = 1;
    if (lastDonation && lastDonation.receiptId) {
      const lastNumberString = lastDonation.receiptId.substring(prefix.length);
      const lastNumber = parseInt(lastNumberString, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const paddedNumber = nextNumber.toString().padStart(5, "0"); // 7 digits for auto-increment
    return `${prefix}${paddedNumber}`;
  } catch (error) {
    console.error("Error generating receipt ID:", error);
    // Fallback or throw an error based on your application's error handling strategy
    throw new Error("Failed to generate unique receipt ID.");
  }
};

// API to create a donation order (initiate payment)
const createDonationOrder = async (req, res) => {
  try {
    const {
      userId,
      list,
      amount,
      method,
      courierCharge,
      remarks,
      postalAddress,
    } = req.body;
    console.log("Create Donation Request: ", req.body);

    if (
      !userId ||
      !list ||
      !amount ||
      !method ||
      courierCharge === undefined ||
      !postalAddress
    ) {
      return res.json({
        success: false,
        message: "Missing required donation fields",
      });
    }
    if (amount <= 0) {
      return res.json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }
    if (!["Cash", "Online"].includes(method)) {
      return res.json({ success: false, message: "Invalid payment method" });
    }

    // In createDonationOrder function, for cash donations, after creating donation:

    if (method === "Cash") {
      const receiptId = await generateReceiptId(method); // Generate receipt ID for cash
      const donation = await donationModel.create({
        userId,
        list,
        amount,
        method,
        courierCharge,
        remarks,
        transactionId: `CASH_${Date.now()}`,
        paymentStatus: "completed",
        postalAddress,
        receiptId, // Add the generated receiptId
      });

      // Get user data and send email
      const userData = await userModel.findById(userId);
      console.log(userData);
      if (userData && userData.contact.email) {
        await sendDonationReceiptEmail(
          userData.contact.email,
          donation,
          userData
        );
      }

      return res.json({
        success: true,
        message: "Cash donation recorded and receipt sent",
        donation,
        paymentRequired: false,
      });
    }

    // For online payments:
    // 1. Create a Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise, rounded to avoid float issues
      currency: process.env.CURRENCY || "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { userId, postalAddress },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // 2. Create the donation record in your DB with 'pending' status
    const tempDonation = await donationModel.create({
      userId,
      list,
      amount,
      method,
      courierCharge,
      remarks,
      razorpayOrderId: razorpayOrder.id, // Store Razorpay order ID
      paymentStatus: "pending",
      postalAddress,
      // receiptId is NOT generated here, as payment is pending
    });

    res.json({
      success: true,
      message: "Donation order created successfully",
      order: razorpayOrder,
      donationId: tempDonation._id, // Send your internal donationId to frontend
      paymentRequired: true,
    });
  } catch (error) {
    console.log("Error in createDonationOrder:", error);
    res.json({
      success: false,
      message: "Failed to create order. See server logs.",
    });
  }
};

// API to verify Razorpay payment and update donation
const verifyDonationPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId, // Your internal donation ID
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !donationId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment verification data" });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // If signature is invalid, mark payment as failed
      await donationModel.findByIdAndUpdate(donationId, {
        paymentStatus: "failed",
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    }

    // If signature is valid, generate receipt ID for online payment
    const donationToUpdate = await donationModel.findById(donationId);
    if (!donationToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Donation record not found" });
    }

    const receiptId = await generateReceiptId("Online"); // Generate receipt ID for online payment

    // Update the donation record
    const updatedDonation = await donationModel
      .findByIdAndUpdate(
        donationId,
        {
          transactionId: razorpay_payment_id,
          paymentStatus: "completed",
          $unset: { razorpayOrderId: 1 }, // Remove temporary order ID
          receiptId, // Add the generated receiptId
        },
        { new: true }
      )
      .populate("userId", "fullname contact");

    if (!updatedDonation) {
      return res.status(404).json({
        success: false,
        message: "Donation record not found after update",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully!",
      donation: updatedDonation,
    });

    // Get user data for email
    const userData = await userModel.findById(updatedDonation.userId);

    // Send confirmation email with receipt
    if (userData && userData.contact.email) {
      const emailSent = await sendDonationReceiptEmail(
        userData.contact.email,
        updatedDonation,
        userData
      );

      if (emailSent) {
        console.log("Donation receipt email sent successfully");
      } else {
        console.log("Failed to send donation receipt email");
      }
    }
  } catch (error) {
    console.log("Error in verifyDonationPayment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during payment verification.",
    });
  }
};
// API to get donations by user
const getUserDonations = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required",
      });
    }

    const donations = await donationModel
      .find({ userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.log("Error in getUserDonations:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all donations (admin function)
const getAllDonations = async (req, res) => {
  try {
    const donations = await donationModel
      .find()
      .populate("userId", "fullname email contact")
      .sort({ createdAt: -1 });

    // Calculate total donations (only completed ones)
    const completedDonations = donations.filter(
      (d) => d.paymentStatus === "completed"
    );
    const totalAmount = completedDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );

    res.json({
      success: true,
      donations,
      totalAmount,
      totalCount: donations.length,
      completedCount: completedDonations.length,
    });
  } catch (error) {
    console.log("Error in getAllDonations:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get donation statistics
const getDonationStats = async (req, res) => {
  try {
    // Total donations (only completed)
    const totalDonations = await donationModel.countDocuments({
      paymentStatus: "completed",
    });
    const totalAmount = await donationModel.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Donations by purpose (only completed)
    const donationsByPurpose = await donationModel.aggregate([
      { $match: { paymentStatus: "completed" } },
      {
        $group: {
          _id: "$purpose",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Donations by method (only completed)
    const donationsByMethod = await donationModel.aggregate([
      { $match: { paymentStatus: "completed" } },
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Donations by status
    const donationsByStatus = await donationModel.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent donations (last 30 days, only completed)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDonations = await donationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalDonations,
        totalAmount: totalAmount[0]?.total || 0,
        donationsByPurpose,
        donationsByMethod,
        donationsByStatus,
        recentDonations: recentDonations[0] || { count: 0, totalAmount: 0 },
      },
    });
  } catch (error) {
    console.log("Error in getDonationStats:", error);
    res.json({ success: false, message: error.message });
  }
};

// Function to send OTP email
const sendOtpEmail = async (email, otp, fullname) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP for Your Account",
      html: `
        <p>Dear ${fullname},</p>
        <p>You have requested to reset your password. Your One-Time Password (OTP) is:</p>
        <h2><b>${otp}</b></h2>
        <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("OTP email sending failed:", error);
    return false;
  }
};

// MODIFIED: forgotPassword to use username
const forgotPassword = async (req, res) => {
  try {
    const { username: rawUsername } = req.body;
    const username = rawUsername?.trim(); // --- TRIMMED ---

    if (!username) {
      return res.json({
        success: false,
        message: "Please enter your username.",
      });
    }

    const user = await userModel.findOne({ username });

    if (!user) {
      return res.json({
        success: false,
        message: "User with this username does not exist.",
      });
    }
    const email = user.contact.email;
    if (!email) {
      return res.json({
        success: false,
        message:
          "No email is registered for this account. Cannot reset password.",
      });
    }
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP to user's email
    const emailSent = await sendOtpEmail(email, otp, user.fullname);

    if (emailSent) {
      res.json({
        success: true,
        message: "OTP sent to your registered email. Please check your inbox.",
      });
    } else {
      res.json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// MODIFIED: verifyOtp to use username
const verifyOtp = async (req, res) => {
  try {
    const { username: rawUsername, otp } = req.body;
    const username = rawUsername?.trim(); // --- TRIMMED ---

    if (!username || !otp) {
      return res.json({
        success: false,
        message: "Username and OTP are required.",
      });
    }

    const user = await userModel.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.json({
        success: false,
        message: "OTP has expired or is invalid. Please request a new one.",
      });
    }

    // Clear OTP fields after successful verification
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// MODIFIED: resetPassword to use username
const resetPassword = async (req, res) => {
  try {
    const { username: rawUsername, otp, newPassword } = req.body;
    const username = rawUsername?.trim(); // --- TRIMMED ---

    if (!username || !newPassword) {
      return res.json({
        success: false,
        message: "Username and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const user = await userModel.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedNewPassword;
    await user.save();

    const email = user.contact.email;
    if (email) {
      await sendPasswordResetConfirmationEmail(email, user.fullname);
    }
    res.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Function to send password reset confirmation email
const sendPasswordResetConfirmationEmail = async (email, fullname) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Has Been Reset",
      html: `
        <p>Dear ${fullname},</p>
        <p>This is to confirm that your password for your account has been successfully reset.</p>
        <p>If you did not make this change, please contact us immediately.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Password reset confirmation email sending failed:", error);
    return false;
  }
};

// List features specifically for the user portal
const listUserFeatures = async (req, res) => {
  try {
    // Find features that are specifically for 'user' access and are 'active'
    const features = await featureModel.find({
      access: "user",
      isActive: true,
    });
    res.json({ success: true, data: features });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching features" });
  }
};

// Update the export statement to include the new functions
export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  changePassword,
  createJobOpening,
  getJobOpeningsByUser,
  getAllJobOpeningsWithUserNames,
  editJobOpening,
  deleteJobOpening,
  updateJobStatus,
  createStaffRequirement,
  getStaffRequirementsByUser,
  getAllStaffRequirementsWithUserNames,
  editStaffRequirement,
  deleteStaffRequirement,
  updateStaffStatus,
  addAdvertisement,
  getMyAdvertisements,
  getAllAdvertisementsWithUserNames,
  editAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus,
  // Make Donations
  createDonationOrder,
  verifyDonationPayment,
  getUserDonations,
  getAllDonations,
  getDonationStats,
  getUsersByKhandan,
  //Forget Password
  forgotPassword,
  verifyOtp,
  resetPassword,
  forgotUsername,
  sendLoginOtp,
  loginWithOtp,
  listUserFeatures,
};
