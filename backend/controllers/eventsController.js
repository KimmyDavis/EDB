import { Event } from "../models/eventsModel.js";
import mongoose from "mongoose";
import _ from "lodash";
import { User } from "../models/usersModel.js";

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
  const searchFields = [
    "eventId",
    "title",
    "startDate",
    "endDate",
    "date",
    "venue",
    "code",
    "theme",
  ];
  if (eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }
    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
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
  if (populateUsers) {
    events = await Promise.all(
      events.map(async (event) => ({
        ...event,
        participants: await User.find({
          _id: { $in: event.participants },
        }).lean(),
      })),
    );
  }
  return res.status(200).json({ events });
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

export { createEvent, getEvents, updateEvent, deleteEvent, joinOrLeaveEvent };
