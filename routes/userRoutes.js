const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

/* we already /user from the server.js, so it is just the root for /user */
router
	.route("/")
	.get(usersController.getAllUsers)
	.post(usersController.createNewUser)
	.patch(usersController.updateUser)
	.delete(usersController.deleteUser);

module.exports = router;
