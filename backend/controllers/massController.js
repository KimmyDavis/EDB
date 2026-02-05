import { Mass } from "../models/massModel.js";
import mongoose from "mongoose";

/*
createMass
method: POST
does: creates a new mass in the mass database
receives: mass data in request body
returns: the created mass, or an error message in case of failure.
*/
const createMass = async (req, res) => {
  const { title, date } = req.body;
  if (!title || !date) {
    return res
      .status(400)
      .json({ message: "title and date fields are required." });
  }
  const newMass = await Mass.create(req.body);
  if (!newMass)
    return res.status(500).json({
      message: "Failed to add Mass to the database. Check your entries.",
    });
  return res
    .status(201)
    .json({ message: "Mass created successfully.", mass: newMass });
};

/*
queryMass
method: GET
does: queries the mass database based on the given parameters
receives: the parameters in the request query string
returns: a list of mass matching the query criterion
*/
const queryMass = async (req, res) => {
  const { id, title, date, code } = req.query;
  if (id && id !== "undefined") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Please provide a valid id." });
    }
    const mass = await Mass.findById(id)
      .populate({
        path: [
          "entrance.songId",
          "kyrie.songId",
          "gloria.songId",
          "acclamation.songId",
          "creed.songId",
          "petition.songId",
          "LordsPrayer.songId",
          "offertory.songId",
          "sanctus.songId",
          "peace.songId",
          "agnusDei.songId",
          "holyCommunion.songId",
          "thanksgiving.songId",
          "exit.songId",
        ],
      })
      .lean();
    if (!mass) {
      return res
        .status(404)
        .json({ message: "No mass matches the provided id." });
    }
    return res.status(200).json({ mass: [mass] });
  }
  const query = {};
  if (date && date !== "undefined") query["date"] = date;
  if (title && title !== "undefined") query["title"] = title;
  if (code && code !== "undefined") query["code"] = code;
  const mass = await Mass.find(query)
    .populate({
      path: [
        "entrance.songId",
        "kyrie.songId",
        "gloria.songId",
        "acclamation.songId",
        "creed.songId",
        "petition.songId",
        "LordsPrayer.songId",
        "offertory.songId",
        "sanctus.songId",
        "peace.songId",
        "agnusDei.songId",
        "holyCommunion.songId",
        "thanksgiving.songId",
        "exit.songId",
      ],
    })
    .lean();
  if (!mass?.length) {
    return res.status(404).json({ message: "No mass matches your query." });
  }
  res.status(200).json({ mass });
};

/*
editMass
method: PATCH
does: edits the fields specified with the corresponding values given
receives: the fields to edit with their values in the request body. with the id being mandatory and atleast one other field.
returns: the edited mass 
*/
const editMass = async (req, res) => {
  const { id } = req.body;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Check the id. It is either missing or invalid." });
  }
  if (Object.keys(req.body) <= 1) {
    return res
      .status(400)
      .json({ message: "Please provide atleast one field to edit." });
  }
  const updated = await Mass.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) {
    return res
      .status(404)
      .json({ message: "No mass id matches the one provided." });
  }
  res
    .status(200)
    .json({ mass: updated, message: "Mass successfully updated." });
};

export default { createMass, queryMass, editMass };
