var express = require("express");
var router = express.Router();

const common = require("../controllers/resources/projectCommon");
var boat_controller = require("../controllers/boatController");

// GET List all Boats
router.get("/", common.checkJwt, boat_controller.list_boats);

// POST Create a Boat
router.post("/", common.checkJwt, boat_controller.create_boat);

// GET Get a Boat
router.get("/:boat_id", common.checkJwt, boat_controller.get_boat);

// PATCH Edit a Boat
router.patch("/:boat_id", common.checkJwt, boat_controller.edit_boat);

// DELETE Delete a Boat
router.delete("/:boat_id", common.checkJwt, boat_controller.delete_boat);

//PUT Add/Replace a Load on a Boat
router.put("/:boat_id/loads/:load_id", common.checkJwt, boat_controller.add_load);

//DELETE Remove a Load from a Boat
router.delete("/:boat_id/loads/:load_id", common.checkJwt, boat_controller.remove_load);

module.exports = router;
