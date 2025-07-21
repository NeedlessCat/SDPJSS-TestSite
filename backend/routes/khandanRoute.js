import express from "express";
import {
  getAllKhandans,
  getKhandanById,
  createKhandan,
  updateKhandan,
  deleteKhandan,
} from "../controllers/khandanController.js";

const khandanRouter = express.Router();

// Public routes (no authentication required)
khandanRouter.get("/allKhandan", getAllKhandans);
khandanRouter.get("/get-khandan/:khandanId", getKhandanById);

// Admin routes (you can add authentication middleware here)
khandanRouter.post("/add-khandan", createKhandan);
khandanRouter.put("/update-khandan/:khandanId", updateKhandan);
khandanRouter.delete("/delete-khandan/:khandanId", deleteKhandan);

export default khandanRouter;
