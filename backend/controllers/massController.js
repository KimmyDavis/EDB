import { Mass } from "../models/massModel.js";
import { Song } from "../models/songsModel.js";
import { orderOfMass, fullOrderOfMass } from "../utils/orderOfMass.js";
import mongoose from "mongoose";

const SONG_SECTION_FIELDS = [
  "entrance",
  "kyrie",
  "gloria",
  "acclamation",
  "creed",
  "petition",
  "LordsPrayer",
  "offertory",
  "sanctus",
  "peace",
  "agnusDei",
  "holyCommunion",
  "thanksgiving",
  "exit",
];

const sanitizeSongSection = (section) => {
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    return section;
  }

  const sanitized = { ...section };

  if (typeof sanitized.songId === "string") {
    const trimmedSongId = sanitized.songId.trim();
    if (trimmedSongId === "") {
      delete sanitized.songId;
    } else if (!mongoose.Types.ObjectId.isValid(trimmedSongId)) {
      throw new Error(`Invalid songId: ${trimmedSongId}`);
    } else {
      sanitized.songId = trimmedSongId;
    }
  }

  return sanitized;
};

const sanitizeMassPayload = (payload) => {
  const sanitized = { ...payload };

  SONG_SECTION_FIELDS.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = sanitizeSongSection(sanitized[field]);
    }
  });

  if (Array.isArray(sanitized.customOrder)) {
    sanitized.customOrder = sanitized.customOrder.map((section) =>
      sanitizeSongSection(section),
    );
  }

  return sanitized;
};

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
  const allowedFields = [
    "title",
    "date",
    "code",
    "notes",
    "psalmResponse",
    "entrance",
    "kyrie",
    "gloria",
    "acclamation",
    "gospelOfThePassion",
    "creed",
    "petition",
    "LordsPrayer",
    "offertory",
    "sanctus",
    "peace",
    "agnusDei",
    "holyCommunion",
    "thanksgiving",
    "exit",
    "customOrder",
  ];
  const massData = {};

  // Only include allowed fields from req.body
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      massData[field] = req.body[field];
    }
  });

  let sanitizedMassData;
  try {
    sanitizedMassData = sanitizeMassPayload(massData);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const newMass = await Mass.create(sanitizedMassData);
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
    if (mass.customOrder?.length) {
      for (let section of mass.customOrder) {
        if (section.songId) {
          const song = await Song.findById(section.songId);
          section = { section, ...song };
        }
      }
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
  if (mass.customOrder?.length) {
    for (let section of mass.customOrder) {
      if (section.songId) {
        const song = await Song.findById(section.songId);
        section = { section, ...song };
      }
    }
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
  const allowedUpdates = [
    "title",
    "date",
    "notes",
    "psalmResponse",
    "entrance",
    "kyrie",
    "gloria",
    "acclamation",
    "gospelOfThePassion",
    "creed",
    "petition",
    "LordsPrayer",
    "offertory",
    "sanctus",
    "peace",
    "agnusDei",
    "holyCommunion",
    "thanksgiving",
    "exit",
    // "customOrder",
  ];
  const updates = {};

  // Only include allowed fields from req.body
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "Please provide at least one field to edit." });
  }

  let sanitizedUpdates;
  try {
    sanitizedUpdates = sanitizeMassPayload(updates);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const updated = await Mass.findByIdAndUpdate(id, sanitizedUpdates, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    return res
      .status(404)
      .json({ message: "No mass id matches the one provided." });
  }
  res
    .status(200)
    .json({ mass: updated, message: "Mass successfully updated." });
};

/*
deleteMass
method: DELETE
does: deletes a mass from the mass database
receives: the mass id in the request body
returns: a confirmation message or an error
*/
const deleteMass = async (req, res) => {
  const { id } = req.body;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Check the id. It is either missing or invalid." });
  }
  const deleted = await Mass.findByIdAndDelete(id);
  if (!deleted) {
    return res
      .status(404)
      .json({ message: "No mass id matches the one provided." });
  }
  res.status(200).json({ message: "Mass successfully deleted." });
};

/*
getOrderOfMass
method: GET
does: serves the order of Mass payload
receives: optional language query param
returns: the order of Mass object or a single language branch
*/
const getOrderOfMass = async (req, res) => {
  const { language } = req.query;

  const resolvePath = (obj, path = []) => {
    if (!obj || !Array.isArray(path) || !path.length) return null;
    return path.reduce(
      (acc, currentKey) =>
        acc && typeof acc === "object" ? acc[currentKey] : null,
      obj,
    );
  };

  const enrichLanguageOrder = (languageOrder) => {
    const resolvedFullOrder = fullOrderOfMass.map((entry) => ({
      ...entry,
      detail: entry.detailPath
        ? resolvePath(languageOrder, entry.detailPath)
        : null,
    }));

    return {
      ...languageOrder,
      fullOrderOfMass: resolvedFullOrder,
    };
  };

  if (!language) {
    const byLanguage = Object.keys(orderOfMass).reduce((acc, languageKey) => {
      acc[languageKey] = enrichLanguageOrder(orderOfMass[languageKey]);
      return acc;
    }, {});

    return res.status(200).json({
      ...byLanguage,
      fullOrderOfMass,
    });
  }

  const normalizedLanguage = String(language).toLowerCase();
  const selectedOrder = orderOfMass[normalizedLanguage];

  if (!selectedOrder) {
    return res.status(404).json({
      message: `Unsupported language: ${language}.`,
      availableLanguages: Object.keys(orderOfMass),
    });
  }

  return res.status(200).json({
    language: normalizedLanguage,
    orderOfMass: enrichLanguageOrder(selectedOrder),
  });
};

export default { createMass, queryMass, editMass, deleteMass, getOrderOfMass };
