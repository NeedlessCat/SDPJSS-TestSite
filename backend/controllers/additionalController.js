import validator from "validator";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";

// Import your models
import userModel from "../models/UserModel.js";
import guestUserModel from "../models/GuestUserModel.js";
import donationModel from "../models/DonationModel.js";
import guestDonationModel from "../models/GuestDonationModel.js";

// HELPER FUNCTIONS (Unchanged)
//================================================================

/**
 * Generates a unique ID for a guest user in the format GAAA0001.
 */
const generateGuestId = async () => {
  try {
    const lastGuest = await guestUserModel
      .findOne({}, { id: 1 })
      .sort({ id: -1 })
      .limit(1);

    if (!lastGuest || !lastGuest.id) {
      return "GAAA0001";
    }

    const lastId = lastGuest.id;
    const prefix = lastId.substring(0, 1); // 'G'
    let letters = lastId.substring(1, 4); // 'AAA'
    let number = parseInt(lastId.substring(4), 10); // 0001

    if (number < 9999) {
      const newNumber = (number + 1).toString().padStart(4, "0");
      return `${prefix}${letters}${newNumber}`;
    }

    // Increment letters if number reaches 9999
    let letterArray = letters.split("");
    for (let i = letterArray.length - 1; i >= 0; i--) {
      if (letterArray[i] !== "Z") {
        letterArray[i] = String.fromCharCode(letterArray[i].charCodeAt(0) + 1);
        break;
      } else {
        letterArray[i] = "A";
      }
    }
    const newLetters = letterArray.join("");
    return `${prefix}${newLetters}0001`;
  } catch (error) {
    console.error("Error generating guest ID:", error);
    return `GUEST_ID_ERROR_${Date.now()}`; // Fallback
  }
};

/**
 * Generates a unique receipt ID for a guest donation.
 * Format: SDG[Method_Code][YY][IncrementingNumber]
 * Example: SDGC250000001 (Guest, Cash, 2025)
 * Example: SDGQ250000001 (Guest, QR Code, 2025)
 */
const generateGuestReceiptId = async (method) => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // '25'
  let methodCode;

  switch (method) {
    case "Cash":
      methodCode = "C";
      break;
    case "QR Code":
      methodCode = "Q";
      break;
    default:
      methodCode = "X";
  }

  const prefix = `SD${methodCode}${currentYear}`; // Added 'G' for Guest

  try {
    const lastDonation = await guestDonationModel
      .findOne({ receiptId: { $regex: `^${prefix}` } }, { receiptId: 1 })
      .sort({ receiptId: -1 })
      .limit(1);

    let nextNumber = 1;
    if (lastDonation?.receiptId) {
      const lastNumberString = lastDonation.receiptId.substring(prefix.length);
      const lastNumber = parseInt(lastNumberString, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const paddedNumber = nextNumber.toString().padStart(7, "0"); // Padded to 7 digits
    return `${prefix}${paddedNumber}`;
  } catch (error) {
    console.error("Error generating guest receipt ID:", error);
    throw new Error("Failed to generate unique guest receipt ID.");
  }
};

// CONTROLLER FUNCTIONS (Updated)
//================================================================

/**
 * @description Records a guest donation for 'Cash' or 'QR Code' methods.
 * @route POST /api/additional/record-guest-donation
 */
const recordGuestDonation = async (req, res) => {
  try {
    const { donorInfo, list, method, remarks } = req.body;

    // --- Validation ---
    if (!donorInfo || !list || !method) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    if (!donorInfo.fullname || !donorInfo.father || !donorInfo.mobile) {
      return res.status(400).json({
        success: false,
        message:
          "Fullname, Father's name and Mobile are required for the donor.",
      });
    }
    if (!/^\d{10}$/.test(donorInfo.mobile)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number format." });
    }

    const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
    if (totalAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Donation amount must be positive." });
    }

    // --- Handle 'Cash' and 'QR Code' donations ---
    if (method === "Cash" || method === "QR Code") {
      // --- Find or Create Guest User ---
      let guest = await guestUserModel.findOne({
        "contact.mobileno.number": donorInfo.mobile,
      });

      if (!guest) {
        const guestId = await generateGuestId();
        guest = new guestUserModel({
          id: guestId,
          fullname: donorInfo.fullname,
          father: donorInfo.father,
          username: "username" + Date.now(), // Fallback username
          contact: {
            mobileno: {
              code: donorInfo.code || "+91",
              number: donorInfo.mobile,
            },
          },
          address: {
            street: donorInfo.address?.street || "N/A",
            city: donorInfo.address?.city || "N/A",
            state: donorInfo.address?.state || "N/A",
            pin: donorInfo.address?.pin || "N/A",
            country: donorInfo.address?.country || "India",
          },
        });
        await guest.save();
      }

      // --- Create Donation Record ---
      const receiptId = await generateGuestReceiptId(method);
      const newDonation = new guestDonationModel({
        guestId: guest._id,
        list,
        amount: totalAmount,
        method,
        remarks,
        receiptId,
        // Using a generic transactionId for manual entries
        transactionId: `${method
          .replace(" ", "_")
          .toUpperCase()}_${Date.now()}`,
      });
      const savedDonation = await newDonation.save();

      return res.status(200).json({
        success: true,
        message: `${method} donation recorded successfully.`,
        data: { donationData: savedDonation, guestData: guest },
      });
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method. Only 'Cash' or 'QR Code' are accepted.",
      });
    }
  } catch (error) {
    console.error("Error recording guest donation:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to record donation. " + error.message,
      });
    }
  }
};

/**
 * @description Get all donations from both registered and guest users, combined and sorted.
 * @route GET /api/additional/all-donations
 */
const getAllDonationsCombined = async (req, res) => {
  try {
    const allDonations = await donationModel.aggregate([
      // Stage 1: Process registered user donations
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "donorDetails",
        },
      },
      { $unwind: "$donorDetails" },
      {
        $project: {
          _id: 1,
          receiptId: 1,
          amount: 1,
          method: 1,
          paymentStatus: 1,
          createdAt: 1,
          donorName: "$donorDetails.fullname",
          donorId: "$donorDetails.id",
          donorType: "Registered",
        },
      },
      // Stage 2: Union with guest donations
      {
        $unionWith: {
          coll: "guestdonations",
          pipeline: [
            {
              $lookup: {
                from: "guestusers",
                localField: "guestId",
                foreignField: "_id",
                as: "donorDetails",
              },
            },
            { $unwind: "$donorDetails" },
            {
              $project: {
                _id: 1,
                receiptId: 1,
                amount: 1,
                method: 1,
                // Guest donations are always considered 'completed' upon creation
                paymentStatus: { $literal: "completed" },
                createdAt: 1,
                donorName: "$donorDetails.fullname",
                donorId: "$donorDetails.id",
                donorType: "Guest",
              },
            },
          ],
        },
      },
      // Stage 3: Sort the combined result
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({
      success: true,
      donations: allDonations,
      count: allDonations.length,
    });
  } catch (error) {
    console.error("Error fetching all donations:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @description Get all guest users.
 * @route GET /api/additional/all-guest-users
 */
const getAllGuestUsers = async (req, res) => {
  try {
    const allGuestUsers = await guestUserModel.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      guestUsers: allGuestUsers,
      count: allGuestUsers.length,
    });
  } catch (error) {
    console.error("Error fetching all guest users:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @description Get the last 2 donations for a specific guest user by their MongoDB _id.
 * @route GET /api/additional/guest-donations/:guestId
 */
const getGuestDonationsById = async (req, res) => {
  try {
    const { guestId } = req.params;

    // Validate the provided ID
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid guest ID format." });
    }

    const donations = await guestDonationModel
      .find({ guestId: guestId })
      .sort({ createdAt: -1 }) // Get the most recent ones first
      .limit(2) // Limit to the last 2
      .select("createdAt list amount"); // Select only the fields we need

    if (!donations) {
      return res.json({ success: true, donations: [] }); // Send empty array if none found
    }

    res.json({
      success: true,
      donations: donations,
    });
  } catch (error) {
    console.error("Error fetching guest donations by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching donations.",
    });
  }
};

export {
  recordGuestDonation,
  getAllDonationsCombined,
  getAllGuestUsers,
  getGuestDonationsById,
};
