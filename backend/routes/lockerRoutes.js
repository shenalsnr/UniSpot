import express from "express";
import { createMap, getMaps, updateMap, deleteMap } from "../controllers/LockerController.js";

const router = express.Router();

router.post("/create-map", createMap);
router.get("/maps", getMaps);
router.put("/update-map/:id", updateMap);
router.delete("/delete-map/:id", deleteMap);

export default router;
