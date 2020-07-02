var express = require("express");
var router = express.Router();

const common = require("../controllers/resources/projectCommon");
var user_controller = require("../controllers/userController");

// GET View all users
router.get("/", user_controller.list_users);

// GET View the logged in user page
router.get("/user", user_controller.get_current_user);

// GET View user specified by user_id
router.get("/:user_id", user_controller.get_user);

/** Update and Delete user not required **/

module.exports = router;
