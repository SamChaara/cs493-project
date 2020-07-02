var express = require("express");
var router = express.Router();

const common = require("../controllers/resources/projectCommon");
var load_controller = require("../controllers/loadController");

// GET View all Loads
router.get("/", load_controller.list_loads);

// POST Create a Load
router.post("/", load_controller.create_load);

// GET View a Load
router.get("/:load_id", load_controller.get_load);

// PATCH Edit a Load
router.patch("/:load_id", load_controller.edit_load);

// DELETE Delete a Load
router.delete("/:load_id", load_controller.delete_load);

module.exports = router;
