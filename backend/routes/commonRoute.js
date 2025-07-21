import express from "express";
import upload from "../middlewares/multer.js";
import {
  getAllAdvertisementsWithUserNames,
  getAllJobOpeningsWithUserNames,
  getAllStaffRequirementsWithUserNames,
} from "../controllers/userController.js";
import { getNoticeList } from "../controllers/adminController.js";
import { getTeamMembers } from "../controllers/teamController.js";

const commonRouter = express.Router();

commonRouter.get("/get-staffs", getAllStaffRequirementsWithUserNames);
commonRouter.get("/get-advertisements", getAllAdvertisementsWithUserNames);
commonRouter.get("/get-jobs", getAllJobOpeningsWithUserNames);
// ---------------------------
// Notice routes
commonRouter.get("/notice-list", getNoticeList);
commonRouter.get("/get-team-members", getTeamMembers);
export default commonRouter;
