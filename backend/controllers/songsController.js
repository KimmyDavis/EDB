import { Song } from "../models/songsModel.js";
import mongoose from "mongoose";

/*
createSong
method: POST
does: creates a new song in the songs database
receives: song data in request body
returns: the created song, or an error message in case of failure.
*/
const createSong = async (req, res) => {
  const { title, service, section, category, verses, chorus, bridge, links } =
    req.body;
  if ((!title, !service, !verses?.length)) {
    return res.status(400).json({
      message:
        "either title is missing, you didn't specify the service, or you didn't provide any verse.",
    });
  }
  if (["catholic", "both"].includes(service) && !section) {
    return res.status(400).json({
      message: "you have to provide a mass section for a catholic song.",
    });
  }
  if (["evangelical", "both"].includes(service) && !category) {
    return res.status(400).json({
      message:
        "you have to provide a category for an evangelical service song.",
    });
  }
  const song = { title, service, verses };
  if (section) song["section"] = section;
  if (category) song["category"] = category;
  if (chorus) song["chorus"] = chorus;
  if (bridge) song["bridge"] = bridge;
  if (links) song["links"] = section;
  const created = await Song.create(song);
  if (!created) {
    return res.status(500).json({
      message:
        "Failed to add the song to the database. This is an internal error, consult the developer.",
    });
  }
  res.status(201).json({ message: "Song successfully added.", song: created });
};

/*
querySongs
method: POST
does: queries the song database based on the given parameters
receives: the parameters in the request query string
returns: a list of songs matching the query criterion
*/
const querySongs = async (req, res) => {
  const { id, service, section, category, title, code } = req.query;
  if (id && id !== "undefined") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Please provide a valid id." });
    }
    const song = await Song.findById(id);
    if (!song) {
      return res
        .status(404)
        .json({ message: "No song matches the provided id." });
    }
    return res.status(200).json({ songs: [song] });
  }
  const query = [];
  if (service && service === "undefined") query["service"] = service;
  if (section && section === "undefined") query["section"] = section;
  if (category && category === "undefined") query["category"] = category;
  if (title && title === "undefined") query["title"] = title;
  if (code && code === "undefined") query["code"] = code;
  const songs = await Song.find(query).lean();
  if (!songs?.length) {
    return res.status(404).json({ message: "No song matches your query." });
  }
  res.status(200).json({ songs });
};

/*
editSong
method: PATCH
does: edits the fields specified with the corresponding values given
receives: the fields to edit with their values in the request body. with the id being mandatory and atleast one other field.
returns: the edited song 
*/
const editSong = async (req, res) => {
  const { id } = req.body;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Check the song id. It is either missing or invalid." });
  }
  if (Object.keys(req.body) <= 1) {
    return res
      .status(400)
      .json({ message: "Please provide atleast one field to edit." });
  }
  const updated = await Song.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) {
    return res
      .status(404)
      .json({ message: "No song id matches the one provided." });
  }
  res.status(200).json({ song: updated });
};

export default { createSong, querySongs, editSong };
