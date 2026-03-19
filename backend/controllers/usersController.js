import { User } from "../models/usersModel.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import _ from "lodash";

const createUser = async (req, res) => {
  const { username, matricule, password } = req.body;
  if (!username || !matricule || !password) {
    res.status(400).json({ message: "All fields are required." });
  }
  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password too short (< 6 characters)." });
  if (username.length < 3)
    return res
      .status(400)
      .json({ message: "Username too short (< 3 letters)." });

  const duplicateName = await User.findOne({ username });
  if (duplicateName)
    return res.status(409).json({
      message: "username already exists. Try to make your username unique.",
    });

  const duplicateMatricule = await User.findOne({ matricule });
  if (duplicateMatricule)
    return res.status(409).json({
      message: `account with matricule: ${matricule} already exists.`,
    });

  const passWordHash = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username,
    matricule,
    password: passWordHash,
  });
  if (!newUser)
    return res.status(500).json({
      message: "Failed to create account. There's an issue at our end.",
    });
  return res
    .status(201)
    .json({ message: "New user account Created.", user: newUser });
};
const queryUsers = async (req, res) => {
  const {
    id,
    userCode,
    matricule,
    username,
    email,
    phone,
    passport,
    country,
    birthday,
    course,
    left,
    deleted,
    verified
  } = req.query;
  const searchFields = [
    "id",
    "userCode",
    "matricule",
    "username",
    "email",
    "phone",
    "passport",
    "country",
    "birthday",
    "course",
    "left",
    "deleted",
    "verified",
  ];
  if (!_.some(searchFields, Boolean)) {
    return res
      .status(400)
      .json({ message: "Please provide atleast one search parameter." });
  }
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id." });
    }
    const userById = await User.findById(id).select("-password").lean();
    if (!userById) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ user: userById });
  }
  let query = {};
  for (let field of searchFields) {
    if (_.has(req.body, field)) {
      query[field] = req.body[field];
    }
  }
  const users = await User.find(query).select("-password").lean();
  if (!users.length) {
    return res.status(404).json({ message: "No users found." });
  }
  return res.status(200).json({ users });
};
const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Missing user id." });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  const deletedUser = await User.findByIdAndUpdate(id, { deleted: true });
  if (!deleteUser) {
    return res.status(400).json({ message: "Failed to delete." });
  }
  return res
    .status(200)
    .json({ message: "Account deleted succesfully.", user: deletedUser });
};

const updateUser = async (req, res) => {
  const {
    id,
    username,
    role,
    email,
    phone,
    password,
    matricule,
    passport,
    country,
    birthdate,
    course,
    picture,
    left,
  } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User id is required." });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  const updateFields = [
    "username",
    "role",
    "email",
    "phone",
    "password",
    "matricule",
    "passport",
    "country",
    "birthdate",
    "course",
    "picture",
    "left",
  ];
  if (!_.some(updateFields, Boolean)) {
    return res
      .status(400)
      .json({ message: "Provide atleast one field to update." });
  }
  const changes = {};
  for (let field of updateFields) {
    if (!_.has(req.body, field)) continue;
    if (field == "role" && !_.indexOf(["user", "admin"], role)) {
      return res.status(400).json({ messgae: "Invalid role." });
    }
    if (field == "birthdate" && !/^(0|1|2|3)?\d\/(0|1)?\d$/.test(birthdate)) {
      return res.status(400).json({ message: "Invalid date format." });
    }
    if (field == "password") {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password too short." });
      }
      const newPassword = await bcrypt.hash(password, 10);
      changes["password"] = newPassword;
      continue;
    }
    changes[field] = req.body[field];
  }
  const updatedUser = await User.findByIdAndUpdate(id, changes, { new: true });
  if (!updatedUser) {
    return res
      .status(404)
      .json({ message: "Could not find the specified account." });
  }
  return res
    .status(200)
    .json({ user: updatedUser, message: "User successfully updated." });
};

export default { createUser, queryUsers, updateUser, deleteUser };
