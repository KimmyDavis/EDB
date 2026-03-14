import { Event } from "../models/eventsModel.js";
import mongoose from "mongoose";
import _ from "lodash";
import { User } from "../models/usersModel.js";
import PDFDocument from "pdfkit";

const sanitizeFilenamePart = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "event";

const createEvent = async (req, res) => {
  const {
    title,
    date,
    participants,
    venue,
    description,
    fee,
    maxParticipants,
    deadline,
    footage,
    theme,
  } = req.body;
  if (!title || !date || !venue) {
    return res
      .status(400)
      .json({ message: "Title, date, and venue are required." });
  }
  // Additional validations can be added here if needed
  const newEvent = await Event.create({
    title,
    date,
    participants: participants ? participants : [],
    venue,
    description,
    fee,
    maxParticipants,
    deadline,
    footage,
    theme,
  });
  if (!newEvent) {
    return res.status(500).json({ message: "Failed to create event." });
  }
  return res
    .status(201)
    .json({ message: "Event created successfully.", event: newEvent });
};

const getEvents = async (req, res) => {
  const {
    eventId,
    title,
    startDate,
    endDate,
    date,
    venue,
    code,
    theme,
    populateUsers,
  } = req.query;
  const shouldPopulateUsers = [true, "true", "1", 1].includes(populateUsers);

  if (eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (shouldPopulateUsers) {
      const participantsList = await User.find({
        _id: { $in: event.participants || [] },
      }).lean();

      return res.status(200).json({
        event: {
          ...event,
          participantsList,
        },
      });
    }

    return res.status(200).json({ event });
  }

  let query = {};
  if (title) query.title = { $regex: title, $options: "i" };
  if (venue) query.venue = { $regex: venue, $options: "i" };
  if (code) query.eventCode = code;
  if (theme) query.theme = theme;
  if (date) {
    query.date = new Date(date);
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const events = await Event.find(query).lean();
  if (!events.length) {
    return res.status(404).json({ message: "No events found." });
  }

  let responseEvents = events;
  if (shouldPopulateUsers) {
    responseEvents = await Promise.all(
      events.map(async (event) => ({
        ...event,
        participantsList: await User.find({
          _id: { $in: event.participants },
        }).lean(),
      })),
    );
  }

  return res.status(200).json({ events: responseEvents });
};

const updateEvent = async (req, res) => {
  const { id } = req.body;
  const allowedUpdates = [
    "title",
    "date",
    "participants",
    "venue",
    "fee",
    "maxParticipants",
    "deadline",
    "footage",
    "theme",
    "description",
  ];
  const updates = {};

  // Only include allowed fields from req.body
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update." });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid event ID." });
  }

  const updatedEvent = await Event.findByIdAndUpdate(id, updates, {
    new: true,
  });
  if (!updatedEvent) {
    return res.status(404).json({ message: "Event not found." });
  }
  return res
    .status(200)
    .json({ message: "Event updated successfully.", event: updatedEvent });
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid event ID." });
  }
  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    return res.status(404).json({ message: "Event not found." });
  }
  return res.status(200).json({ message: "Event deleted successfully." });
};

const joinOrLeaveEvent = async (req, res) => {
  const { userId, eventId, action } = req.body;
  if ((!userId, !action)) {
    return res.status(400).json({ message: "Provide all required fields." });
  }
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(eventId)
  ) {
    return res.status(400).json({ message: "Invalid id." });
  }
  if (!["join", "leave"].includes(action)) {
    return res.status(400).json({ message: "Invalid action type." });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  if (action === "join") {
    if (event.participants?.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User already joined this event." });
    }
    if (event.deadline && new Date(event.deadline) < new Date()) {
      return res.status(400).json({ message: "Signup deadline has passed." });
    }
    if (event.date && new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Event date has passed." });
    }
    if (
      event.maxParticipants &&
      event.participants.length >= event.maxParticipants
    ) {
      return res
        .status(400)
        .json({ message: "Maximum participants exceeded." });
    }
    event.participants.push(userId);
  } else if (action === "leave") {
    if (!event.participants?.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is not a participant of this event." });
    }
    event.participants = event.participants.filter(
      (id) => id.toString() !== userId,
    );
  }

  const updated = await event.save();
  if (!updated) {
    return res.status(500).json({ message: "couldn't update event." });
  }
  return res
    .status(200)
    .json({ message: `User ${action}ed event successfully.`, event });
};

const downloadEventParticipantsPdf = async (req, res) => {
  const { eventId, fields } = req.body;
  console.log(fields);

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "A valid eventId is required." });
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    return res
      .status(400)
      .json({ message: "fields must be a non-empty array and include name." });
  }

  const normalizedFields = [
    ...new Set(fields.map((field) => String(field).trim()).filter(Boolean)),
  ];

  if (!normalizedFields.includes("name")) {
    return res.status(400).json({ message: "name field is required." });
  }

  const selectableUserFields = Object.keys(User.schema.paths).filter(
    (field) => !["__v"].includes(field),
  );
  const invalidFields = normalizedFields.filter(
    (field) => !selectableUserFields.includes(field),
  );

  if (invalidFields.length) {
    return res.status(400).json({
      message: "Some requested fields are invalid.",
      invalidFields,
    });
  }

  const event = await Event.findById(eventId).lean();
  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  const participantIds = Array.isArray(event.participants)
    ? event.participants
    : [];

  if (!participantIds.length) {
    return res
      .status(404)
      .json({ message: "No participants found for event." });
  }

  const projection = normalizedFields.reduce(
    (acc, field) => ({ ...acc, ...{ username: 1, name: 1 }, [field]: 1 }),
    { _id: 1 },
  );
  const users = await User.find(
    {
      _id: { $in: participantIds },
    },
    projection,
  ).lean();
  console.log(projection);

  const usersById = new Map(users.map((user) => [String(user._id), user]));
  const participants = participantIds
    .map((participantId) => usersById.get(String(participantId)))
    .filter(Boolean);

  if (!participants.length) {
    return res.status(404).json({ message: "No participant records found." });
  }

  const missingNameIndex = participants.findIndex(
    (participant) => !String(participant?.name || "").trim(),
  );
  if (missingNameIndex !== -1) {
    return res.status(400).json({
      message: `participant name is missing for participant at row ${missingNameIndex + 1}.`,
    });
  }

  const timestamp = Date.now();
  const generatedDate = new Date(timestamp).toLocaleDateString("en-GB");
  const safeTitle = sanitizeFilenamePart(event.title || "event");
  const filename = `${safeTitle}-${timestamp}.pdf`;

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks = [];
  let responseClosed = false;

  res.on("close", () => {
    responseClosed = true;
  });

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("error", (err) => {
    if (responseClosed || res.headersSent) {
      return;
    }
    return res
      .status(500)
      .json({ message: "Failed to generate PDF.", error: err.message });
  });

  doc.on("end", () => {
    if (responseClosed || res.headersSent) {
      return;
    }

    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.status(200).send(pdfBuffer);
  });

  doc.fontSize(20).text(`Event: ${event.title || "Event"}`);
  doc.moveDown(0.6);
  doc.fontSize(11).text(`Generated on: ${generatedDate}`);
  doc.moveDown(0.5);
  doc.fontSize(11).text(`Participants count: ${participants.length}`);
  doc.moveDown(1);

  doc.font("Helvetica").fontSize(10);

  participants.forEach((participant, index) => {
    const participantName = String(participant.username || "N/A");
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`${index + 1}. ${participantName}`);
    doc.font("Helvetica").fontSize(10);

    normalizedFields.forEach((field) => {
      const value = participant[field];
      const formattedValue =
        value === undefined || value === null ? "N/A" : String(value);
      doc.text(`   - ${field}: ${formattedValue}`);
    });

    doc.moveDown(0.6);
  });

  doc.end();
};

export {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  joinOrLeaveEvent,
  downloadEventParticipantsPdf,
};
