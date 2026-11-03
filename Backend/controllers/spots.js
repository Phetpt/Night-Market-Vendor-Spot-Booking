const Spot = require("../models/Spot");

const parseSpotInput = ({ spotNumber, zone, spotSize, locationDescription, rentalFee }) => {
  const fields = { spotNumber, zone, spotSize, locationDescription };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== "string" || !value.trim()) {
      return { error: `${key} must be a nonempty string` };
    }
    fields[key] = value.trim();
  }
  if (typeof rentalFee !== "number" || !Number.isFinite(rentalFee) || rentalFee < 0) {
    return { error: "Rental fee must be a nonnegative number" };
  }
  return { ...fields, rentalFee };
};

exports.getSpots = async (req, res, next) => {
  try {
    const spots = await Spot.find({ isActive: true }).sort({ zone: 1, spotNumber: 1 });
    res.status(200).json({ success: true, count: spots.length, data: spots });
  } catch (error) {
    next(error);
  }
};

exports.getSpot = async (req, res, next) => {
  try {
    const spot = await Spot.findOne({ _id: req.params.id, isActive: true });
    if (!spot) return res.status(404).json({ success: false, error: "Vendor spot not found" });
    res.status(200).json({ success: true, data: spot });
  } catch (error) {
    next(error);
  }
};

exports.createSpot = async (req, res, next) => {
  try {
    const parsed = parseSpotInput(req.body);
    if (parsed.error) return res.status(400).json({ success: false, error: parsed.error });
    const spot = await Spot.create(parsed);
    res.status(201).json({ success: true, data: spot });
  } catch (error) {
    next(error);
  }
};

exports.updateSpot = async (req, res, next) => {
  try {
    const spot = await Spot.findOne({ _id: req.params.id, isActive: true });
    if (!spot) return res.status(404).json({ success: false, error: "Vendor spot not found" });
    const fields = {};
    for (const field of ["spotNumber", "zone", "spotSize", "locationDescription", "rentalFee"]) {
      fields[field] = req.body[field] === undefined ? spot[field] : req.body[field];
    }
    const parsed = parseSpotInput(fields);
    if (parsed.error) return res.status(400).json({ success: false, error: parsed.error });
    const updated = await Spot.findOneAndUpdate(
      { _id: spot.id, isActive: true }, parsed, { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: "Vendor spot not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteSpot = async (req, res, next) => {
  try {
    const spot = await Spot.findOneAndUpdate(
      { _id: req.params.id, isActive: true }, { isActive: false }, { new: true }
    );
    if (!spot) return res.status(404).json({ success: false, error: "Vendor spot not found" });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
