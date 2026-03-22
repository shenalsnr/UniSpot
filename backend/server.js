import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import LockerMap from "./models/LockerM/LockerMap.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple Route
app.get("/", (req, res) => {
  res.send("API is running...");
});



// Connect Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));



  //create Map

    app.post("/create-map", async (req, res) => {
  const newMap = new LockerMap(req.body);
  await newMap.save();
  res.json(newMap);
});

//Get All Maps

app.get("/maps", async (req, res) => {
  const maps = await LockerMap.find();
  res.json(maps);
});

//Update Map

app.put("/update-map/:id", async (req, res) => {
  const updated = await LockerMap.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});


//Delete Map

app.delete("/delete-map/:id", async (req, res) => {
  await LockerMap.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});




// Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



