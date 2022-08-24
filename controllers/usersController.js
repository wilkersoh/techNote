const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler"); // to catch any unexpected error and pass those on custom error handle
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
	// without send password
	const users = await User.find().select("-password").lean();
	if (!users?.length) {
		return res.status(400).json({ message: "No users found" });
	}

	res.json(users);
});

// @desc Create new user
// @route post /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
	const { username, password, roles } = req.body;

	// Confirm data
	if ((!username, !password || !Array.isArray(roles) || !roles.length)) {
		return res.status(400).json({ message: "All fields are required" });
	}

	// Check for duplicate
	const duplicate = await User.findOne({ username }).lean().exec();

	if (duplicate) {
		return res.status(409).json({ message: "Duplicate username" });
	}

	// Hash password
	const hashPassword = await bcrypt.hash(password, 10); // salt rounds
	const userObject = { username, password: hashPassword, roles };

	// Create and store new user
	const user = await User.create(userObject);

	if (user) {
		res.status(201).json({ message: `New user ${username} created` });
	} else {
		res.status(400).json({ message: `Invalid user data received` });
	}
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
	const { id, username, roles, active, password } = req.body;

	if (
		!id ||
		!username ||
		!Array.isArray(roles) ||
		!roles.length ||
		typeof active !== "boolean"
	) {
		return res.status(400).json({ message: "All fields are required" });
	}

	const user = await User.findById(id).exec();

	if (!user) {
		return res.status(400).json({ message: "User not found" });
	}

	// check for duplicate
	const duplicate = await User.findOne({ username }).lean().exec();

	// All update the original user
	if (duplicate && duplicate?._id.toString() !== id) {
		return res.status(409).json({ message: "Duplicate username" });
	}

	user.username = username;
	user.roles = roles;
	user.active = active;

	if (password) {
		user.password = await bcrypt.hash(password, 10);
	}

	const updateUser = await user.save();

	return res.status(201).json({ message: `Updated user ${username}` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
	const { id } = req.body;

	if (!id) {
		return res.status(400).json({ message: "User ID required" });
	}

	const note = await Note.findOne({ user: id }).lean().exec();

	if (note) {
		return res.status(400).json("User has assigned notes");
	}

	const user = await User.findById(id).exec();

	console.log("user: :>> ", user);
	if (!user) {
		return res.status(400).json({ message: "User not found" });
	}
	const result = await user.deleteOne();

	const reply = `Username ${result.username} with ID ${result._id} deleted`;

	res.json(reply);
});

module.exports = {
	getAllUsers,
	createNewUser,
	updateUser,
	deleteUser,
};
