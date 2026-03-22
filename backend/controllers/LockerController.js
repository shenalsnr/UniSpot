import LockerMap from "../models/LockerModel.js";

// Create Map
export const createMap = async (req, res, next) => {
  try {
    const newMap = new LockerMap(req.body);
    await newMap.save();
    res.json(newMap);
  } catch (error) {
    next(error);
  }
};

// Get All Maps
export const getMaps = async (req, res, next) => {
  try {
    const maps = await LockerMap.find();
    res.json(maps);
  } catch (error) {
    next(error);
  }
};

// Update Map
export const updateMap = async (req, res, next) => {
  try {
    const updated = await LockerMap.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete Map
export const deleteMap = async (req, res, next) => {
  try {
    await LockerMap.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
